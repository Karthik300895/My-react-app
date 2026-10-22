import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { focusPageHeading } from '../shared/lib/focusPageHeading'

// AD-11, UX-DR32: a change of URL path moves focus to the new page's h1.
// Query-only changes and the initial load leave focus alone (the skip link stays first).
export function useRouteFocus(): void {
  const { pathname } = useLocation()
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current === pathname) return
    previous.current = pathname
    focusPageHeading()
  }, [pathname])
}
