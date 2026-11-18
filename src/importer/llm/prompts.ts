/**
 * Prompt text for each importer task. Kept separate so it can be tuned
 * against the eval set without touching handler code.
 */

const SHARED_RULES = `
Rules:
- Keep the recipe in its ORIGINAL language (do not translate). Set "language" to its ISO 639-1 code.
- A source may contain several recipes: return each complete recipe as its own entry.
  Ignore recipes that are cut off / only partially visible.
- Ingredients: split each line into
    "name"     = the bare ingredient only, as a short noun phrase ("gingembre", "concombres", "crème fraîche liquide"),
    "quantity" = amount + unit exactly as written ("90 g", "2 c.à.s", "1 1/2 pounds", "3 ou 8"),
    "note"     = everything else: preparation, size, alternatives, weights in brackets
                 ("pelé, 2/3 râpés et 1/3 en rondelles de 3 mm", "standard, ou 8 concombres libanais (650 g)").
  Never put preparation words, brackets or quantities in "name".
  Ingredients written inline in the method text must still be listed.
  Sub-recipes (a dipping sauce, a garlic sauce described in a tip, a topping): list their ingredients with
  "group" set to the sub-recipe name (e.g. "Sauce à l'ail"). Main-recipe ingredients have no group.
  "Sel, poivre" / "salt and pepper" may stay as one ingredient.
- If ingredient quantities are given in a table with several serving-size columns, use ONLY the column
  for 4-6 people (or the closest to 4) and set basePortions to the lower bound of that column (e.g. 4).
- Steps: one entry per step, text as written (you may drop step numbers).
  Set ovenTempC when a step uses the oven (convert °F / "thermostat N" to °C: th. N ≈ N×30 °C).
  Set waitMinutes ONLY for hands-off time where the cook is free: resting, chilling, rising, marinating,
  long unattended simmering (≥ 15 min). Do NOT set it for active cooking (sautéing, stirring, frying, browning)
  or for short durations. Never set it to 0 — omit it instead.
- Times: prepMinutes/cookMinutes/totalMinutes as integers only when written as a time with a unit
  (e.g. "Préparation : 20 min"). Do not interpret unlabelled numbers or icons as times. Omit if unknown.
- Tips: collect cooking tips, the cook's personal notes, serving/pairing advice (incl. wine) and useful
  intro remarks such as make-ahead advice ("Astuce du chef", "Notes:", "L'astuce ..."). Compact long ones
  to one or two sentences. Do NOT put in tips: appliance model numbers or settings ("Robot : 3200"),
  equipment lists, nutrition facts, yield counts, or anything already captured as an ingredient or step.
  If a tip describes a sub-recipe, its ingredients go in "ingredients" (with a group) and the tip keeps
  only a short mention ("Délicieux avec une sauce à l'ail").
- Summary: one or two sentences describing the dish.
- If text is unreadable, write [illegible] in its place rather than guessing.
- Never invent ingredients, quantities or steps that are not in the source.
`.trim();

export const IMAGE_PROMPT = `
You are extracting recipes from a photo (cookbook page, magazine page, or handwritten notebook).
${SHARED_RULES}
`.trim();

export const PDF_PROMPT = `
You are extracting recipes from a PDF document (usually scanned cookbook pages).
${SHARED_RULES}
`.trim();

export const WEBSITE_FALLBACK_PROMPT = `
You are extracting recipes from the text content of a web page. The page has no structured recipe data.
Ignore navigation, ads, comments sections and unrelated content.
If the page contains no recipe, return an empty "recipes" array.
${SHARED_RULES}
`.trim();

export const translatePrompt = (targetLanguage: string) =>
  `
Translate this recipe into ${targetLanguage}. You receive it as JSON.
Rules:
- Return the same structure with the SAME number of ingredients, steps and tips, in the same order
  (ingredients[i] must translate ingredients[i]).
- Translate unit words in quantities to the target language's usual abbreviations
  ("2 c.à.s" → "2 tbsp", "1 c.c." → "1 tsp", "1 pincée" → "1 pinch") but never change the numbers
  and never convert units (grams stay grams, °C stays °C).
- Use natural culinary terms ("faire revenir" → "sauté", "blanchir" → "blanch"); keep dish names that are
  commonly used untranslated (e.g. "clafoutis", "velouté") but make the meaning clear.
- Omit fields that are absent in the input.
`.trim();

export const WEBSITE_ENRICH_PROMPT = `
You are given structured recipe data (schema.org JSON-LD) taken from a web page.
It is the source of truth: do not add or remove ingredients or steps.
Your job is only to normalize it:
- split each ingredient line into name and quantity,
- flag ovenTempC / waitMinutes on steps,
- write a short summary,
- extract any tips found inside the description or steps.
Return exactly one recipe.
${SHARED_RULES}
`.trim();
