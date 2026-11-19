import { Injectable, Logger } from '@nestjs/common';
import { LlmService, type LlmUsage } from './llm/llm.service.js';
import { INGREDIENT_MATCH_PROMPT } from './llm/prompts.js';
import {
  IngredientMatchSchema,
  type ImportedRecipe,
  type IngredientMatch,
} from './types/imported-recipe.js';

/**
 * Gives every imported ingredient a canonical English name and links it to an existing
 * DB ingredient when one is the same thing (plural, synonym, other language).
 * Returns undefined on failure — toRecipeDraft then falls back to name-based matching.
 */
@Injectable()
export class IngredientMatchService {
  private readonly logger = new Logger(IngredientMatchService.name);

  constructor(private readonly llm: LlmService) {}

  async match(
    recipe: ImportedRecipe,
    existing: { id: number; name: string }[],
  ): Promise<{ matches?: IngredientMatch[]; usage?: LlmUsage }> {
    if (!recipe.ingredients.length) return { matches: [] };

    const payload = {
      ingredients: recipe.ingredients.map((ing, index) => ({
        index,
        name: ing.name,
        english: recipe.translation?.ingredients[index]?.name,
      })),
      existing: existing.map(({ id, name }) => ({ id, name })),
    };

    try {
      const { data, usage } = await this.llm.structured(
        'ingredient-match',
        IngredientMatchSchema,
        'ingredient_match',
        INGREDIENT_MATCH_PROMPT,
        { text: JSON.stringify(payload) },
      );
      const validIds = new Set(existing.map((e) => e.id));
      const byIndex = new Map(data.ingredients.map((m) => [m.index, m]));
      const matches = recipe.ingredients.map((ing, i): IngredientMatch => {
        const m = byIndex.get(i);
        // A missing entry keeps the best name we have; an invented id is dropped.
        if (!m) return { name: recipe.translation?.ingredients[i]?.name ?? ing.name };
        return {
          name: m.name.trim(),
          existingId: m.existingId !== undefined && validIds.has(m.existingId) ? m.existingId : undefined,
        };
      });
      return { matches, usage };
    } catch (err) {
      this.logger.warn(`Ingredient matching for "${recipe.name}" failed, using name matching: ${String(err)}`);
      return {};
    }
  }
}
