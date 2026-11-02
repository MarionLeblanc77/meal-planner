import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../utils/axios'
import type { Recipe, RecipeInput } from '../types/recipe';

async function fetchRecipes(): Promise<Recipe[]> {
  const result = await axiosInstance.get("http://[::1]:3000/recipes/");
  return result.data;
}

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes, 
    staleTime: 1000 * 60 * 2, 
    select: (data) => data.slice(0, 20),
  })
}

async function fetchRecipe(id: number): Promise<Recipe> {
  const result = await axiosInstance.get(`http://[::1]:3000/recipes/${id}`);
  return result.data;
}

export function useRecipe(id: number | undefined) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: id === undefined ? skipToken : () => fetchRecipe(id),
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function createOrEditRecipe(id: number | undefined, recipeData: RecipeInput): Promise<Recipe> {
  const result = await axiosInstance.post(`http://[::1]:3000/recipes/${id ? id + '/edit' : ''}`, recipeData);
  return result.data;
}

export function useCreateOrEditRecipe(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipeData: RecipeInput) => createOrEditRecipe(id, recipeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
    onError: (error) => {
      console.error('Mutation échouée:', error.message)
    },
  })
}

async function deleteRecipe(id: number): Promise<void> {
  await axiosInstance.delete(`http://[::1]:3000/recipes/${id}/delete`);
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
    onError: (error) => {
      console.error('Mutation échouée:', error.message)
    },
  })
}

async function deleteIngredientFromRecipe(recipeId: number, ingredientId: number): Promise<void> {
  await axiosInstance.delete(`http://[::1]:3000/recipes/${recipeId}/ingredients/${ingredientId}/delete`);
}

export function useDeleteIngredientFromRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ recipeId, ingredientId }: { recipeId: number; ingredientId: number }) => deleteIngredientFromRecipe(recipeId, ingredientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', 'ingredients'] })
    },
    onError: (error) => {
      console.error('Mutation échouée:', error.message)
    },
  })
}