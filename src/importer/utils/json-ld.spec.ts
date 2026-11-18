import {
  cleanIngredientLine,
  findJsonLdRecipe,
  isoDurationToMinutes,
  parseYield,
} from './json-ld.js';

const page = (...blocks: unknown[]) =>
  `<html><head>${blocks
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
    .join('')}</head><body></body></html>`;

describe('findJsonLdRecipe', () => {
  it('reads a lavieclaire-style graph (0-prefixed ingredients, image by @id)', () => {
    const html = page({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', '@id': 'https://x.fr/r/#webpage' },
        {
          '@type': 'ImageObject',
          '@id': 'https://x.fr/r/#primaryimage',
          url: 'https://x.fr/img/choux.jpg',
        },
        {
          '@type': 'Recipe',
          name: 'Choux de Bruxelles au miel',
          recipeYield: '4',
          prepTime: 'PT15M',
          cookTime: 'PT20M',
          totalTime: 'PT35M',
          inLanguage: 'fr-FR',
          image: { '@id': 'https://x.fr/r/#primaryimage' },
          recipeIngredient: ['0  500 g de choux de Bruxelles', '0  2 c.à.s de miel'],
          recipeInstructions: [
            { '@type': 'HowToStep', text: 'Nettoyez les choux.' },
            { '@type': 'HowToStep', text: 'Faites revenir les lardons.' },
          ],
        },
      ],
    });

    expect(findJsonLdRecipe(html)).toEqual({
      name: 'Choux de Bruxelles au miel',
      description: undefined,
      language: 'fr-FR',
      basePortions: 4,
      prepMinutes: 15,
      cookMinutes: 20,
      totalMinutes: 35,
      ingredients: ['500 g de choux de Bruxelles', '2 c.à.s de miel'],
      steps: ['Nettoyez les choux.', 'Faites revenir les lardons.'],
      images: ['https://x.fr/img/choux.jpg'],
    });
  });

  it('reads a WPRM-style recipe (array @type, array yield, sections, image urls)', () => {
    const html = page(
      { '@type': 'Organization', name: 'Blog' },
      {
        '@type': ['Recipe'],
        name: 'Sweet Potato Chips',
        recipeYield: ['8', '8 Servings'],
        image: ['https://b.com/a.jpg', 'https://b.com/b.jpg'],
        recipeIngredient: ['1 1/2 pounds sweet potatoes'],
        recipeInstructions: [
          {
            '@type': 'HowToSection',
            name: 'Bake',
            itemListElement: [{ '@type': 'HowToStep', text: 'Preheat the oven to 300 degrees F.' }],
          },
        ],
      },
    );
    const r = findJsonLdRecipe(html)!;
    expect(r.basePortions).toBe(8);
    expect(r.images).toEqual(['https://b.com/a.jpg', 'https://b.com/b.jpg']);
    expect(r.steps).toEqual(['Preheat the oven to 300 degrees F.']);
  });

  it('returns null when there is no Recipe or the JSON is malformed', () => {
    expect(findJsonLdRecipe('<html><body>Login</body></html>')).toBeNull();
    expect(
      findJsonLdRecipe('<script type="application/ld+json">{ not json</script>'),
    ).toBeNull();
  });
});

describe('helpers', () => {
  it.each([
    ['PT15M', 15],
    ['PT1H15M', 75],
    ['P1DT2H', 1560],
    ['PT0M', undefined],
    ['PT', undefined],
    ['soon', undefined],
    [undefined, undefined],
  ])('isoDurationToMinutes(%s) = %s', (input, expected) => {
    expect(isoDurationToMinutes(input)).toBe(expected);
  });

  it('parseYield takes the lower bound of a range', () => {
    expect(parseYield('4-6 personnes')).toBe(4);
    expect(parseYield(['8', '8 Servings'])).toBe(8);
    expect(parseYield(undefined)).toBeUndefined();
  });

  it('cleanIngredientLine strips the "0  " prefix but keeps real zeros', () => {
    expect(cleanIngredientLine('0  150 g de lardons')).toBe('150 g de lardons');
    expect(cleanIngredientLine('0,5 l de lait')).toBe('0,5 l de lait');
  });
});
