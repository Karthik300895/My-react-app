import { Link } from 'react-router'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'

// FR32, UX-DR29: unknown URLs get a way back.
export function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <PageContainer className="py-section-gap">
      <h1 className="text-display text-foreground">Page not found</h1>
      <p className="mt-4 text-body text-muted-foreground">
        The page you were looking for doesn't exist.
      </p>
      <ul className="mt-6 flex flex-wrap gap-4">
        <li>
          <Link
            to="/"
            className="inline-flex min-h-touch-target items-center text-label text-primary underline"
          >
            Go to Home
          </Link>
        </li>
        <li>
          <Link
            to="/products"
            className="inline-flex min-h-touch-target items-center text-label text-primary underline"
          >
            Browse the shop
          </Link>
        </li>
      </ul>
    </PageContainer>
  )
}
