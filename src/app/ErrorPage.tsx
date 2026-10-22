import { useEffect } from 'react'
import { useRouteError } from 'react-router'
import { focusPageHeading } from '../shared/lib/focusPageHeading'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'
import { SkipLink } from './SkipLink'

// FR35, UX-DR29: the root ErrorBoundary. It replaces RootLayout, so it brings its own
// landmarks, and it recovers with full page loads in case the router itself is broken.
// It never reads or writes storage, so the Cart is left as it was.
export function ErrorPage() {
  const error = useRouteError()
  useDocumentTitle('Something went wrong')

  useEffect(() => {
    console.error(error)
  }, [error])

  // RootLayout (and its focus and scroll handling) is gone here, so do both ourselves:
  // a navigation that lands on this page must not leave focus on a removed element.
  useEffect(() => {
    window.scrollTo(0, 0)
    focusPageHeading()
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <SkipLink />
      <main id="main" tabIndex={-1} className="flex-1">
        <PageContainer className="py-section-gap">
          <h1 className="text-h1 text-foreground">Something went wrong</h1>
          <p className="mt-4 text-body text-muted-foreground">
            Your cart is safe.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-touch-target items-center rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="inline-flex min-h-touch-target items-center rounded-md border border-border-strong bg-surface px-4 text-label text-foreground"
            >
              Go to Home
            </button>
          </div>
        </PageContainer>
      </main>
    </div>
  )
}
