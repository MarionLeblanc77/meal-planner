import 'reflect-metadata'; // decorated DTOs / Nest services are imported below
import { RecipeStatus } from '../../recipes/dto/create-recipe.dto.js';
import { dropNulls, sanitizeRecipe } from '../llm/llm.service.js';
import { resolveRoute } from '../llm/model-routing.config.js';
import type { ImportedRecipe } from '../types/imported-recipe.js';
import { detectSource, sniffMimeType } from './detect-source.js';
import { flattenInstructions, normalizeName, toRecipeDraft } from './recipe-draft.js';
import { cleanUrl, isLoginWalled } from './url.js';

describe('url', () => {
  it('strips tracking params from the test URLs', () => {
    expect(
      cleanUrl(
        'https://www.lavieclaire.com/recettes/choux/?utm_source=Pinterest&utm_medium=organic&utm_campaign=boxrecette',
      ),
    ).toBe('https://www.lavieclaire.com/recettes/choux/');
    expect(cleanUrl('https://www.instagram.com/p/DAi6hXXobFd/?epik=dj0yJnU9')).toBe(
      'https://www.instagram.com/p/DAi6hXXobFd/',
    );
    expect(cleanUrl('https://x.com/r?id=3&utm_source=a#comments')).toBe('https://x.com/r?id=3');
  });

  it('flags login-walled hosts', () => {
    expect(isLoginWalled('https://www.instagram.com/p/abc/')).toBe(true);
    expect(isLoginWalled('https://www.aspicyperspective.com/chips/')).toBe(false);
  });
});

