import { Skeleton } from '../../../shared/ui/Skeleton'
import { DETAILS_GRID } from './detailsClasses'

// FR33, UX-DR20: a skeleton gallery and text bars in the real two-column layout.
export function ProductDetailsSkeleton() {
  return (
    <div className={DETAILS_GRID}>
      {/* Hidden from assistive tech: the region is aria-busy and says "Loading product…". */}
      <div aria-hidden="true">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="size-16 rounded-md" />
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="flex flex-col gap-3">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <p className="sr-only">Loading product…</p>
    </div>
  )
}
