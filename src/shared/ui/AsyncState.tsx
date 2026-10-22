import type { UseQueryResult } from '@tanstack/react-query'
import { useRef, type ReactNode } from 'react'
import { Alert } from './Alert'

type AsyncStateProps<T> = {
  query: UseQueryResult<T>
  /** Accessible name of the region, e.g. "Products". */
  label: string
  skeleton: ReactNode
  errorMessage: string
  children: (data: T) => ReactNode
}

// AD-8: the one pattern for a data region. A skeleton while loading (FR33), an inline
// Alert with Retry on failure (FR34), and the content on success. A failure here never
// takes down the rest of the page.
export function AsyncState<T>({
  query,
  label,
  skeleton,
  errorMessage,
  children,
}: AsyncStateProps<T>) {
  const regionRef = useRef<HTMLElement>(null)
  // TanStack keeps the last good data when a background refetch fails: keep showing it.
  const hasData = query.data !== undefined
  const loading =
    !hasData && (query.isPending || (query.isError && query.isFetching))

  function retry() {
    // UX-DR19: Retry moves focus to the region container, which survives the re-render.
    regionRef.current?.focus()
    void query.refetch()
  }

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      aria-label={label}
      aria-busy={loading}
    >
      {hasData ? (
        children(query.data as T)
      ) : loading ? (
        skeleton
      ) : (
        <Alert message={errorMessage} onRetry={retry} />
      )}
    </section>
  )
}
