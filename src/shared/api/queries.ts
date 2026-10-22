import { queryOptions } from '@tanstack/react-query'
import { getCatalog, getCategories, getProduct } from './productApi'

// AD-5: query keys and option factories. Every useQuery call goes through these.

const TEN_MINUTES = 10 * 60 * 1000

export const catalogKeys = {
  all: ['catalog'] as const,
  list: () => [...catalogKeys.all, 'list'] as const,
}

/** AD-6: Listing, Home and Cart reconciliation share this one catalog query. */
export function catalogQueryOptions() {
  return queryOptions({
    queryKey: catalogKeys.list(),
    queryFn: ({ signal }) => getCatalog(signal),
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES,
  })
}

export const categoriesKeys = {
  all: ['categories'] as const,
}

/** FR3: Categories change as rarely as the catalog, so they share its cache policy. */
export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: categoriesKeys.all,
    queryFn: ({ signal }) => getCategories(signal),
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES,
  })
}

export const productKeys = {
  all: ['product'] as const,
  detail: (id: number) => [...productKeys.all, id] as const,
}

/** FR7: one Product's full record, with the catalog's cache policy. */
export function productQueryOptions(id: number) {
  return queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => getProduct(id, signal),
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES,
  })
}
