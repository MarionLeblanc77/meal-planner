import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { IngredientsService } from '../ingredients/ingredients.service.js';
import type { LlmUsage } from './llm/llm.service.js';
import { ImageHandler } from './handlers/image.handler.js';
import { PdfHandler } from './handlers/pdf.handler.js';
import { WebsiteHandler } from './handlers/website.handler.js';
import type { ImportInput, SourceHandler } from './handlers/source-handler.js';
import type { ImportedRecipe, SourceType } from './types/imported-recipe.js';
import { IngredientMatchService } from './ingredient-match.service.js';
import { TranslationService } from './translation.service.js';
import { detectSource } from './utils/detect-source.js';
import { toRecipeDraft, type RecipeDraft } from './utils/recipe-draft.js';
import { cleanUrl, isLoginWalled } from './utils/url.js';

export interface ImportResult {
  source: SourceType;
  /** One per recipe found — a single page can hold several. */
  recipes: { imported: ImportedRecipe; draft: RecipeDraft }[];
  usage: LlmUsage[];
}

@Injectable()
export class ImporterService {
  private readonly handlers: Record<SourceType, SourceHandler>;

  constructor(
    website: WebsiteHandler,
    image: ImageHandler,
    pdf: PdfHandler,
    private readonly ingredients: IngredientsService,
    private readonly translation: TranslationService,
    private readonly ingredientMatch: IngredientMatchService,
  ) {
    this.handlers = { website, image, pdf };
  }

  async importFromUrl(rawUrl: string): Promise<ImportResult> {
    let url: string;
    try {
      url = cleanUrl(rawUrl);
    } catch {
      throw new BadRequestException(`"${rawUrl}" is not a valid URL`);
    }
    if (!/^https?:$/.test(new URL(url).protocol)) {
      throw new BadRequestException('Only http(s) URLs can be imported');
    }
    if (isLoginWalled(url)) {
      throw new UnprocessableEntityException(
        'This site requires a login, so the recipe cannot be read automatically. ' +
          'Paste the caption text or upload a screenshot instead.',
      );
    }
    return this.run({ kind: 'url', url });
  }

  async importFromFile(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
  }): Promise<ImportResult> {
    return this.run({
      kind: 'file',
      filename: file.originalname,
      mimeType: file.mimetype,
      data: file.buffer,
    });
  }

  /** Runs extraction only (no DB) — used by the eval script. */
  async extract(input: ImportInput) {
    const detected = detectSource(input);
    if (detected.type === 'unsupported') {
      throw new UnsupportedMediaTypeException(detected.reason);
    }
    const result = await this.handlers[detected.type].extract(input);

    // Translate once at creation (in parallel; failures leave the original only).
    const translated = await Promise.all(
      result.recipes.map(async (recipe) => {
        const { translation, usage } = await this.translation.translate(recipe);
        return { recipe: translation ? { ...recipe, translation } : recipe, usage };
      }),
    );

    return {
      source: detected.type,
      recipes: translated.map((t) => t.recipe),
      usage: [
        ...result.usage,
        ...translated.flatMap((t) => (t.usage ? [t.usage] : [])),
      ],
    };
  }

  private async run(input: ImportInput): Promise<ImportResult> {
    const { source, recipes, usage } = await this.extract(input);
    if (!recipes.length) {
      throw new UnprocessableEntityException('No recipe was found in this source.');
    }
    const existing = await this.ingredients.findAll();
    const matched = await Promise.all(
      recipes.map((recipe) => this.ingredientMatch.match(recipe, existing)),
    );
    return {
      source,
      recipes: recipes.map((imported, i) => ({
        imported,
        draft: toRecipeDraft(imported, existing, matched[i].matches),
      })),
      usage: [...usage, ...matched.flatMap((m) => (m.usage ? [m.usage] : []))],
    };
  }
}
