/**
 * Importer eval: runs extraction (no database) on sample files / URLs and
 * reports what each model found, real token usage and cost.
 *
 *   npm run importer:eval -- <folder | file | url> [...more]
 *
 * Model choice comes from the usual env vars, so comparing models is e.g.
 *   IMPORTER_MODEL_IMAGE=google/gemini-3.6-flash npm run importer:eval -- ~/Recipes
 *
 * Reference answers: put `<sample name>.json` in an `expected/` folder next to
 * the samples, shaped as { recipes: [{ name, ingredients: [{ name, quantity }], steps: [...] }] }.
 * When one exists the run is scored against it.
 *
 * Results are written to importer-eval-results/<timestamp>/ (gitignored).
 */
import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { ImageHandler } from '../handlers/image.handler.js';
import { PdfHandler } from '../handlers/pdf.handler.js';
import type { ImportInput } from '../handlers/source-handler.js';
import { WebsiteHandler } from '../handlers/website.handler.js';
import { ImporterService } from '../importer.service.js';
import { LlmService } from '../llm/llm.service.js';
import { TranslationService } from '../translation.service.js';
import { IngredientsService } from '../../ingredients/ingredients.service.js';
import type { ExtractedRecipe } from '../types/imported-recipe.js';
import { normalizeName } from '../utils/recipe-draft.js';
import { cleanUrl } from '../utils/url.js';

// Extraction never touches the DB, so stub the ingredients lookup.
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [
    ImporterService,
    LlmService,
    TranslationService,
    WebsiteHandler,
    ImageHandler,
    PdfHandler,
    { provide: IngredientsService, useValue: { findAll: async () => [] } },
  ],
})
class EvalModule {}

const SAMPLE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf']);

async function collectTargets(args: string[]): Promise<string[]> {
  const targets: string[] = [];
  for (const arg of args) {
    if (/^https?:\/\//i.test(arg)) targets.push(arg);
    else if ((await stat(arg)).isDirectory()) {
      for (const f of (await readdir(arg)).sort()) {
        if (SAMPLE_EXT.has(extname(f).toLowerCase())) targets.push(join(arg, f));
      }
    } else targets.push(arg);
  }
  return targets;
}

async function toInput(target: string): Promise<ImportInput> {
  if (/^https?:\/\//i.test(target)) return { kind: 'url', url: cleanUrl(target) };
  return {
    kind: 'file',
    filename: basename(target),
    mimeType: 'application/octet-stream', // detectSource sniffs the real type
    data: await readFile(target),
  };
}

interface Expected {
  recipes: Pick<ExtractedRecipe, 'name' | 'ingredients' | 'steps'>[];
}

/** Simple scoring: recipe count, ingredient recall (by name) and quantity accuracy. */
function score(got: ExtractedRecipe[], expected: Expected) {
  let ingExpected = 0;
  let ingFound = 0;
  let qtyCorrect = 0;
  for (const exp of expected.recipes) {
    const match =
      got.find((g) => normalizeName(g.name) === normalizeName(exp.name)) ??
      got[expected.recipes.indexOf(exp)];
    const gotIngs = new Map(
      (match?.ingredients ?? []).map((i) => [normalizeName(i.name), i.quantity ?? '']),
    );
    for (const ing of exp.ingredients) {
      ingExpected++;
      const q = gotIngs.get(normalizeName(ing.name));
      if (q === undefined) continue;
      ingFound++;
      if (normalizeName(q) === normalizeName(ing.quantity ?? '')) qtyCorrect++;
    }
  }
  return {
    recipeCount: `${got.length}/${expected.recipes.length}`,
    ingredientRecall: ingExpected ? +(ingFound / ingExpected).toFixed(2) : null,
    quantityAccuracy: ingExpected ? +(qtyCorrect / ingExpected).toFixed(2) : null,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Usage: npm run importer:eval -- <folder | file | url> [...more]');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(EvalModule, { logger: ['warn', 'error'] });
  const importer = app.get(ImporterService);
  const outDir = join('importer-eval-results', new Date().toISOString().replace(/[:.]/g, '-'));
  await mkdir(outDir, { recursive: true });

  const rows: Record<string, unknown>[] = [];
  let totalCost = 0;

  for (const target of await collectTargets(args)) {
    const name = /^https?:/i.test(target) ? new URL(target).pathname.split('/').filter(Boolean).pop() ?? target : basename(target, extname(target));
    const started = Date.now();
    try {
      const result = await importer.extract(await toInput(target));
      const cost = result.usage.reduce((s, u) => s + (u.cost ?? 0), 0);
      totalCost += cost;

      const expectedPath = /^https?:/i.test(target) ? '' : join(target, '..', 'expected', `${name}.json`);
      const scores = expectedPath && existsSync(expectedPath)
        ? score(result.recipes, JSON.parse(await readFile(expectedPath, 'utf8')) as Expected)
        : {};

      rows.push({
        sample: name,
        source: result.source,
        model: result.usage.map((u) => u.model).join(', ') || '(JSON-LD only)',
        recipes: result.recipes.map((r) => r.name).join(' | '),
        english: result.recipes.map((r) => r.translation?.name ?? (r.language === 'en' ? '(source)' : 'MISSING')).join(' | '),
        ingredients: result.recipes.map((r) => r.ingredients.length).join('+'),
        steps: result.recipes.map((r) => r.steps.length).join('+'),
        tokensIn: result.usage.reduce((s, u) => s + u.promptTokens, 0),
        tokensOut: result.usage.reduce((s, u) => s + u.completionTokens, 0),
        costUsd: +cost.toFixed(5),
        seconds: +((Date.now() - started) / 1000).toFixed(1),
        ...scores,
      });
      await writeFile(join(outDir, `${name}.json`), JSON.stringify(result, null, 2));
    } catch (err) {
      rows.push({ sample: name, error: err instanceof Error ? err.message : String(err) });
    }
  }

  console.table(rows);
  console.log(`Total cost: $${totalCost.toFixed(4)} — full results in ${outDir}`);
  await app.close();
}

await main();
