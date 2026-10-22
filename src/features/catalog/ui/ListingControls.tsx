import type { RefObject } from 'react'
import type { Category } from '../../../shared/model/product'
import { SORT_OPTIONS, type SortValue } from '../model/criteria'
import { SearchBox } from './SearchBox'

const SELECT =
  'min-h-touch-target w-full rounded-md border border-border-strong bg-surface px-3 text-body text-foreground sm:w-auto'

type ListingControlsProps = {
  q: string
  urlKey: string
  category: string
  sort: SortValue
  /** `undefined` while loading or after a failure. */
  categories: Category[] | undefined
  categoriesFailed: boolean
  onRetryCategories: () => void
  categoryName: (slug: string) => string
  onSearch: (q: string) => void
  onCategoryChange: (slug: string) => void
  onSortChange: (sort: SortValue) => void
  searchInputRef: RefObject<HTMLInputElement | null>
}

// UX-DR11, UX-DR12: search plus native selects with visible labels; changes apply at once.
export function ListingControls({
  q,
  urlKey,
  category,
  sort,
  categories,
  categoriesFailed,
  onRetryCategories,
  categoryName,
  onSearch,
  onCategoryChange,
  onSortChange,
  searchInputRef,
}: ListingControlsProps) {
  const options = categories ?? []
  // An active category that isn't in the list (still loading, failed, or a stale link)
  // still shows as selected, so the select never contradicts the applied filter.
  const unlisted =
    category && !options.some((c) => c.slug === category) ? category : ''

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <SearchBox
        query={q}
        urlKey={urlKey}
        onSearch={onSearch}
        inputRef={searchInputRef}
      />

      <div>
        <label htmlFor="category-filter" className="text-label text-foreground">
          Category
        </label>
        <div className="mt-1 flex items-center gap-2">
          <select
            id="category-filter"
            className={SELECT}
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">
              {categoriesFailed ? 'Categories unavailable' : 'All categories'}
            </option>
            {options.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            {unlisted && (
              <option value={unlisted}>{categoryName(unlisted)}</option>
            )}
          </select>
          {categoriesFailed && (
            <button
              type="button"
              onClick={onRetryCategories}
              className="inline-flex min-h-touch-target items-center px-1 text-label text-primary underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="sort-order" className="text-label text-foreground">
          Sort by
        </label>
        <select
          id="sort-order"
          className={`${SELECT} mt-1 block`}
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortValue)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
