import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { LlmService, type LlmUsage } from '../llm/llm.service.js';
import { WEBSITE_ENRICH_PROMPT, WEBSITE_FALLBACK_PROMPT } from '../llm/prompts.js';
import type { ExtractedRecipe, ImportedRecipe } from '../types/imported-recipe.js';
import { findJsonLdRecipe, type JsonLdRecipe } from '../utils/json-ld.js';
import type { HandlerResult, ImportInput, SourceHandler } from './source-handler.js';

const FETCH_TIMEOUT_MS = 15_000;
const MAX_HTML_BYTES = 5 * 1024 * 1024;
/** Page text sent to the fallback model is capped to keep cost predictable. */
const MAX_PAGE_TEXT_CHARS = 60_000;

@Injectable()
export class WebsiteHandler implements SourceHandler {
  readonly type = 'website' as const;
  private readonly logger = new Logger(WebsiteHandler.name);

  constructor(private readonly llm: LlmService) {}

  async extract(input: ImportInput): Promise<HandlerResult> {
    if (input.kind !== 'url') throw new Error('WebsiteHandler expects a url');
    const url = input.url;
    const html = await this.fetchHtml(url);
    const source = { type: 'website' as const, url };

    const jsonLd = findJsonLdRecipe(html);
    if (jsonLd) return this.fromJsonLd(jsonLd, url);

    // No structured data: let a model read the page text.
    const { recipes, usage } = await this.llm.extractRecipes(
      'website-fallback',
      WEBSITE_FALLBACK_PROMPT,
      { text: `URL: ${url}\n\n${htmlToText(html).slice(0, MAX_PAGE_TEXT_CHARS)}` },
    );
    const ogImage = metaContent(html, 'og:image');
    return {
      recipes: recipes.map((r) => ({ ...r, images: ogImage ? [ogImage] : [], source })),
      usage: [usage],
    };
  }

  /** JSON-LD is the source of truth; the model only normalizes and enriches it. */
  private async fromJsonLd(jsonLd: JsonLdRecipe, url: string): Promise<HandlerResult> {
    const source = { type: 'website' as const, url };
    try {
      const { recipes, usage } = await this.llm.extractRecipes(
        'website-enrich',
        WEBSITE_ENRICH_PROMPT,
        { text: JSON.stringify(jsonLd, null, 1) },
      );
      const enriched = recipes[0];
      if (!enriched) throw new Error('model returned no recipe');
      return {
        recipes: [{ ...mergeJsonLdFacts(enriched, jsonLd), images: jsonLd.images, source }],
        usage: [usage],
      };
    } catch (err) {
      // Enrichment is a nice-to-have: fall back to the raw structured data.
      this.logger.warn(`Enrichment failed for ${url}, using raw JSON-LD: ${String(err)}`);
      return { recipes: [jsonLdToImported(jsonLd, url)], usage: [] as LlmUsage[] };
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    let res: Response;
    try {
      res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          // Some recipe sites block obvious bots; identify as a regular browser.
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        },
      });
    } catch (err) {
      throw new BadGatewayException(`Could not reach ${url}: ${String(err)}`);
    }
    if (!res.ok) throw new BadGatewayException(`${url} responded with HTTP ${res.status}`);
    const length = Number(res.headers.get('content-length'));
    if (length > MAX_HTML_BYTES) throw new BadGatewayException(`${url} page is too large`);
    return await res.text();
  }
}

/** Times, portions and the name come straight from JSON-LD — never let the model override them. */
function mergeJsonLdFacts(enriched: ExtractedRecipe, jsonLd: JsonLdRecipe): ExtractedRecipe {
  return {
    ...enriched,
    name: jsonLd.name,
    basePortions: jsonLd.basePortions ?? enriched.basePortions,
    prepMinutes: jsonLd.prepMinutes ?? enriched.prepMinutes,
    cookMinutes: jsonLd.cookMinutes ?? enriched.cookMinutes,
    totalMinutes: jsonLd.totalMinutes ?? enriched.totalMinutes,
    language: jsonLd.language?.slice(0, 2) ?? enriched.language,
  };
}

/** Deterministic, model-free mapping — used when enrichment fails. */
export function jsonLdToImported(jsonLd: JsonLdRecipe, url: string): ImportedRecipe {
  return {
    name: jsonLd.name,
    summary: jsonLd.description,
    language: jsonLd.language?.slice(0, 2) ?? 'und',
    basePortions: jsonLd.basePortions,
    prepMinutes: jsonLd.prepMinutes,
    cookMinutes: jsonLd.cookMinutes,
    totalMinutes: jsonLd.totalMinutes,
    ingredients: jsonLd.ingredients.map((line) => ({ name: line })),
    steps: jsonLd.steps.map((text) => ({ text })),
    tips: [],
    images: jsonLd.images,
    source: { type: 'website', url },
  };
}

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function metaContent(html: string, property: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  return re.exec(html)?.[1];
}