describe('detectSource', () => {
  const file = (bytes: number[] | string) => ({
    kind: 'file' as const,
    filename: 'x',
    mimeType: 'application/octet-stream',
    data: typeof bytes === 'string' ? Buffer.from(bytes, 'latin1') : Buffer.from(bytes),
  });

  it('sniffs real bytes, not the declared mime type', () => {
    expect(sniffMimeType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(detectSource(file('%PDF-1.7'))).toEqual({ type: 'pdf', mimeType: 'application/pdf' });
    expect(detectSource(file([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toEqual({
      type: 'image',
      mimeType: 'image/png',
    });
    expect(detectSource({ kind: 'url', url: 'https://a.b' })).toEqual({ type: 'website' });
  });

  it('rejects HEIC and unknown files with a reason', () => {
    expect(detectSource(file('\0\0\0\x18ftypheic'))).toMatchObject({ type: 'unsupported' });
    expect(detectSource(file('hello'))).toMatchObject({ type: 'unsupported' });
  });
});

describe('resolveRoute', () => {
  it('uses defaults, overridable from env', () => {
    expect(resolveRoute('image', {}).model).toBe('anthropic/claude-sonnet-5.5');
    expect(
      resolveRoute('image', {
        IMPORTER_MODEL_IMAGE: 'google/gemini-3.6-flash',
        IMPORTER_MAX_BYTES_IMAGE: '1000',
      }),
    ).toEqual({ model: 'google/gemini-3.6-flash', maxFileBytes: 1000 });
  });
});

describe('dropNulls', () => {
  it('removes null fields at any depth', () => {
    expect(dropNulls({ a: null, b: [{ c: null, d: 1 }] })).toEqual({ b: [{ d: 1 }] });
  });
});

describe('sanitizeRecipe', () => {
  it('drops zero/negative wait and oven values and blank notes', () => {
    const r = sanitizeRecipe({
      name: 'x',
      language: 'fr',
      ingredients: [{ name: 'sel', note: '  ', group: '' }],
      steps: [
        { text: 'a', waitMinutes: 0, ovenTempC: 0 },
        { text: 'b', waitMinutes: 20, ovenTempC: 180 },
      ],
      tips: [],
    });
    expect(r.ingredients[0]).toEqual({ name: 'sel', note: undefined, group: undefined });
    expect(r.totalMinutes).toBeUndefined();
    expect(sanitizeRecipe({ ...r, prepMinutes: 20, cookMinutes: 40 }).totalMinutes).toBe(60);
    expect(
      sanitizeRecipe({ ...r, prepMinutes: 20, cookMinutes: 40, totalMinutes: 90 }).totalMinutes,
    ).toBe(90);
    expect(r.steps).toEqual([
      { text: 'a', ovenTempC: undefined, waitMinutes: undefined },
      { text: 'b', ovenTempC: 180, waitMinutes: 20 },
    ]);
  });
});

describe('recipe draft', () => {
  const recipe: ImportedRecipe = {
    name: 'Clafoutis printanier',
    language: 'fr',
    basePortions: 4,
    ingredients: [
      { name: 'Crème fraîche liquide', quantity: '320 ml' },
      { name: 'Œufs', quantity: '2' },
      { name: 'crème fraîche liquide', quantity: '1 c.s.' }, // duplicate (sauce)
    ],
    steps: [
      { text: 'Lavez les légumes.' },
      { text: 'Glissez le plat au four.', ovenTempC: 180, waitMinutes: 40 },
    ],
    tips: ['Délicieux tiède avec une sauce à l’ail.'],
    images: [],
    source: { type: 'pdf', filename: 'Clafoutis légumes.pdf' },
  };

  it('normalizes names for matching', () => {
    expect(normalizeName('Crème  Fraîche!')).toBe('creme fraiche');
  });

  it('flattens ingredients, steps and tips into instructions', () => {
    expect(flattenInstructions(recipe)).toBe(
      [
        'Ingrédients:\n- 320 ml Crème fraîche liquide\n- 2 Œufs\n- 1 c.s. crème fraîche liquide',
        'Étapes:\n1. Lavez les légumes.\n2. Glissez le plat au four. [four 180°C, attente 40 min]',
        'Astuces:\n- Délicieux tiède avec une sauce à l’ail.',
      ].join('\n\n'),
    );
  });

  it('renders notes and sub-recipe groups', () => {
    const text = flattenInstructions({
      language: 'fr',
      ingredients: [
        { name: 'gingembre', quantity: '90 g', note: 'pelé, râpé' },
        { name: 'ail', quantity: '2 gousses', group: "Sauce à l'ail" },
      ],
      steps: [],
      tips: [],
    });
    expect(text).toBe("Ingrédients:\n- 90 g gingembre (pelé, râpé)\n\nSauce à l'ail:\n- 2 gousses ail");
  });

  it('builds an English draft from the translation, keeping original step flags', () => {
    const draft = toRecipeDraft(
      {
        ...recipe,
        ingredients: [{ name: 'Œufs', quantity: '2' }],
        steps: [{ text: 'Glissez le plat au four.', ovenTempC: 180 }],
        tips: [],
        translation: {
          language: 'en',
          machineTranslated: true,
          name: 'Spring clafoutis',
          ingredients: [{ name: 'Eggs', quantity: '2' }],
          steps: [{ text: 'Put the dish in the oven.' }],
          tips: [],
        },
      },
      [],
    );
    expect(draft.translation).toEqual({
      language: 'en',
      name: 'Spring clafoutis',
      instructions: 'Ingredients:\n- 2 Eggs\n\nSteps:\n1. Put the dish in the oven. [oven 180°C]',
      machineTranslated: true,
    });
  });

  it('matches existing ingredients and de-duplicates', () => {
    const draft = toRecipeDraft(recipe, [{ id: 7, name: 'creme fraiche liquide' }]);
    expect(draft.status).toBe(RecipeStatus.Totry);
    expect(draft.basePortions).toBe(4);
    expect(draft.ingredients).toEqual([
      { id: 7, name: 'creme fraiche liquide', quantity: '320 ml', isNew: false },
      { name: 'Œufs', quantity: '2', isNew: true },
    ]);
  });
});
