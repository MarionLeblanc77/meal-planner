export interface Ingredient {
  id: number
  name: string
  onSeason?: boolean
  recipes: Recipe[]
}

export type IngredientInput = {
  name?: Ingredient['name']
  onSeason?: Ingredient['onSeason']
}