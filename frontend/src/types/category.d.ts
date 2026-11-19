export interface Category {
  id: number
  name: string
  recipes: Recipe[]
}

export type CategoryInput = {
  id?: Category['id']
  name?: Category['name']
}