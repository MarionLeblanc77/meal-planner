import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service.js';
import { IMAGE_PROMPT } from '../llm/prompts.js';
import { sniffMimeType } from '../utils/detect-source.js';
import type { HandlerResult, ImportInput, SourceHandler } from './source-handler.js';

@Injectable()
export class ImageHandler implements SourceHandler {
  readonly type = 'image' as const;

  constructor(private readonly llm: LlmService) {}

  async extract(input: ImportInput): Promise<HandlerResult> {
    if (input.kind !== 'file') throw new Error('ImageHandler expects a file');

    // Sent at original resolution — the provider downsizes if needed.
    // The routing config's maxFileBytes guards provider upload limits.
    const { recipes, usage } = await this.llm.extractRecipes('image', IMAGE_PROMPT, {
      attachment: {
        kind: 'image',
        mimeType: sniffMimeType(input.data) ?? input.mimeType,
        data: input.data,
      },
    });

    return {
      recipes: recipes.map((r) => ({
        ...r,
        images: [], // TODO: crop the dish photo out of the page (see docs/Ai-Features.md "pictures").
        source: { type: 'image', filename: input.filename },
      })),
      usage: [usage],
    };
  }
}
