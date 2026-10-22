import { Link, useLocation, useNavigate } from 'react-router'
import { readListingReturn } from '../model/listingReturn'

// FR7: back to the listing the Shopper came from, criteria intact. A real link (so a
// new tab still works); a plain click on an entry opened from the listing goes back in
// history instead, which also restores the listing's scroll position.
export function BackToProducts() {
  const location = useLocation()
  const navigate = useNavigate()
  const listingUrl = readListingReturn(location.state)

  return (
    <Link
      to={listingUrl ?? '/products'}
      onClick={(event) => {
        const modified =
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        // React Router keys the first entry of a session `default`: with nothing behind
        // it in the app, follow the link instead of leaving the store.
        const first = location.key === 'default'
        if (!listingUrl || modified || first) return
        event.preventDefault()
        void navigate(-1)
      }}
      className="inline-flex min-h-touch-target items-center gap-1 text-label text-primary underline"
    >
      <span aria-hidden="true">←</span> Back to products
    </Link>
  )
}
