import { Link } from 'react-router'
import { useLateHeadingFocus } from '../../../shared/lib/focusPageHeading'

// FR9, UX-DR29: a malformed or unknown id. No Retry: the answer won't change.
export function ProductNotFound() {
  useLateHeadingFocus()
  return (
    <div>
      <h1 className="text-h1 text-foreground">Product not found</h1>
      <p className="mt-4 text-body text-muted-foreground">
        It may have been removed, or the link is wrong.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-flex min-h-touch-target items-center rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover"
      >
        Browse products
      </Link>
    </div>
  )
}
