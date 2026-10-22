import { useEffect } from 'react'

export const SITE_NAME = 'Simple Shopping Cart'

// UX-DR32: every page titles the tab "{Page} · Simple Shopping Cart".
export function useDocumentTitle(page: string): void {
  useEffect(() => {
    document.title = `${page} · ${SITE_NAME}`
  }, [page])
}
