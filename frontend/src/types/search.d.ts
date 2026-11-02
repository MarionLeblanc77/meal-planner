import type { UseQueryResult } from '@tanstack/react-query'

export type Searchable = {
  id: number
  name: string
}

export type SearchProps<T extends Searchable> = {
  fetchHook: UseQueryResult<T[], Error>
}