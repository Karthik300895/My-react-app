import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  DEFAULT_SORT,
  parseCategory,
  parsePage,
  parseQuery,
  parseSort,
  type ListingCriteria,
  type SortValue,
} from './criteria'

export { parsePage } from './criteria'

type FilterChanges = Partial<Pick<ListingCriteria, 'q' | 'category' | 'sort'>>

// AD-7: the URL is the only store of listing criteria, and this hook is its only reader
// and writer.
export function useListingCriteria() {
  const [params, setParams] = useSearchParams()

  const criteria: ListingCriteria = useMemo(
    () => ({
      q: parseQuery(params.get('q')),
      category: parseCategory(params.get('category')),
      sort: parseSort(params.get('sort')),
      page: parsePage(params.get('page')),
    }),
    [params],
  )
  /** The raw `page` value, so callers can detect a non-canonical URL (e.g. `?page=abc`). */
  const rawPage = params.get('page')
  /** Changes whenever any criterion in the URL changes. */
  const urlKey = params.toString()

  /** FR5: any change other than the page resets the page to 1. Defaults leave the URL. */
  const updateFilters = useCallback(
    (changes: FilterChanges, options: { replace?: boolean } = {}) =>
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          for (const [key, value] of Object.entries(changes)) {
            if (value === undefined) continue
            const isDefault =
              value === '' || (key === 'sort' && value === DEFAULT_SORT)
            if (isDefault) next.delete(key)
            else next.set(key, value)
          }
          next.delete('page')
          return next
        },
        { replace: options.replace },
      ),
    [setParams],
  )

  /** `replace` rewrites the current history entry (used to normalise an invalid page). */
  const setPage = useCallback(
    (next: number, options: { replace?: boolean } = {}) =>
      setParams(
        (current) => {
          const updated = new URLSearchParams(current)
          if (next <= 1) updated.delete('page')
          else updated.set('page', String(next))
          return updated
        },
        { replace: options.replace },
      ),
    [setParams],
  )

  // UX-DR11: search updates `q` with history replace; the selects push a history entry.
  const setQuery = useCallback(
    (q: string) => updateFilters({ q: parseQuery(q) }, { replace: true }),
    [updateFilters],
  )
  const setCategory = useCallback(
    (category: string) => updateFilters({ category }),
    [updateFilters],
  )
  const setSort = useCallback(
    (sort: SortValue) => updateFilters({ sort }),
    [updateFilters],
  )
  const clearFilters = useCallback(
    () => updateFilters({ q: '', category: '', sort: DEFAULT_SORT }),
    [updateFilters],
  )

  return {
    ...criteria,
    rawPage,
    urlKey,
    setPage,
    setQuery,
    setCategory,
    setSort,
    clearFilters,
  }
}
