import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Store } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import {
  createMemoryRouter,
  type InitialEntry,
  type RouteObject,
} from 'react-router'
import { RouterProvider } from 'react-router/dom'

/**
 * Test helper: a fresh QueryClient (no retries), the given Redux store, and a memory router
 * at `path`. Callers pass their own store, so shared/ never imports app/ (AD-1).
 */
export function renderWithRouter(
  routes: RouteObject[],
  path: InitialEntry,
  store: Store,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>,
  )
  return { router, queryClient }
}
