import { z } from 'zod';

/**
 * The one normalized shape every source handler produces.
 * It is a *draft*: the user reviews it before it is saved via RecipesService.
 */
export const SourceTypeSchema = z.enum(['website', 'image', 'pdf']);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const ImportedIngredientSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe('Bare ingredient name only, no preparation or quantity, e.g. "gingembre"'),
  quantity: z
    .string()
    .optional()
    .describe('Amount + unit as written, e.g. "200 g", "2 c.à.s", "1/2"'),
  note: z
    .string()
    .optional()
    .describe('Preparation / alternatives, e.g. "pelé, râpé grossièrement"'),
  group: z
    .string()
    .optional()
    .describe('Sub-recipe this ingredient belongs to, e.g. "Sauce à l\'ail". Omit for the main recipe'),
});

export const ImportedStepSchema = z.object({
  text: z.string().min(1),
  ovenTempC: z
    .number()
    .optional()
    .describe('Oven temperature in °C if this step uses the oven'),
  waitMinutes: z
    .number()
    .optional()
    .describe('Passive, hands-off time in minutes (resting, chilling, rising, marinating). Omit for active cooking'),
});

/** What the model is asked to return for one recipe. */
export const ExtractedRecipeSchema = z.object({
  name: z.string().min(1),
  summary: z.string().optional().describe('One or two sentence overview'),
  language: z.string().describe('ISO 639-1 code of the source text, e.g. "fr"'),
  basePortions: z.number().int().positive().optional(),
  prepMinutes: z.number().int().nonnegative().optional(),
  cookMinutes: z.number().int().nonnegative().optional(),
  totalMinutes: z.number().int().nonnegative().optional(),
  ingredients: z.array(ImportedIngredientSchema),
  steps: z.array(ImportedStepSchema),
  tips: z
    .array(z.string())
    .describe('Cooking tips, personal notes, serving/pairing advice — compacted if long'),
});

/** What the model returns for one source (a page can hold several recipes). */
export const ExtractionResultSchema = z.object({
  recipes: z.array(ExtractedRecipeSchema),
});

export type ExtractedRecipe = z.infer<typeof ExtractedRecipeSchema>;

export interface ImportSource {
  type: SourceType;
  url?: string;
  filename?: string;
}

/**
 * A translation of a recipe's text. Arrays are index-aligned with the original
 * (ingredients[i] translates original.ingredients[i]).
 */
export const RecipeTranslationSchema = z.object({
  name: z.string().min(1),
  summary: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.string().optional().describe('Translate unit words only, keep numbers'),
      note: z.string().optional(),
      group: z.string().optional(),
    }),
  ),
  steps: z.array(z.object({ text: z.string().min(1) })),
  tips: z.array(z.string()),
});

export type RecipeTranslation = z.infer<typeof RecipeTranslationSchema> & {
  language: string;
  /** Per team decision: machine translations are flagged for user validation. */
  machineTranslated: true;
};

export interface ImportedRecipe extends ExtractedRecipe {
  images: string[];
  source: ImportSource;
  /** Present when the source language differs from the target language. */
  translation?: RecipeTranslation;
}

/** Output of the ingredient-match step, one entry per recipe ingredient (by index). */
export const IngredientMatchSchema = z.object({
  ingredients: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      name: z
        .string()
        .min(1)
        .describe('Canonical English name: lowercase, singular, generic, e.g. "sweet potato"'),
      existingId: z
        .number()
        .int()
        .optional()
        .describe('id of the matching existing ingredient; omit when none matches'),
    }),
  ),
});

/** Canonical English name per recipe ingredient (index-aligned), plus its DB match if any. */
export interface IngredientMatch {
  name: string;
  existingId?: number;
}
