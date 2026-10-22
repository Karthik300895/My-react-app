import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { Outlet } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { productFixtures } from '../mocks/fixtures/products'
import { server } from '../mocks/node'
import { scenarios } from '../mocks/scenarios'
import { PRODUCT_API_ORIGIN } from '../shared/api/dto'
import { configureStore } from '@reduxjs/toolkit'
import { cartReducer } from '../features/cart'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { ProductDetailsPage } from './ProductDetailsPage'
import { ProductListingPage } from './ProductListingPage'

const makeStore = () =>
  configureStore({ reducer: { cart: cartReducer, notices: noticesReducer } })

const ERROR_TEXT =
  "We couldn't load this product. Check your connection and try again."

function renderApp(path: Parameters<typeof renderWithRouter>[1]) {
  return renderWithRouter(
    [
      {
        path: '/',
        Component: () => (
          <main>
            <Outlet />
          </main>
        ),
        children: [
          { path: 'products', Component: ProductListingPage },
          { path: 'products/:productId', Component: ProductDetailsPage },
        ],
      },
    ],
    path,
    makeStore(),
  )
}

const fixture = (id: number) => {
  const product = productFixtures.find((p) => p.id === id)
  if (!product) throw new Error(`No fixture ${id}`)
  return product
}
const heading = () => screen.findByRole('heading', { level: 1 })
const region = () => screen.getByRole('region', { name: 'Product' })

/** Every request made to the Product API, as paths. */
function recordRequests() {
  const paths: string[] = []
  server.events.on('request:start', ({ request }) => {
    paths.push(new URL(request.url).pathname)
  })
  return paths
}

const stalledProduct = () =>
  http.get(`${PRODUCT_API_ORIGIN}/products/:id`, async () => {
    await delay('infinite')
    return HttpResponse.json({})
  })

// jsdom has no scrollIntoView (the listing uses it on page changes); restore it afterwards.
const originalScrollIntoView = Element.prototype.scrollIntoView
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
  // jsdom has no scrollTo either; ScrollRestoration calls it on every navigation.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
  server.events.removeAllListeners()
  vi.restoreAllMocks()
})

