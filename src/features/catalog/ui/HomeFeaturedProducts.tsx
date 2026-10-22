import type { ReactNode } from 'react'
import { AsyncState } from '../../../shared/ui/AsyncState'
import type { Product } from '../../../shared/model/product'
import { useCategories } from '../api/useCategories'
import { useCatalog } from '../api/useCatalog'
import { topRated } from '../model/topRated'
import { ProductGrid } from './ProductGrid'
import { ProductGridSkeleton } from './ProductGridSkeleton'

const TOP_RATED_LIMIT = 8

type HomeFeaturedProductsProps = {
  /** AD-1: the page fills each card's action slot by composition. */
  renderAction?: (product: Product) => ReactNode
}

// FR31, AD-6: reads catalogQueryOptions() — the same cache as the listing, no extra fetch.
export function HomeFeaturedProducts({
  renderAction,
}: HomeFeaturedProductsProps) {
  const query = useCatalog()
  const { categoryName } = useCategories()

  return (
    <AsyncState
      query={query}
      label="Top rated products"
      skeleton={<ProductGridSkeleton />}
      errorMessage="We couldn't load products. Check your connection and try again."
    >
      {(products) => (
        <ProductGrid
          products={topRated(products, TOP_RATED_LIMIT)}
          categoryName={categoryName}
          renderAction={renderAction}
        />
      )}
    </AsyncState>
  )
}
