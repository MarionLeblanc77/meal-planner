import { isAxiosError } from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosInstance } from "../utils/axios"
import type { ImportResult } from "../types/importer"

// Relative paths: they go through axiosInstance's baseURL (public/config.js).
async function importFromUrl(url: string): Promise<ImportResult> {
  const result = await axiosInstance.post("importer/url", { url })
  return result.data
}

async function importFromFile(file: File): Promise<ImportResult> {
  const form = new FormData()
  form.append("file", file)
  const result = await axiosInstance.post("importer/file", form)
  return result.data
}

/** The last import result is kept in the query cache so the list survives navigating to a review and back. */
const LAST_IMPORT_KEY = ["importer", "last"] as const

export function useLastImport() {
  return useQuery<ImportResult | null>({
    queryKey: LAST_IMPORT_KEY,
    queryFn: () => null,
    staleTime: Infinity,
  })
}

export function useImportRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { url: string } | { file: File }) =>
      "url" in input ? importFromUrl(input.url) : importFromFile(input.file),
    // Each attempt calls a paid model and can take ~30 s — never retry automatically.
    retry: 0,
    onSuccess: (data) => {
      queryClient.setQueryData(LAST_IMPORT_KEY, data)
    },
  })
}

/** The backend's error messages tell the user what to do (Instagram, HEIC, file too large...). */
export function importErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(", ")
    if (typeof message === "string") return message
    if (error.code === "ERR_NETWORK") return "Cannot reach the server."
  }
  return error instanceof Error ? error.message : "Import failed."
}