describe('Product Details (FR7)', () => {
  it('FR7, UX-DR26: shows the gallery, Category, h1, rating, price, stock, description and the Add to Cart action', async () => {
    const product = fixture(2)
    renderApp('/products/2')

    expect(await heading()).toHaveTextContent(product.title)
    expect(screen.getByText('Beauty')).toBeInTheDocument()
    expect(screen.getByText('Rated 3.3 out of 5')).toBeInTheDocument()
    expect(screen.getByText('$19.99')).toHaveClass(
      'text-price-lg',
      'tabular-nums',
    )
    expect(screen.getByText('In stock')).toHaveClass('rounded-full')
    expect(screen.getByText(product.description)).toBeInTheDocument()
    // FR10: the page fills the action slot with cart's Add to Cart control (Story 2.1).
    const slot = region().querySelector<HTMLElement>('[data-slot="action"]')
    expect(
      within(slot!).getByRole('button', { name: 'Add to Cart' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    // Two columns from md, stacked below it (the real layout is checked in e2e).
    expect(region().firstElementChild).toHaveClass('grid', 'md:grid-cols-2')
  })

  it('UX-DR32: titles the tab with the Product title', async () => {
    renderApp('/products/2')
    await heading()
    await waitFor(() =>
      expect(document.title).toBe(
        'Eyeshadow Palette with Mirror · Simple Shopping Cart',
      ),
    )
  })

  it.each([
    [2, 'In stock'],
    [1, 'Only 5 left'],
    [7, 'Out of stock'],
  ])('FR8, UX-DR7: Product %i reads "%s" as text', async (id, label) => {
    renderApp(`/products/${id}`)
    await heading()
    // The Add to Cart control can repeat the reason (Story 2.1), so target the stock badge.
    expect(
      within(region()).getByText(label, { selector: '.rounded-full' }),
    ).toBeInTheDocument()
  })

  it('AD-9: an out-of-stock Product is shown in full, with the desaturated image', async () => {
    const product = fixture(7)
    renderApp('/products/7')
    expect(await heading()).toHaveTextContent(product.title)
    expect(
      screen.getByRole('img', { name: `${product.title}, image 1 of 3` }),
    ).toHaveClass('[filter:var(--oos-image-filter)]')
  })
})

describe('Product Gallery (UX-DR15)', () => {
  it('UX-DR15: a thumbnail swaps the main image, is pressed with a teal border, and keeps focus', async () => {
    const user = userEvent.setup()
    const product = fixture(2)
    renderApp('/products/2')
    await heading()

    const thumbnails = screen.getAllByRole('button', { name: /^Show image/ })
    expect(thumbnails).toHaveLength(5)
    expect(
      screen.getByRole('img', { name: `${product.title}, image 1 of 5` }),
    ).toHaveAttribute('src', product.images[0])

    const second = screen.getByRole('button', { name: 'Show image 2 of 5' })
    await user.click(second)

    expect(
      screen.getByRole('img', { name: `${product.title}, image 2 of 5` }),
    ).toHaveAttribute('src', product.images[1])
    expect(second).toHaveAttribute('aria-pressed', 'true')
    expect(second).toHaveClass('border-primary')
    expect(thumbnails[0]).toHaveAttribute('aria-pressed', 'false')
    expect(thumbnails[0]).toHaveClass('border-border')
    expect(second).toHaveFocus()
  })

  it('UX-DR15: no images falls back to the thumbnail; duplicate URLs show once', async () => {
    const product = fixture(2)
    const [a, b] = product.images
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products/:id`, ({ params }) =>
        HttpResponse.json(
          params.id === '2'
            ? { ...product, images: [] }
            : { ...fixture(1), images: [a, a, b] },
        ),
      ),
    )
    const { router } = renderApp('/products/2')
    await heading()
    expect(screen.getByRole('img', { name: product.title })).toHaveAttribute(
      'src',
      product.thumbnail,
    )
    expect(screen.queryByRole('button', { name: /^Show image/ })).toBeNull()

    await router.navigate('/products/1')
    expect(
      await screen.findAllByRole('button', { name: /^Show image \d of 2$/ }),
    ).toHaveLength(2)
  })

  it('UX-DR15: a single image has no thumbnails and uses the title as alt', async () => {
    const product = fixture(3)
    renderApp('/products/3')
    await heading()
    expect(screen.getByRole('img', { name: product.title })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Show image/ })).toBeNull()
  })
})

describe('Back to products (FR7)', () => {
  it('FR7: returns to the filtered listing the Shopper came from', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/products?category=beauty&sort=price-desc')
    await user.click(
      await screen.findByRole('link', {
        name: 'Eyeshadow Palette with Mirror',
      }),
    )
    await heading()
    expect(router.state.location.pathname).toBe('/products/2')

    const back = screen.getByRole('link', { name: 'Back to products' })
    expect(back).toHaveAttribute(
      'href',
      '/products?category=beauty&sort=price-desc',
    )
    // A modified click (new tab or window) is left to the browser, not intercepted.
    expect(fireEvent.click(back, { ctrlKey: true })).toBe(true)
    expect(router.state.location.pathname).toBe('/products/2')

    await user.click(back)

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/products'),
    )
    expect(router.state.location.search).toBe(
      '?category=beauty&sort=price-desc',
    )
    // It went back in history rather than adding an entry.
    expect(router.state.historyAction).toBe('POP')
    expect(
      await screen.findByRole('combobox', { name: 'Category' }),
    ).toHaveValue('beauty')
  })

  it('FR7: as the first entry, it follows the stored listing URL instead of going back', async () => {
    const user = userEvent.setup()
    const { router } = renderApp({
      pathname: '/products/2',
      state: { listingUrl: '/products?q=lip' },
    })
    await heading()
    await user.click(screen.getByRole('link', { name: 'Back to products' }))

    await waitFor(() => expect(router.state.location.search).toBe('?q=lip'))
    expect(router.state.historyAction).toBe('PUSH')
  })

  it('FR7: opened directly, it links to the unfiltered listing', async () => {
    renderApp('/products/2')
    await heading()
    expect(
      screen.getByRole('link', { name: 'Back to products' }),
    ).toHaveAttribute('href', '/products')
  })
})

describe('Product not found (FR9)', () => {
  it.each(['abc', '-1', '1.5', '0'])(
    'FR9: /products/%s shows "Product not found" at once, with no request',
    async (id) => {
      const requests = recordRequests()
      renderApp(`/products/${id}`)

      expect(await heading()).toHaveTextContent('Product not found')
      expect(
        screen.getByRole('link', { name: 'Browse products' }),
      ).toHaveAttribute('href', '/products')
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(requests).toEqual([])
      expect(document.title).toBe('Product not found · Simple Shopping Cart')
    },
  )

  it.each([
    ['an unknown id (404)', '/products/999', undefined],
    ['a 400 answer', '/products/2', 400],
  ])(
    'FR9: %s shows the not-found page with Browse products and no Retry',
    async (_, path, status) => {
      if (status) server.use(scenarios.productStatus(status))
      renderApp(path)

      expect(await heading()).toHaveTextContent('Product not found')
      expect(
        screen.getByText('It may have been removed, or the link is wrong.'),
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Browse products' })).toHaveClass(
        'bg-primary',
      )
      expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
      expect(screen.queryByRole('alert')).toBeNull()
      await waitFor(() =>
        expect(document.title).toBe('Product not found · Simple Shopping Cart'),
      )
    },
  )
})

describe('Loading and errors (FR33, FR34)', () => {
  it('FR33: shows a skeleton gallery and text bars in a busy region', async () => {
    server.use(stalledProduct())
    renderApp('/products/2')

    expect(await screen.findByText('Loading product…')).toBeInTheDocument()
    expect(region()).toHaveAttribute('aria-busy', 'true')
    expect(
      region().querySelectorAll('[aria-hidden="true"] .animate-shimmer').length,
    ).toBeGreaterThan(5)
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it.each([
    ['a server error', () => scenarios.productStatus(500)],
    ['a network error', () => scenarios.productNetworkError],
  ])(
    'FR34: %s shows an Alert whose Retry loads the Product',
    async (_, failure) => {
      const user = userEvent.setup()
      server.use(failure())
      renderApp('/products/2')

      expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_TEXT)
      server.resetHandlers()
      await user.click(screen.getByRole('button', { name: 'Retry' }))

      expect(await heading()).toHaveTextContent('Eyeshadow Palette with Mirror')
      expect(screen.queryByRole('alert')).toBeNull()
    },
  )
})
