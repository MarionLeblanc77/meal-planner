/**
 * Reads schema.org Recipe data embedded in a web page as JSON-LD.
 * Handles quirks seen on real sites:
 *  - Recipe nested in an @graph alongside other nodes (WordPress/Yoast/WPRM)
 *  - @type given as an array
 *  - image given as an {"@id"} reference to an ImageObject elsewhere in the graph
 *  - recipeYield as an array (["8", "8 Servings"])
 *  - junk "0  " prefix on ingredient strings (lavieclaire.com)
 *  - instructions as string, string[], HowToStep[] or HowToSection[]
 */

export interface JsonLdRecipe {
  name: string;
  description?: string;
  language?: string;
  basePortions?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  totalMinutes?: number;
  ingredients: string[];
  steps: string[];
  images: string[];
}

type Node = Record<string, any>;

const SCRIPT_RE =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

export function extractJsonLdNodes(html: string): Node[] {
  const nodes: Node[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(walk);
    if (value && typeof value === 'object') {
      const node = value as Node;
      nodes.push(node);
      if (node['@graph']) walk(node['@graph']);
    }
  };
  for (const match of html.matchAll(SCRIPT_RE)) {
    try {
      walk(JSON.parse(match[1].trim()));
    } catch {
      // Malformed block — skip it, other blocks may still be fine.
    }
  }
  return nodes;
}

const hasType = (node: Node, type: string) =>
  ([] as unknown[]).concat(node['@type'] ?? []).includes(type);

export function findJsonLdRecipe(html: string): JsonLdRecipe | null {
  const nodes = extractJsonLdNodes(html);
  const recipe = nodes.find((n) => hasType(n, 'Recipe'));
  if (!recipe || typeof recipe.name !== 'string') return null;

  const byId = new Map(
    nodes.filter((n) => typeof n['@id'] === 'string').map((n) => [n['@id'], n]),
  );

  return {
    name: decodeEntities(recipe.name.trim()),
    description: asText(recipe.description),
    language: asText(recipe.inLanguage),
    basePortions: parseYield(recipe.recipeYield),
    prepMinutes: isoDurationToMinutes(recipe.prepTime),
    cookMinutes: isoDurationToMinutes(recipe.cookTime),
    totalMinutes: isoDurationToMinutes(recipe.totalTime),
    ingredients: ([] as unknown[])
      .concat(recipe.recipeIngredient ?? [])
      .map((i) => cleanIngredientLine(String(i)))
      .filter(Boolean),
    steps: flattenInstructions(recipe.recipeInstructions),
    images: resolveImages(recipe.image, byId),
  };
}

/** "PT1H15M" → 75. Returns undefined for missing/invalid values. */
export function isoDurationToMinutes(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(value.trim());
  if (!m || value.trim().toUpperCase() === 'P' || value.trim().toUpperCase() === 'PT') {
    return undefined;
  }
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0));
  const total = d * 1440 + h * 60 + min + Math.round(s / 60);
  return total > 0 ? total : undefined;
}

/** "4", 4, ["8", "8 Servings"], "4-6 personnes" → first integer found (lower bound of a range). */
export function parseYield(value: unknown): number | undefined {
  for (const v of ([] as unknown[]).concat(value ?? [])) {
    const n = /\d+/.exec(String(v));
    if (n && Number(n[0]) > 0) return Number(n[0]);
  }
  return undefined;
}

/** Strips the "0  " junk prefix some sites emit and normalizes whitespace. */
export function cleanIngredientLine(line: string): string {
  return decodeEntities(line)
    .replace(/^0\s{2,}/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function flattenInstructions(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return value
      .split(/\r?\n+/)
      .map((s) => stripTags(s).trim())
      .filter(Boolean);
  }
  if (Array.isArray(value)) return value.flatMap(flattenInstructions);
  if (typeof value === 'object') {
    const node = value as Node;
    if (node.itemListElement) return flattenInstructions(node.itemListElement); // HowToSection
    if (node.text) return flattenInstructions(String(node.text)); // HowToStep
    if (node.name) return flattenInstructions(String(node.name));
  }
  return [];
}

function resolveImages(value: unknown, byId: Map<string, Node>): string[] {
  const urls = new Set<string>();
  const visit = (v: unknown) => {
    if (!v) return;
    if (typeof v === 'string') return void urls.add(v);
    if (Array.isArray(v)) return v.forEach(visit);
    if (typeof v === 'object') {
      const node = v as Node;
      if (node.url || node.contentUrl) return visit(node.url ?? node.contentUrl);
      const ref = node['@id'] && byId.get(node['@id']);
      if (ref && ref !== node) visit(ref);
    }
  };
  visit(value);
  return [...urls].filter((u) => /^https?:\/\//.test(u));
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim()
    ? decodeEntities(stripTags(value).trim())
    : undefined;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}
