export interface Ingredient {
  id: number
  name: string
  onSeason?: boolean
  recipes: Recipe[]
}

export type IngredientInput = {
  id?: Ingredient['id']
  name?: Ingredient['name']
  onSeason?: Ingredient['onSeason']
}