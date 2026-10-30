import type { RecipeStatus } from "./recipe"

// Type pour un article
export interface Recipe {
  id: number
  name: string
  instructions?: string
  basePortions?: number
  status: RecipeStatus
  ingredients: Ingredient[]
}