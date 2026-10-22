import { useLocation, useNavigation } from 'react-router'

// UX-DR22: a 2 px teal bar while a lazy page module loads; the previous page stays visible.
export function RouteProgressBar() {
  const navigation = useNavigation()
  const { pathname } = useLocation()
  // Only a change of page (path) loads a module; query-only changes (e.g. ?page=2) don't.
  if (navigation.state === 'idle' || navigation.location?.pathname === pathname)
    return null
  return <ProgressBar />
}

/** The bar itself; also the router's HydrateFallback while the first page module loads. */
export function ProgressBar() {
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-primary"
    />
  )
}
