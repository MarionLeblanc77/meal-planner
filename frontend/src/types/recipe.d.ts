import type { RecipeStatus } from "./recipe"

export interface Recipe {
  id: number
  name: string
  instructions?: string
  basePortions?: number
  status: RecipeStatus
  ingredients: Ingredient[]
}

export type RecipeInput = {
  name?: Recipe['name']
  instructions?: Recipe['instructions']
  basePortions?: Recipe['basePortions']
  status?: Recipe['status']
  ingredients?: Recipe['ingredients']
}