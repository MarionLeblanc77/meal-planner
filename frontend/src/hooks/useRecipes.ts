import { skipToken, useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../utils/axios'
import type { Recipe } from '../types/recipe';

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