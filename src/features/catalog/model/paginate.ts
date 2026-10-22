// AD-6: pagination is a pure function over the whole (filtered) result set.

export const PAGE_SIZE = 20

export type PageOf<T> = { items: T[]; page: number; pageCount: number }

/** A page beyond the last one falls back to page 1 (AD-7: invalid values use defaults). */
export function paginate<T>(items: T[], page: number): PageOf<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const current =
    Number.isInteger(page) && page >= 1 && page <= pageCount ? page : 1
  const start = (current - 1) * PAGE_SIZE
  return {
    items: items.slice(start, start + PAGE_SIZE),
    page: current,
    pageCount,
  }
}
