import { RecipeStatus } from '../../recipes/dto/create-recipe.dto.js';
import type { ImportedRecipe } from '../types/imported-recipe.js';

export interface DraftIngredient {
  /** Set when the name matched an existing ingredient — avoids creating duplicates. */
  id?: number;
  name: string;
  quantity?: string;
  note?: string;
  group?: string;
  isNew: boolean;
}

/**
 * What the frontend shows for review and then POSTs to /recipes.
 * Shaped like CreateRecipeDto (+ display-only fields).
 */
export interface RecipeDraft {
  name: string;
  instructions: string;
  basePortions?: number;
  status: RecipeStatus;
  ingredients: DraftIngredient[];
  /** Machine translation of name + instructions — flagged for user validation. */
  translation?: {
    language: string;
    name: string;
    instructions: string;
    machineTranslated: true;
  };
}

/** The text parts of a recipe, in any language. */
interface RecipeText {
  language: string;
  ingredients: { name: string; quantity?: string; note?: string; group?: string }[];
  steps: { text: string; ovenTempC?: number; waitMinutes?: number }[];
  tips: string[];
}

const LABELS = {
  fr: { ingredients: 'Ingrédients', steps: 'Étapes', tips: 'Astuces', oven: 'four', wait: 'attente' },
  en: { ingredients: 'Ingredients', steps: 'Steps', tips: 'Tips', oven: 'oven', wait: 'wait' },
};

/**
 * Until the schema has structured steps/tips (and quantities on the join table),
 * everything is flattened into the single `instructions` text column.
 * The ingredient list with quantities is included there so quantities are not lost on save.
 */
export function flattenInstructions(recipe: RecipeText): string {
  const l = recipe.language.startsWith('fr') ? LABELS.fr : LABELS.en;
  const sections: string[] = [];

  const hasDetail = recipe.ingredients.some((i) => i.quantity || i.note || i.group);
  if (hasDetail) {
    const line = (i: RecipeText['ingredients'][number]) =>
      `- ${i.quantity ? `${i.quantity} ` : ''}${i.name}${i.note ? ` (${i.note})` : ''}`;
    const main = recipe.ingredients.filter((i) => !i.group);
    const groups = [...new Set(recipe.ingredients.map((i) => i.group).filter(Boolean))] as string[];
    const parts = [`${l.ingredients}:\n${main.map(line).join('\n')}`];
    for (const g of groups) {
      parts.push(`${g}:\n${recipe.ingredients.filter((i) => i.group === g).map(line).join('\n')}`);
    }
    sections.push(parts.join('\n\n'));
  }

  if (recipe.steps.length) {
    sections.push(
      `${l.steps}:\n` +
        recipe.steps
          .map((s, n) => {
            const flags = [
              s.ovenTempC !== undefined ? `${l.oven} ${s.ovenTempC}°C` : '',
              s.waitMinutes !== undefined ? `${l.wait} ${s.waitMinutes} min` : '',
            ].filter(Boolean);
            return `${n + 1}. ${s.text}${flags.length ? ` [${flags.join(', ')}]` : ''}`;
          })
          .join('\n'),
    );
  }

  if (recipe.tips.length) {
    sections.push(`${l.tips}:\n` + recipe.tips.map((t) => `- ${t}`).join('\n'));
  }

  return sections.join('\n\n');
}

/** Lowercase, strip accents and punctuation: "Crème fraîche" ≈ "creme fraiche". */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function toRecipeDraft(
  recipe: ImportedRecipe,
  existing: { id: number; name: string }[],
): RecipeDraft {
  const byName = new Map(existing.map((i) => [normalizeName(i.name), i]));
  const seen = new Set<string>();
  const ingredients: DraftIngredient[] = [];

  for (const ing of recipe.ingredients) {
    const key = normalizeName(ing.name);
    // A recipe links each ingredient once (e.g. garlic in both the dish and its sauce);
    // the per-use quantities are kept in the instructions text.
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const match = byName.get(key);
    const detail = { quantity: ing.quantity, note: ing.note, group: ing.group };
    ingredients.push(
      match
        ? { id: match.id, name: match.name, ...detail, isNew: false }
        : { name: ing.name, ...detail, isNew: true },
    );
  }

  const t = recipe.translation;
  return {
    name: recipe.name,
    instructions: flattenInstructions(recipe),
    basePortions: recipe.basePortions,
    status: RecipeStatus.Totry,
    ingredients,
    translation: t && {
      language: t.language,
      name: t.name,
      instructions: flattenInstructions({
        language: t.language,
        ingredients: t.ingredients,
        // Translated text, original oven/wait flags (index-aligned).
        steps: t.steps.map((s, i) => ({ ...recipe.steps[i], text: s.text })),
        tips: t.tips,
      }),
      machineTranslated: true,
    },
  };
}
