import type { RecipeStatus } from "./recipe"

export interface Recipe {
  id: number
  name: string
  instructions?: string
  basePortions?: number
  status: RecipeStatus
  ingredients: Ingredient[]
  categories: Category[]
}

export type RecipeInput = {
  name?: Recipe['name']
  instructions?: Recipe['instructions']
  basePortions?: Recipe['basePortions']
  status?: Recipe['status']
  ingredients?: Recipe['ingredients']
  ingredientIds?: number[]
  hasAllIngredients?: boolean
  categories?: Recipe['categories']
  categoryIds?: number[]
  hasAllCategories?: boolean
  seasonality?: boolean
}