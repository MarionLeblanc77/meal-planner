import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmService, type LlmUsage } from './llm/llm.service.js';
import { translatePrompt } from './llm/prompts.js';
import {
  RecipeTranslationSchema,
  type ExtractedRecipe,
  type RecipeTranslation,
} from './types/imported-recipe.js';

/**
 * Translates imported recipes once, at creation (team decision 2026-09-17).
 * Translations are flagged `machineTranslated` so the UI can ask the user to validate them.
 * A failed translation never fails the import.
 */
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  readonly targetLanguage: string;

  constructor(
    private readonly llm: LlmService,
    config: ConfigService,
  ) {
    this.targetLanguage = (config.get<string>('IMPORTER_TRANSLATE_TO') ?? 'en').toLowerCase();
  }

  needsTranslation(recipe: Pick<ExtractedRecipe, 'language'>): boolean {
    return recipe.language.slice(0, 2).toLowerCase() !== this.targetLanguage;
  }

  async translate(
    recipe: ExtractedRecipe,
  ): Promise<{ translation?: RecipeTranslation; usage?: LlmUsage }> {
    if (!this.needsTranslation(recipe)) return {};

    const payload = {
      name: recipe.name,
      summary: recipe.summary,
      ingredients: recipe.ingredients.map(({ name, quantity, note, group }) => ({
        name,
        quantity,
        note,
        group,
      })),
      steps: recipe.steps.map(({ text }) => ({ text })),
      tips: recipe.tips,
    };

    try {
      const { data, usage } = await this.llm.structured(
        'translate',
        RecipeTranslationSchema,
        'recipe_translation',
        translatePrompt(languageName(this.targetLanguage)),
        { text: JSON.stringify(payload) },
      );
      assertAligned(recipe, data);
      return {
        translation: { ...data, language: this.targetLanguage, machineTranslated: true },
        usage,
      };
    } catch (err) {
      this.logger.warn(`Translation of "${recipe.name}" failed, keeping original only: ${String(err)}`);
      return {};
    }
  }
}

function assertAligned(
  original: ExtractedRecipe,
  t: { ingredients: unknown[]; steps: unknown[]; tips: unknown[] },
) {
  const mismatch = (['ingredients', 'steps', 'tips'] as const).filter(
    (k) => original[k].length !== t[k].length,
  );
  if (mismatch.length) {
    throw new Error(`translation is not aligned with the original (${mismatch.join(', ')})`);
  }
}

function languageName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}
