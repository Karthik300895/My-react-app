import { Skeleton } from '../../../shared/ui/Skeleton'
import { GRID_CLASSES } from './gridClasses'

const SKELETON_CARDS = 8

// UX-DR20: 8 card-shaped placeholders in the real grid, so nothing shifts on load.
export function ProductGridSkeleton() {
  return (
    // Hidden from assistive tech: the region is aria-busy and the count says "Loading products…".
    <ul aria-hidden="true" className={GRID_CLASSES}>
      {Array.from({ length: SKELETON_CARDS }, (_, i) => (
        <li key={i} className="rounded-lg border border-border bg-surface p-3">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="mt-3 h-3 w-1/3" />
          <Skeleton className="mt-2 h-5 w-5/6" />
          {/* The card's description is two lines, and its action slot is a 44px button (CLS). */}
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-2 h-5 w-1/4" />
          <div className="pt-3">
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  )
}
