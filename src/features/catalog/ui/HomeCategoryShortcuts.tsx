import { Link } from 'react-router'
import { Alert } from '../../../shared/ui/Alert'
import { Skeleton } from '../../../shared/ui/Skeleton'
import { useCategories } from '../api/useCategories'

// FR31: pill links to category-filtered listing; independent error state so a failure
// here never affects the featured products section.
export function HomeCategoryShortcuts() {
  const { query } = useCategories()

  if (query.isPending) {
    return (
      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    )
  }

  if (query.isError) {
    return (
      <Alert
        message="We couldn't load categories."
        onRetry={() => void query.refetch()}
      />
    )
  }

  return (
    <nav aria-label="Category shortcuts">
      <ul className="flex flex-wrap gap-2">
        {query.data.map((category) => (
          <li key={category.slug}>
            <Link
              to={`/products?category=${category.slug}`}
              className="inline-flex min-h-touch-target items-center rounded-full border border-border px-4 text-label text-foreground hover:border-primary hover:text-primary"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
