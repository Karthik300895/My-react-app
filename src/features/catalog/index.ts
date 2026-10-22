// AD-1: public API of the catalog feature. Code outside features/catalog imports only from this file.
export { useCatalog } from './api/useCatalog'
export { useCategories } from './api/useCategories'
export { useProduct } from './api/useProduct'
export { DEFAULT_SORT, sortLabel, SORT_OPTIONS } from './model/criteria'
export type { SortValue } from './model/criteria'
export { applyCriteria, describeNoMatch } from './model/listing'
export { paginate, PAGE_SIZE } from './model/paginate'
export { parseProductId } from './model/productId'
export { useListingCriteria } from './model/useListingCriteria'
export {
  FilterChips,
  type FilterChip,
  type FilterChipKey,
} from './ui/FilterChips'
export { ListingControls } from './ui/ListingControls'
export { NoResults } from './ui/NoResults'
export { ProductCard } from './ui/ProductCard'
export { ProductDetailsSkeleton } from './ui/ProductDetailsSkeleton'
export { ProductDetailsView } from './ui/ProductDetailsView'
export { ProductGrid } from './ui/ProductGrid'
export { ProductGridSkeleton } from './ui/ProductGridSkeleton'
export { ProductNotFound } from './ui/ProductNotFound'
export { topRated } from './model/topRated'
export { HomeHero } from './ui/HomeHero'
export { HomeCategoryShortcuts } from './ui/HomeCategoryShortcuts'
export { HomeFeaturedProducts } from './ui/HomeFeaturedProducts'
