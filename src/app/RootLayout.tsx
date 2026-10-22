import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'
import { CartIndicator, useCartReconciliation } from '../features/cart'
import { NoticeRegion } from '../shared/ui/notice/NoticeRegion'
import { PageContainer } from '../shared/ui/PageContainer'
import { RouteProgressBar } from './RouteProgressBar'
import { SkipLink } from './SkipLink'
import { useRouteFocus } from './useRouteFocus'

function CartGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6 shrink-0 text-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.8a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
    </svg>
  )
}

// UX-DR3: skip link, one header, one main#main and one footer on every page.
export function RootLayout() {
  useRouteFocus()
  // AD-14: the one place the Cart is reconciled with the catalog.
  useCartReconciliation()

  return (
    <div className="flex min-h-svh flex-col">
      <SkipLink />
      <RouteProgressBar />
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <PageContainer className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex min-h-touch-target items-center gap-2 text-h3 text-foreground"
          >
            <CartGlyph />
            Simple Shopping Cart
          </Link>
          <nav aria-label="Main" className="flex items-center gap-2">
            <NavLink
              to="/products"
              end
              className="inline-flex min-h-touch-target items-center px-2 text-label text-primary aria-[current=page]:underline"
            >
              Shop
            </NavLink>
            <CartIndicator />
          </nav>
        </PageContainer>
      </header>
      <main id="main" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      {/* UX-DR18: the one Notice region, mounted right after main. */}
      <NoticeRegion />
      <footer className="border-t border-border bg-surface">
        <PageContainer className="py-4">
          {/* UX-DR23: links inside running text are always underlined. */}
          <p className="text-body-sm text-muted-foreground">
            Demo store · No real orders or payments ·{' '}
            <Link
              to="/products"
              className="inline-flex min-h-touch-target items-center text-primary underline"
            >
              Shop
            </Link>
          </p>
        </PageContainer>
      </footer>
      <ScrollRestoration />
    </div>
  )
}
