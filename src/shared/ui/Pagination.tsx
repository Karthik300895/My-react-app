import { pageWindow } from '../lib/pageWindow'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

const SQUARE =
  'inline-flex min-h-touch-target min-w-touch-target items-center justify-center rounded-md border px-3 text-label tabular-nums'
const IDLE = 'border-border-strong bg-surface text-foreground'
const CURRENT = 'border-primary bg-primary text-primary-foreground'
const DISABLED =
  'aria-disabled:border-border aria-disabled:bg-muted aria-disabled:text-muted-foreground'

// UX-DR14: hidden for a single page. Disabled ends stay focusable (aria-disabled).
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null

  const go = (target: number) => {
    if (target < 1 || target > pageCount || target === page) return
    onPageChange(target)
  }

  return (
    <nav aria-label="Pagination" className="mt-section-gap">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          <button
            type="button"
            aria-disabled={page === 1}
            onClick={() => go(page - 1)}
            className={`${SQUARE} ${IDLE} ${DISABLED}`}
          >
            <span aria-hidden="true" className="sm:hidden">
              ←
            </span>
            <span className="sr-only sm:not-sr-only">Previous</span>
          </button>
        </li>
        {pageWindow(page, pageCount).map((item, i) =>
          item === 'gap' ? (
            <li
              key={`gap-${i}`}
              aria-hidden="true"
              className="px-1 text-muted-foreground"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => go(item)}
                className={`${SQUARE} ${item === page ? CURRENT : IDLE}`}
              >
                {item}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-disabled={page === pageCount}
            onClick={() => go(page + 1)}
            className={`${SQUARE} ${IDLE} ${DISABLED}`}
          >
            <span className="sr-only sm:not-sr-only">Next</span>
            <span aria-hidden="true" className="sm:hidden">
              →
            </span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
