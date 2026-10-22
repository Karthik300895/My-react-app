import { useQuery } from '@tanstack/react-query'
import { catalogQueryOptions } from '../../../shared/api/queries'

// AD-5, AD-6: the catalog comes only from the shared query options.
export function useCatalog() {
  return useQuery(catalogQueryOptions())
}
