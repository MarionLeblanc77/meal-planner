import { Injectable, Logger, PayloadTooLargeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';
import type { ChatContentItems, PDFParserEngine } from '@openrouter/sdk/models';
import { z } from 'zod';
import {
  ExtractionResultSchema,
  type ExtractedRecipe,
} from '../types/imported-recipe.js';
import { resolveRoute, type ImporterTask } from './model-routing.config.js';

export interface LlmUsage {
  task: ImporterTask;
  model: string;
  promptTokens: number;
  completionTokens: number;
  /** USD, as reported by OpenRouter. */
  cost?: number;
}

export interface ExtractionOutput {
  recipes: ExtractedRecipe[];
  usage: LlmUsage;
}

export type LlmAttachment =
  | { kind: 'image'; mimeType: string; data: Buffer }
  | { kind: 'pdf'; filename: string; data: Buffer };

export interface LlmInput {
  text?: string;
  attachment?: LlmAttachment;
}

export class LlmExtractionError extends Error {}

const jsonSchemaCache = new WeakMap<z.ZodType, Record<string, unknown>>();
function toJsonSchema(schema: z.ZodType): Record<string, unknown> {
  let js = jsonSchemaCache.get(schema);
  if (!js) {
    js = z.toJSONSchema(schema, { target: 'draft-7' }) as Record<string, unknown>;
    jsonSchemaCache.set(schema, js);
  }
  return js;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly client: OpenRouter;
  private readonly pdfEngine: PDFParserEngine;

  constructor(config: ConfigService) {
    this.client = new OpenRouter({
      apiKey: config.getOrThrow<string>('OPENROUTER_API_KEY'),
    });
    this.pdfEngine = config.get<PDFParserEngine>('IMPORTER_PDF_ENGINE') ?? 'native';
  }

  /** Extracts recipes from text / an image / a PDF with the model routed for `task`. */
  async extractRecipes(
    task: ImporterTask,
    instructions: string,
    input: LlmInput,
  ): Promise<ExtractionOutput> {
    const { data, usage } = await this.structured(
      task,
      ExtractionResultSchema,
      'recipe_extraction',
      instructions,
      input,
    );
    return { recipes: data.recipes.map(sanitizeRecipe), usage };
  }

  /** Sends a prompt and returns JSON validated against `schema`. */
  async structured<S extends z.ZodType>(
    task: ImporterTask,
    schema: S,
    schemaName: string,
    instructions: string,
    input: LlmInput,
  ): Promise<{ data: z.infer<S>; usage: LlmUsage }> {
    const route = resolveRoute(task);

    if (input.attachment && input.attachment.data.byteLength > route.maxFileBytes) {
      throw new PayloadTooLargeException(
        `File is ${(input.attachment.data.byteLength / 1024 / 1024).toFixed(1)} MB; ` +
          `model ${route.model} accepts at most ${(route.maxFileBytes / 1024 / 1024).toFixed(0)} MB.`,
      );
    }

    const content: ChatContentItems[] = [{ type: 'text', text: instructions }];
    if (input.text) content.push({ type: 'text', text: input.text });
    if (input.attachment) content.push(toContentItem(input.attachment));

    const result = await this.client.chat.send({
      chatRequest: {
        model: route.model,
        messages: [{ role: 'user', content }],
        temperature: 0,
        // PDFs: 'native' passes pages to the model (works for scans);
        // 'mistral-ocr' / 'pdf-text' are alternatives to compare in the eval.
        plugins:
          input.attachment?.kind === 'pdf'
            ? [{ id: 'file-parser', pdf: { engine: this.pdfEngine } }]
            : undefined,
        responseFormat: {
          type: 'json_schema',
          jsonSchema: {
            name: schemaName,
            // Not strict: strict mode rejects optional fields on some providers.
            // The zod check below is the real guarantee.
            strict: false,
            schema: toJsonSchema(schema),
          },
        },
      },
    });

    const usage: LlmUsage = {
      task,
      model: result.model,
      promptTokens: result.usage?.promptTokens ?? 0,
      completionTokens: result.usage?.completionTokens ?? 0,
      cost: result.usage?.cost ?? undefined,
    };
    this.logger.log(
      `${task} via ${usage.model}: ${usage.promptTokens} in / ${usage.completionTokens} out` +
        (usage.cost !== undefined ? `, $${usage.cost.toFixed(5)}` : ''),
    );

    const raw = messageText(result.choices[0]?.message?.content);
    let json: unknown;
    try {
      json = JSON.parse(stripCodeFence(raw));
    } catch {
      throw new LlmExtractionError(`Model ${usage.model} did not return JSON: ${raw.slice(0, 200)}`);
    }
    const parsed = schema.safeParse(dropNulls(json));
    if (!parsed.success) {
      throw new LlmExtractionError(
        `Model ${usage.model} returned invalid ${schemaName}: ${parsed.error.message}`,
      );
    }
    return { data: parsed.data, usage };
  }
}

/** Code-side guard for rules models don't always follow. */
export function sanitizeRecipe(recipe: ExtractedRecipe): ExtractedRecipe {
  const { prepMinutes, cookMinutes } = recipe;
  return {
    ...recipe,
    // Models only report totals that are written down; derive the obvious case.
    totalMinutes:
      recipe.totalMinutes ??
      (prepMinutes !== undefined && cookMinutes !== undefined ? prepMinutes + cookMinutes : undefined),
    ingredients: recipe.ingredients.map((i) => ({
      ...i,
      note: i.note?.trim() || undefined,
      group: i.group?.trim() || undefined,
    })),
    steps: recipe.steps.map((s) => ({
      text: s.text,
      ovenTempC: s.ovenTempC !== undefined && s.ovenTempC > 0 ? s.ovenTempC : undefined,
      waitMinutes: s.waitMinutes !== undefined && s.waitMinutes > 0 ? s.waitMinutes : undefined,
    })),
  };
}

function toContentItem(att: LlmAttachment): ChatContentItems {
  const base64 = att.data.toString('base64');
  if (att.kind === 'image') {
    return {
      type: 'image_url',
      imageUrl: { url: `data:${att.mimeType};base64,${base64}`, detail: 'high' },
    };
  }
  return {
    type: 'file',
    file: { filename: att.filename, fileData: `data:application/pdf;base64,${base64}` },
  };
}

function messageText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((c) => (c && typeof c === 'object' && 'text' in c ? String(c.text) : ''))
      .join('');
  }
  return '';
}

/** Models often send `null` for fields they can't fill; our schema expects them omitted. */
export function dropNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(dropNulls);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, dropNulls(v)]),
    );
  }
  return value;
}

function stripCodeFence(s: string): string {
  return s.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
}
