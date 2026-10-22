import { useEffect, useMemo, useRef } from 'react'
import {
  applyCriteria,
  DEFAULT_SORT,
  describeNoMatch,
  FilterChips,
  ListingControls,
  NoResults,
  paginate,
  ProductGrid,
  ProductGridSkeleton,
  sortLabel,
  useCatalog,
  useCategories,
  useListingCriteria,
  type FilterChip,
  type FilterChipKey,
} from '../features/catalog'
import { AddToCartButton } from '../features/cart'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { AsyncState } from '../shared/ui/AsyncState'
import { PageContainer } from '../shared/ui/PageContainer'
import { Pagination } from '../shared/ui/Pagination'

const LOAD_ERROR_MESSAGE =
  "We couldn't load products. Check your connection and try again."

function productCount(count: number): string {
  return `${count} ${count === 1 ? 'product' : 'products'}`
}

// FR1–FR6, FR33, FR34: the Product Listing.
export function ProductListingPage() {
  useDocumentTitle('Products')
  const catalog = useCatalog()
  const { query: categories, categoryName } = useCategories()
  const criteria = useListingCriteria()
  const { q, category, sort, page, rawPage, setPage } = criteria
  const countRef = useRef<HTMLParagraphElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(
    () =>
      catalog.data ? applyCriteria(catalog.data, { q, category, sort }) : null,
    [catalog.data, q, category, sort],
  )
  const current = useMemo(
    () => (results ? paginate(results, page) : null),
    [results, page],
  )

  // AD-7: an invalid or out-of-range ?page renders page 1; make the URL say so too
  // (page 1 is canonical without the parameter).
  const shownPage = current?.page
  useEffect(() => {
    if (shownPage === undefined) return
    const canonical = shownPage === 1 ? null : String(shownPage)
    if (rawPage !== canonical) setPage(shownPage, { replace: true })
  }, [shownPage, rawPage, setPage])

  function changePage(next: number) {
    setPage(next)
    // UX-DR14: back to the top of the grid; focus the count so it is announced once.
    countRef.current?.scrollIntoView?.({ block: 'start' })
    countRef.current?.focus({ preventScroll: true })
  }

  const chips: FilterChip[] = [
    ...(q ? [{ key: 'q' as const, label: `“${q}”`, value: q }] : []),
    ...(category
      ? [
          {
            key: 'category' as const,
            label: categoryName(category),
            value: categoryName(category),
          },
        ]
      : []),
    ...(sort !== DEFAULT_SORT
      ? [
          {
            key: 'sort' as const,
            label: sortLabel(sort),
            value: sortLabel(sort),
          },
        ]
      : []),
  ]

  // A chip (or Clear filters) removes itself, so focus moves to the search input.
  function removeChip(key: FilterChipKey) {
    if (key === 'q') criteria.setQuery('')
    else if (key === 'category') criteria.setCategory('')
    else criteria.setSort(DEFAULT_SORT)
    searchInputRef.current?.focus()
  }
  function clearFilters() {
    criteria.clearFilters()
    searchInputRef.current?.focus()
  }

  const countText = results
    ? productCount(results.length)
    : catalog.isPending || catalog.isFetching
      ? 'Loading products…'
      : ''
  // UX-DR32: the announcement names the sort too, so a re-sort that keeps the same count
  // still confirms that something happened.
  const announcement = results
    ? `Showing ${countText}${sort === DEFAULT_SORT ? '' : `, sorted by ${sortLabel(sort)}`}`
    : ''
  const hasFilters = chips.length > 0

  return (
    <PageContainer className="py-section-gap">
      <h1 className="text-h1 text-foreground">Products</h1>

      <div className="mt-6">
        <ListingControls
          q={q}
          urlKey={criteria.urlKey}
          category={category}
          sort={sort}
          categories={categories.data}
          categoriesFailed={categories.isError && !categories.data}
          onRetryCategories={() => void categories.refetch()}
          categoryName={categoryName}
          onSearch={criteria.setQuery}
          onCategoryChange={criteria.setCategory}
          onSortChange={criteria.setSort}
          searchInputRef={searchInputRef}
        />
        <FilterChips
          chips={chips}
          onRemove={removeChip}
          onClearAll={clearFilters}
        />
      </div>

      {/* The visible count is the pagination focus target (announced via focus). */}
      <p
        ref={countRef}
        tabIndex={-1}
        className="mt-6 mb-4 min-h-6 text-body-sm text-muted-foreground"
      >
        {countText}
      </p>
      {/* UX-DR32: announced after each criteria change, while focus stays on the control. */}
      <p role="status" aria-atomic="true" className="sr-only">
        {announcement}
      </p>

      <AsyncState
        query={catalog}
        label="Products"
        skeleton={<ProductGridSkeleton />}
        errorMessage={LOAD_ERROR_MESSAGE}
      >
        {() =>
          current &&
          (current.items.length === 0 ? (
            <NoResults
              description={describeNoMatch(
                q,
                category ? categoryName(category) : '',
              )}
              onClear={hasFilters ? clearFilters : undefined}
            />
          ) : (
            <>
              <ProductGrid
                products={current.items}
                categoryName={categoryName}
                // AD-1: the page fills each card's action slot with cart's control.
                renderAction={(product) => (
                  <AddToCartButton product={product} />
                )}
              />
              <Pagination
                page={current.page}
                pageCount={current.pageCount}
                onPageChange={changePage}
              />
            </>
          ))
        }
      </AsyncState>
    </PageContainer>
  )
}
