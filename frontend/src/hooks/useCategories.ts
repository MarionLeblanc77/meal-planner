import { skipToken, useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { axiosInstance } from '../utils/axios.js'
import type { Category, CategoryInput } from '../types/category.js';

async function fetchCategories(): Promise<Category[]> {
  const result = await axiosInstance.get("http://[::1]:3000/categories/");
  return result.data;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function fetchCategory(id: number): Promise<Category> {
  const result = await axiosInstance.get(`http://[::1]:3000/categories/${id}`);
  return result.data;
}

export function useCategory(id: number | undefined) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: id === undefined ? skipToken : () => fetchCategory(id),
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function searchCategories(searchInput: CategoryInput): Promise<Category[]> {
  const result = await axiosInstance.post("http://[::1]:3000/categories/search", searchInput);
  return result.data;
}

export function useSearchCategories(searchInput: CategoryInput | undefined) {
  return useQuery({
    queryKey: ['search', 'categories', searchInput],
    queryFn: searchInput === undefined || searchInput.name === '' ? fetchCategories : () => searchCategories(searchInput),
    staleTime: 1000 * 60 * 2,
    select: (data) => data
  })
}

async function createOrEditCategory(id: number | undefined, categoryData: CategoryInput): Promise<Category> {
  const result = await axiosInstance.post(`http://[::1]:3000/categories/${id ? id + '/edit' : ''}`, categoryData);
  return result.data;
}

export function useCreateOrEditCategory(id: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryData: CategoryInput) => createOrEditCategory(id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.error('Mutation échouée:', error.message)
    },
  })
}

async function deleteCategory(id: number): Promise<void> {
  await axiosInstance.delete(`http://[::1]:3000/categories/${id}/delete`);
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (error) => {
      console.error('Mutation échouée:', error.message)
    },
  })
}