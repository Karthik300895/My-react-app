import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { categoriesQueryOptions } from '../../../shared/api/queries'
import { categoryLabel } from '../model/categoryLabel'

// AD-5: Categories come only from the shared query options.
export function useCategories() {
  const query = useQuery(categoriesQueryOptions())

  const names = useMemo(
    () => new Map(query.data?.map((c) => [c.slug, c.name])),
    [query.data],
  )
  /** The API name for a slug, or a readable label when the list isn't available. */
  const categoryName = useCallback(
    (slug: string) => names.get(slug) ?? categoryLabel(slug),
    [names],
  )

  return { query, categoryName }
}
