import { skipToken, useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { axiosInstance } from '../utils/axios'
import type { Ingredient, IngredientInput } from '../types/ingredient';

async function fetchIngredients(): Promise<Ingredient[]> {
  const result = await axiosInstance.get("http://[::1]:3000/ingredients/");
  return result.data;
}

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: fetchIngredients,
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function fetchTop10NotSelectedIngredients(ingredients: IngredientInput[]): Promise<Ingredient[]> {
  const result = await axiosInstance.post("http://[::1]:3000/ingredients/search/top10-not-selected", ingredients);
  return result.data;
}

export function useTop10NotSelectedIngredients(ingredients: IngredientInput[] | undefined) {
  return useQuery({
    queryKey: ['search', 'ingredients', 'top10-not-selected'],
    queryFn: () => fetchTop10NotSelectedIngredients(ingredients || []),
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function fetchIngredient(id: number): Promise<Ingredient> {
  const result = await axiosInstance.get(`http://[::1]:3000/ingredients/${id}`);
  return result.data;
}

export function useIngredient(id: number | undefined) {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: id === undefined ? skipToken : () => fetchIngredient(id),
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function searchIngredients(searchInput: IngredientInput, ingredients: IngredientInput[] | undefined): Promise<Ingredient[]> {
  const result = await axiosInstance.post("http://[::1]:3000/ingredients/search", { name: searchInput.name, ingredients: ingredients?.map((ingredient) => ingredient.id) });
  return result.data;
}

export function useSearchIngredients(searchInput: IngredientInput | undefined, ingredients: IngredientInput[] | undefined) {
  return useQuery({
    queryKey: ['search', 'ingredients', searchInput, ingredients],
    queryFn: searchInput === undefined || searchInput.name === '' ? () => fetchTop10NotSelectedIngredients(ingredients || []) : () => searchIngredients(searchInput, ingredients),
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function createOrEditIngredient(id: number | undefined, ingredientData: IngredientInput): Promise<Ingredient> {
  const result = await axiosInstance.post(`http://[::1]:3000/ingredients/${id ? id + '/edit' : ''}`, ingredientData);
  return result.data;
}

export function useCreateOrEditIngredient(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ingredientData: IngredientInput) => createOrEditIngredient(id, ingredientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
    onError: (error) => {
      console.error('Mutation échouée:', error.message)
    },
  })
}

async function deleteIngredient(id: number): Promise<void> {
  await axiosInstance.delete(`http://[::1]:3000/ingredients/${id}/delete`);
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
    onError: (error) => {
      console.error('Mutation échouée:', error.message)
    },
  })
}