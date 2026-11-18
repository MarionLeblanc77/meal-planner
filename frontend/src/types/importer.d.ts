// Mirrors the backend's ImportResult (src/importer/importer.service.ts).

export type ImportSourceType = "website" | "image" | "pdf"

export interface DraftIngredient {
  /** Set when the name matched an existing ingredient. */
  id?: number
  name: string
  quantity?: string
  note?: string
  group?: string
  isNew: boolean
}

export interface RecipeDraft {
  name: string
  instructions: string
  basePortions?: number
  status: number
  ingredients: DraftIngredient[]
  /** Machine translation — must be checked by the user. */
  translation?: {
    language: string
    name: string
    instructions: string
    machineTranslated: true
  }
}

export interface ImportedRecipe {
  name: string
  summary?: string
  language: string
  images: string[]
  source: { type: ImportSourceType; url?: string; filename?: string }
}

export interface ImportUsage {
  task: string
  model: string
  promptTokens: number
  completionTokens: number
  cost?: number
}

export interface ImportResult {
  source: ImportSourceType
  recipes: { imported: ImportedRecipe; draft: RecipeDraft }[]
  usage: ImportUsage[]
}

/** Passed through router state from the import page to the recipe form. */
export interface ImportReviewState {
  importDraft: RecipeDraft
  imported: ImportedRecipe
  /** Where to go after saving (back to the import list when a page had several recipes). */
  returnTo: string
}
