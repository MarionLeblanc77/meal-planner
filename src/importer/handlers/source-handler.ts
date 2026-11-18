import type { LlmUsage } from '../llm/llm.service.js';
import type { ImportedRecipe, SourceType } from '../types/imported-recipe.js';

export type ImportInput =
  | { kind: 'url'; url: string }
  | { kind: 'file'; filename: string; mimeType: string; data: Buffer };

export interface HandlerResult {
  recipes: ImportedRecipe[];
  /** One entry per model call — lets us track real cost per import. */
  usage: LlmUsage[];
}

export interface SourceHandler {
  readonly type: SourceType;
  extract(input: ImportInput): Promise<HandlerResult>;
}
