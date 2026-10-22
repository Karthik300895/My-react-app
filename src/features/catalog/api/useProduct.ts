import { useQuery } from '@tanstack/react-query'
import { productQueryOptions } from '../../../shared/api/queries'

// AD-5: one Product's full record, only through the shared query options.
export function useProduct(id: number) {
  return useQuery(productQueryOptions(id))
}
