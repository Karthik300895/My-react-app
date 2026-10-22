import { createBrowserRouter, type RouteObject } from 'react-router'
import { ErrorPage } from './ErrorPage'
import { RootLayout } from './RootLayout'
import { ProgressBar } from './RouteProgressBar'

// AD-11: the single route table. Page modules are lazy-loaded; the root ErrorBoundary
// catches render errors and failed module loads (FR35).
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: ErrorPage,
    // UX-DR22: the first lazy page module shows the progress bar, not a blank screen.
    HydrateFallback: ProgressBar,
    children: [
      {
        index: true,
        lazy: () =>
          import('../pages/HomePage').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: 'products',
        lazy: () =>
          import('../pages/ProductListingPage').then((m) => ({
            Component: m.ProductListingPage,
          })),
      },
      {
        path: 'products/:productId',
        lazy: () =>
          import('../pages/ProductDetailsPage').then((m) => ({
            Component: m.ProductDetailsPage,
          })),
      },
      {
        path: 'cart',
        lazy: () =>
          import('../pages/CartPage').then((m) => ({ Component: m.CartPage })),
      },
      {
        path: 'checkout',
        lazy: () =>
          import('../pages/CheckoutPage').then((m) => ({
            Component: m.CheckoutPage,
          })),
      },
      {
        path: 'order-confirmation',
        lazy: () =>
          import('../pages/OrderConfirmationPage').then((m) => ({
            Component: m.OrderConfirmationPage,
          })),
      },
      {
        path: '*',
        lazy: () =>
          import('../pages/NotFoundPage').then((m) => ({
            Component: m.NotFoundPage,
          })),
      },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(routes)
}
