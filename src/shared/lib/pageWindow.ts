export type PageWindowItem = number | 'gap'

/**
 * The page buttons to show: first, last, and the current page with its neighbours,
 * with a gap where pages are skipped. Keeps Pagination short at 320 px.
 */
export function pageWindow(page: number, pageCount: number): PageWindowItem[] {
  const shown = new Set(
    [1, page - 1, page, page + 1, pageCount].filter(
      (p) => p >= 1 && p <= pageCount,
    ),
  )
  const sorted = [...shown].sort((a, b) => a - b)
  const items: PageWindowItem[] = []
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1]
    if (prev !== undefined && p - prev === 2) items.push(prev + 1)
    else if (prev !== undefined && p - prev > 2) items.push('gap')
    items.push(p)
  })
  return items
}
