import { useEffect } from 'react'

// Focus the page's h1 (or main, if a page has none) without disturbing scroll, so
// ScrollRestoration keeps a restored position on Back/Forward.
export function focusPageHeading(): void {
  const target =
    document.querySelector<HTMLElement>('main h1') ??
    document.querySelector<HTMLElement>('main')
  if (!target) return
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
  target.focus({ preventScroll: true })
}

/**
 * AD-11: for an h1 that renders after the route change (a page that loads its data
 * first), the route focus landed on `main`. Hand it on to the h1 once it mounts, but
 * only from `main`: never take focus from a control or from the initial page load.
 */
export function useLateHeadingFocus(): void {
  useEffect(() => {
    const main = document.querySelector('main')
    if (main && document.activeElement === main) focusPageHeading()
  }, [])
}
