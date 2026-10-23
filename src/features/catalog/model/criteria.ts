import { CATEGORY_SLUG } from '../../../shared/api/dto'
import type { Product } from '../../../shared/model/product'

type SortOption = {
  value: string
  label: string
  /** `null` keeps the Product API's order (relevance, AD-7). */
  compare: ((a: Product, b: Product) => number) | null
}

// FR4: the sort table. Adding a sort is adding a row here (the Epic 4 extension point).
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance', compare: null },
  {
    value: 'price-asc',
    label: 'Price: low to high',
    compare: (a, b) => a.priceCents - b.priceCents,
  },
  {
    value: 'price-desc',
    label: 'Price: high to low',
    compare: (a, b) => b.priceCents - a.priceCents,
  },
  {
    // AD-6, AD-7: the Epic 4 extension row. Equal ratings fall to price ascending, then id.
    value: 'rating-desc',
    label: 'Rating: high to low',
    compare: (a, b) =>
      b.rating - a.rating || a.priceCents - b.priceCents || a.id - b.id,
  },
] as const satisfies readonly SortOption[]

export type SortValue = (typeof SORT_OPTIONS)[number]['value']

export const DEFAULT_SORT: SortValue = 'relevance'

export type ListingCriteria = {
  q: string
  category: string
  sort: SortValue
  page: number
}

export const MAX_QUERY_LENGTH = 100

// AD-7: invalid values fall back to their defaults without an error.

export function parseQuery(raw: string | null): string {
  return (raw ?? '').trim().slice(0, MAX_QUERY_LENGTH)
}

export function parseCategory(raw: string | null): string {
  return raw && CATEGORY_SLUG.test(raw) ? raw : ''
}

export function parseSort(raw: string | null): SortValue {
  return (
    SORT_OPTIONS.find((option) => option.value === raw)?.value ?? DEFAULT_SORT
  )
}

export function parsePage(raw: string | null): number {
  const page = Number(raw)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

export function sortLabel(value: SortValue): string {
  return (
    SORT_OPTIONS.find((option) => option.value === value)?.label ??
    SORT_OPTIONS[0].label
  )
}
