import { RecipeStatus } from '../../recipes/dto/create-recipe.dto.js';
import type { ImportedRecipe, IngredientMatch } from '../types/imported-recipe.js';

export interface DraftIngredient {
  /** Set when the name matched an existing ingredient — avoids creating duplicates. */
  id?: number;
  /** English name (or the matched DB ingredient's name) — this is what gets saved. */
  name: string;
  /** The name as written in the source, when it differs from `name`. */
  originalName?: string;
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

/** normalizeName + naive singular per word: "Sweet Potatoes" ≈ "sweet potato". */
export function matchKey(name: string): string {
  return normalizeName(name)
    .split(' ')
    .map((w) => {
      if (w.length <= 3 || w.endsWith('ss')) return w;
      if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`;
      if (w.endsWith('oes')) return w.slice(0, -2);
      if (w.endsWith('s')) return w.slice(0, -1);
      return w;
    })
    .join(' ');
}

/**
 * @param matches canonical English name + DB match per ingredient (index-aligned), from
 *   IngredientMatchService. Without it, falls back to the translated name and matchKey.
 */
export function toRecipeDraft(
  recipe: ImportedRecipe,
  existing: { id: number; name: string }[],
  matches?: IngredientMatch[],
): RecipeDraft {
  const byId = new Map(existing.map((i) => [i.id, i]));
  const byKey = new Map(existing.map((i) => [matchKey(i.name), i]));
  const seen = new Set<string>();
  const ingredients: DraftIngredient[] = [];

  recipe.ingredients.forEach((ing, i) => {
    // Quantity / note in English too when the recipe was translated.
    const en = recipe.translation?.ingredients[i];
    const m = matches?.[i];
    const name = (m?.name ?? en?.name ?? ing.name).trim();
    const match =
      (m?.existingId !== undefined ? byId.get(m.existingId) : undefined) ??
      byKey.get(matchKey(name)) ??
      byKey.get(matchKey(ing.name));

    // A recipe links each ingredient once (e.g. garlic in both the dish and its sauce);
    // the per-use quantities are kept in the instructions text.
    const key = match ? `#${match.id}` : matchKey(name);
    if (!key || seen.has(key)) return;
    seen.add(key);

    const savedName = match?.name ?? name;
    ingredients.push({
      ...(match && { id: match.id }),
      name: savedName,
      ...(normalizeName(ing.name) !== normalizeName(savedName) && { originalName: ing.name }),
      quantity: en?.quantity ?? ing.quantity,
      note: en?.note ?? ing.note,
      group: en?.group ?? ing.group,
      isNew: !match,
    });
  });

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
