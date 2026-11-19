import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service.js';
import { PDF_PROMPT } from '../llm/prompts.js';
import type { HandlerResult, ImportInput, SourceHandler } from './source-handler.js';

@Injectable()
export class PdfHandler implements SourceHandler {
  readonly type = 'pdf' as const;

  constructor(private readonly llm: LlmService) {}

  async extract(input: ImportInput): Promise<HandlerResult> {
    if (input.kind !== 'file') throw new Error('PdfHandler expects a file');

    const { recipes, usage } = await this.llm.extractRecipes('pdf', PDF_PROMPT, {
      attachment: { kind: 'pdf', filename: input.filename, data: input.data },
    });

    return {
      recipes: recipes.map((r) => ({
        ...r,
        images: [],
        source: { type: 'pdf', filename: input.filename },
      })),
      usage: [usage],
    };
  }
}
