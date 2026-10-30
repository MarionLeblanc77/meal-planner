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
    select: (data) => data.slice(0, 20)
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