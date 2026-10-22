import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { productFixtures } from '../mocks/fixtures/products'
import { server } from '../mocks/node'
import { scenarios } from '../mocks/scenarios'
import { PRODUCT_API_ORIGIN } from '../shared/api/dto'
import { configureStore } from '@reduxjs/toolkit'
import { cartReducer } from '../features/cart'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { ProductListingPage } from './ProductListingPage'

const makeStore = () =>
  configureStore({ reducer: { cart: cartReducer, notices: noticesReducer } })

const ERROR_TEXT =
  "We couldn't load products. Check your connection and try again."

function renderListing(path = '/products') {
  return renderWithRouter(
    [{ path: '/products', Component: ProductListingPage }],
    path,
    makeStore(),
  )
}

const region = () => screen.getByRole('region', { name: 'Products' })
const cards = () => within(region()).queryAllByRole('article')
const cardTitles = () =>
  cards().map((card) => within(card).getByRole('heading').textContent)

// jsdom has no scrollIntoView; stub it per test and restore the original afterwards.
const originalScrollIntoView = Element.prototype.scrollIntoView
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  Element.prototype.scrollIntoView = originalScrollIntoView
  vi.restoreAllMocks()
})

const stalledCatalog = () =>
  http.get(`${PRODUCT_API_ORIGIN}/products`, async () => {
    await delay('infinite')
    return HttpResponse.json({})
  })

/** The skeleton grid is aria-hidden, so count its cards from the DOM. */
const skeletonCards = () =>
  region().querySelectorAll('ul[aria-hidden="true"] > li')

describe('Product Listing (FR1)', () => {
  it('FR33: shows 8 skeleton cards in a busy region while the catalog loads', async () => {
    server.use(stalledCatalog())
    renderListing()

    expect(await screen.findByText('Loading products…')).toBeInTheDocument()
    expect(region()).toHaveAttribute('aria-busy', 'true')
    expect(skeletonCards()).toHaveLength(8)
    // The placeholder list is hidden from assistive tech (no empty "list, 8 items").
    expect(within(region()).queryAllByRole('listitem')).toHaveLength(0)
    expect(cards()).toHaveLength(0)
  })

  it('FR1: renders the first 20 Products, the total count, and keeps out-of-stock Products', async () => {
    renderListing()

    expect(
      await screen.findByText(`${productFixtures.length} products`),
    ).toBeInTheDocument()
    expect(region()).toHaveAttribute('aria-busy', 'false')
    expect(cards()).toHaveLength(20)
    expect(cardTitles()[0]).toBe(productFixtures[0].title)
    // AD-9: id 7 (stock 0) is on page 1 and is shown.
    const outOfStock = cards().find(
      (card) => within(card).queryAllByText('Out of stock').length > 0,
    )
    expect(outOfStock).toBeDefined()
  })

  it('UX-DR14: page 2 is read from the URL', async () => {
    renderListing('/products?page=2')

    await screen.findByText(`${productFixtures.length} products`)
    expect(cardTitles()).toEqual(productFixtures.slice(20).map((p) => p.title))
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it.each(['abc', '0', '99', '1.5'])(
    'AD-7: an invalid page (%s) falls back to page 1 and the URL is normalised',
    async (raw) => {
      const { router } = renderListing(`/products?page=${raw}`)

      await screen.findByText(`${productFixtures.length} products`)
      expect(cardTitles()[0]).toBe(productFixtures[0].title)
      await waitFor(() => expect(router.state.location.search).toBe(''))
      // Replaced, not pushed: Back doesn't return to the invalid URL.
      expect(router.state.historyAction).toBe('REPLACE')
      expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
        'aria-current',
        'page',
      )
    },
  )

  it('UX-DR14: changing page writes ?page, focuses the count and scrolls it into view', async () => {
    const user = userEvent.setup()
    const { router } = renderListing()
    await screen.findByText(`${productFixtures.length} products`)

    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    await user.click(within(nav).getByRole('button', { name: 'Next' }))

    expect(router.state.location.search).toBe('?page=2')
    await waitFor(() => expect(cards()).toHaveLength(4))
    const count = screen.getByText(`${productFixtures.length} products`)
    expect(count).toHaveFocus()
    expect(count.scrollIntoView).toHaveBeenCalled()

    await user.click(within(nav).getByRole('button', { name: 'Page 1' }))
    expect(router.state.location.search).toBe('')
  })

  it('UX-DR14: Previous is aria-disabled on page 1 and does nothing', async () => {
    const user = userEvent.setup()
    const { router } = renderListing()
    await screen.findByText(`${productFixtures.length} products`)

    const previous = screen.getByRole('button', { name: 'Previous' })
    expect(previous).toHaveAttribute('aria-disabled', 'true')
    await user.click(previous)
    expect(router.state.location.search).toBe('')
  })

  it('UX-DR14: Pagination is hidden when everything fits on one page', async () => {
    server.use(scenarios.catalogOf(productFixtures.slice(0, 5)))
    renderListing()

    expect(await screen.findByText('5 products')).toBeInTheDocument()
    expect(cards()).toHaveLength(5)
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
  })

  it('FR34: a network failure shows an inline Alert with Retry', async () => {
    server.use(scenarios.networkError)
    renderListing()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(ERROR_TEXT)
    expect(
      within(alert).getByRole('button', { name: 'Retry' }),
    ).toBeInTheDocument()
    expect(region()).toHaveAttribute('aria-busy', 'false')
  })

  it('FR34: a server error shows the same Alert', async () => {
    server.use(scenarios.serverError)
    renderListing()

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_TEXT)
  })

  it('FR34: Retry refetches without a reload and moves focus to the region', async () => {
    const user = userEvent.setup()
    server.use(scenarios.networkError)
    renderListing()
    const retry = await screen.findByRole('button', { name: 'Retry' })

    server.resetHandlers()
    server.use(stalledCatalog())
    await user.click(retry)

    // While the retry is in flight: skeleton, busy region, no stale Alert.
    expect(region()).toHaveFocus()
    expect(region()).toHaveAttribute('aria-busy', 'true')
    expect(skeletonCards()).toHaveLength(8)
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByText('Loading products…')).toBeInTheDocument()
  })

  it('FR34: Retry that succeeds shows the products', async () => {
    const user = userEvent.setup()
    server.use(scenarios.networkError)
    renderListing()
    const retry = await screen.findByRole('button', { name: 'Retry' })

    server.resetHandlers()
    await user.click(retry)

    expect(region()).toHaveFocus()
    expect(region()).toHaveAttribute('tabindex', '-1')
    expect(
      await screen.findByText(`${productFixtures.length} products`),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(cards()).toHaveLength(20)
  })

  it('FR34: an incomplete catalog is shown as a load error, never as a partial list', async () => {
    server.use(scenarios.incompleteCatalog)
    renderListing()

    expect(await screen.findByRole('alert')).toHaveTextContent(ERROR_TEXT)
    expect(cards()).toHaveLength(0)
  })

  it('FR34: a failed background refetch keeps showing the loaded products', async () => {
    const { queryClient } = renderListing()
    await screen.findByText(`${productFixtures.length} products`)

    server.use(scenarios.networkError)
    await act(() => queryClient.refetchQueries())

    expect(queryClient.getQueryState(['catalog', 'list'])?.status).toBe('error')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(cards()).toHaveLength(20)
    expect(
      screen.getByText(`${productFixtures.length} products`),
    ).toBeInTheDocument()
  })

  it('UX-DR32: the page has one h1 and titles the tab', async () => {
    renderListing()

    await screen.findByText(`${productFixtures.length} products`)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await act(async () => {})
    expect(document.title).toBe('Products · Simple Shopping Cart')
  })
})

describe('Search, filter and sort (FR2–FR6)', () => {
  const searchInput = () =>
    screen.getByRole('searchbox', { name: 'Search products' })
  const categorySelect = () =>
    screen.getByRole('combobox', { name: 'Category' })
  const sortSelect = () => screen.getByRole('combobox', { name: 'Sort by' })
  const count = () => screen.getByText(/^\d+ products?$/)
  const loaded = () => screen.findByText(/^\d+ products?$/)
  const optionTexts = (select: HTMLElement) =>
    within(select)
      .getAllByRole('option')
      .map((o) => o.textContent)

  it('FR2: typing searches after a 300 ms pause, with history replace', async () => {
    const user = userEvent.setup()
    const { router } = renderListing()
    await loaded()

    await user.type(searchInput(), 'lip')
    expect(router.state.location.search).toBe('')

    await waitFor(() => expect(router.state.location.search).toBe('?q=lip'))
    expect(router.state.historyAction).toBe('REPLACE')
    // The router state can update before React renders the new results.
    await waitFor(() => expect(cardTitles()).toEqual(['Red Lipstick']))
    expect(count()).toHaveTextContent('1 product')
    // UX-DR32: focus stays on the control used; the change is announced via the status.
    expect(searchInput()).toHaveFocus()
    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 product')
  })

  it('FR2: Enter searches at once', async () => {
    const user = userEvent.setup()
    const { router } = renderListing()
    await loaded()

    await user.type(searchInput(), 'WATCH{Enter}')

    expect(router.state.location.search).toBe('?q=WATCH')
    expect(await screen.findByText('0 products')).toBeInTheDocument()
  })

  it('FR2: clearing the search keeps the Category and sort, and focuses the input', async () => {
    const user = userEvent.setup()
    const { router } = renderListing(
      '/products?q=lip&category=beauty&sort=price-asc',
    )
    await loaded()
    expect(searchInput()).toHaveValue('lip')

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(router.state.location.search).toBe('?category=beauty&sort=price-asc')
    expect(searchInput()).toHaveValue('')
    expect(searchInput()).toHaveFocus()
    expect(await screen.findByText('5 products')).toBeInTheDocument()
  })

  it('FR3: the Category select lists API Categories after "All categories" and resets the page', async () => {
    const user = userEvent.setup()
    const { router } = renderListing('/products?page=2')
    await loaded()
    await waitFor(() =>
      expect(optionTexts(categorySelect())).toEqual([
        'All categories',
        'Beauty',
        'Fragrances',
        'Furniture',
        'Groceries',
        'Mens Watches',
      ]),
    )

    await user.selectOptions(categorySelect(), 'fragrances')

    expect(router.state.location.search).toBe('?category=fragrances')
    expect(router.state.historyAction).toBe('PUSH')
    expect(await screen.findByText('5 products')).toBeInTheDocument()
    expect(categorySelect()).toHaveFocus()
  })

  it('FR4: sorting applies to the whole result set', async () => {
    const user = userEvent.setup()
    const { router } = renderListing()
    await loaded()

    await user.selectOptions(sortSelect(), 'price-asc')
    expect(router.state.location.search).toBe('?sort=price-asc')
    await waitFor(() => expect(cardTitles()[0]).toBe('Cucumber'))

    await user.selectOptions(sortSelect(), 'price-desc')
    await waitFor(() => expect(cardTitles()[0]).toBe('Annibale Colombo Sofa'))
    expect(optionTexts(sortSelect())).toEqual([
      'Relevance',
      'Price: low to high',
      'Price: high to low',
    ])
  })

  it('FR5: a criteria URL reproduces the same results on load', async () => {
    renderListing('/products?q=e&category=groceries&sort=price-desc')
    await loaded()

    const expected = productFixtures
      .filter(
        (p) =>
          p.category === 'groceries' &&
          (p.title.toLowerCase().includes('e') ||
            p.description.toLowerCase().includes('e')),
      )
      .sort((a, b) => b.price - a.price)
      .map((p) => p.title)
    expect(cardTitles()).toEqual(expected)
    expect(searchInput()).toHaveValue('e')
    await waitFor(() => expect(categorySelect()).toHaveValue('groceries'))
    expect(sortSelect()).toHaveValue('price-desc')
  })

  it('AD-7: invalid criteria fall back to defaults without an error', async () => {
    renderListing('/products?sort=cheap&category=Bad%20Slug!')

    expect(
      await screen.findByText(`${productFixtures.length} products`),
    ).toBeInTheDocument()
    expect(sortSelect()).toHaveValue('relevance')
    expect(categorySelect()).toHaveValue('')
    expect(screen.queryByRole('list', { name: 'Active filters' })).toBeNull()
  })

  it('UX-DR13: each criterion is a chip; removing one keeps the rest and focuses search', async () => {
    const user = userEvent.setup()
    const { router } = renderListing(
      '/products?q=lip&category=beauty&sort=price-desc',
    )
    await loaded()

    const chips = screen.getByRole('list', { name: 'Active filters' })
    await waitFor(() =>
      expect(
        within(chips)
          .getAllByRole('listitem')
          .map((c) => c.textContent),
      ).toEqual(['“lip”×', 'Beauty×', 'Price: high to low×']),
    )

    await user.click(
      screen.getByRole('button', { name: 'Remove filter: Beauty' }),
    )
    expect(router.state.location.search).toBe('?q=lip&sort=price-desc')
    expect(searchInput()).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(router.state.location.search).toBe('')
    expect(screen.queryByRole('list', { name: 'Active filters' })).toBeNull()
    expect(searchInput()).toHaveFocus()
  })

  it('FR6: no matches shows an h2, a sentence naming the criteria, and Clear filters', async () => {
    const user = userEvent.setup()
    const { router } = renderListing('/products?q=steel&category=mens-watches')
    await loaded()

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'No products match',
      }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(
        screen.getByText('No products match “steel” in Mens Watches.'),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()

    await user.click(
      within(region()).getByRole('button', { name: 'Clear filters' }),
    )
    expect(router.state.location.search).toBe('')
    expect(
      await screen.findByText(`${productFixtures.length} products`),
    ).toBeInTheDocument()
  })

  it('UX-DR25: when Categories fail, the select says so with a Retry, and search still works', async () => {
    const user = userEvent.setup()
    server.use(scenarios.categoriesError)
    renderListing()
    await loaded()

    await waitFor(() =>
      expect(optionTexts(categorySelect())).toEqual(['Categories unavailable']),
    )
    const retry = screen.getByRole('button', { name: 'Retry' })

    await user.type(searchInput(), 'lip{Enter}')
    expect(await screen.findByText('1 product')).toBeInTheDocument()

    server.resetHandlers()
    await user.click(retry)
    await waitFor(() =>
      expect(within(categorySelect()).getAllByRole('option')).toHaveLength(6),
    )
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull()
  })

  it('FR1: cards show the Category name from the Product API', async () => {
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products/categories`, () =>
        HttpResponse.json([
          {
            slug: 'beauty',
            name: 'Beauty & Care',
            url: `${PRODUCT_API_ORIGIN}/products/category/beauty`,
          },
        ]),
      ),
    )
    renderListing('/products?category=beauty')
    await loaded()

    await waitFor(() =>
      expect(within(cards()[0]).getByText('Beauty & Care')).toBeInTheDocument(),
    )
  })
})

describe('Search, filter and sort: review hardening', () => {
  const searchInput = () =>
    screen.getByRole('searchbox', { name: 'Search products' })
  const categorySelect = () =>
    screen.getByRole('combobox', { name: 'Category' })
  const loaded = () => screen.findByText(/^\d+ products?$/)
  const status = () => screen.getByRole('status')

  it('UX-DR32: the status announces the count and the sort, so a re-sort is confirmed', async () => {
    const user = userEvent.setup()
    renderListing()
    await loaded()
    expect(status()).toHaveTextContent(
      `Showing ${productFixtures.length} products`,
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Sort by' }),
      'price-asc',
    )

    await waitFor(() =>
      expect(status()).toHaveTextContent(
        `Showing ${productFixtures.length} products, sorted by Price: low to high`,
      ),
    )
    expect(status()).toHaveAttribute('aria-atomic', 'true')
  })

  it('UX-DR11: the input follows q when it changes elsewhere (Clear filters, Back)', async () => {
    const user = userEvent.setup()
    const { router } = renderListing('/products?q=lip')
    await loaded()

    await act(() => router.navigate('/products?q=gold'))
    await waitFor(() => expect(searchInput()).toHaveValue('gold'))

    await act(() => router.navigate(-1))
    await waitFor(() => expect(searchInput()).toHaveValue('lip'))

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(router.state.location.search).toBe('')
    expect(searchInput()).toHaveValue('')
  })

  it('UX-DR11: a pending search does not overwrite a newer URL', async () => {
    const user = userEvent.setup()
    const { router } = renderListing('/products?category=beauty')
    await loaded()

    await user.type(searchInput(), 'lip')
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(router.state.location.search).toBe('')

    // Longer than the 300 ms debounce: the cancelled timer must not bring `q` back.
    await act(() => new Promise((resolve) => setTimeout(resolve, 450)))
    expect(router.state.location.search).toBe('')
  })

  it('AD-7: the search input is limited to the 100 characters the URL keeps', async () => {
    renderListing()
    await loaded()
    expect(searchInput()).toHaveAttribute('maxLength', '100')
  })

  it('UX-DR25: when Categories fail, an active Category stays selected and applied', async () => {
    server.use(scenarios.categoriesError)
    renderListing('/products?category=beauty')

    expect(await screen.findByText('5 products')).toBeInTheDocument()
    await waitFor(() =>
      expect(
        within(categorySelect())
          .getAllByRole('option')
          .map((o) => o.textContent),
      ).toEqual(['Categories unavailable', 'Beauty']),
    )
    expect(categorySelect()).toHaveValue('beauty')
    expect(
      screen.getByRole('button', { name: 'Remove filter: Beauty' }),
    ).toBeInTheDocument()
  })

  it('FR6: a well-formed Category slug that is not in the list is kept and named', async () => {
    renderListing('/products?category=mens-shirts')

    expect(await screen.findByText('0 products')).toBeInTheDocument()
    await waitFor(() => expect(categorySelect()).toHaveValue('mens-shirts'))
    expect(
      within(categorySelect()).getByRole('option', { name: 'Mens Shirts' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No products match the Mens Shirts category.'),
    ).toBeInTheDocument()
  })

  it('FR6: an empty catalog shows the empty state without a pointless Clear filters', async () => {
    server.use(scenarios.catalogOf([]))
    renderListing()

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'No products match',
      }),
    ).toBeInTheDocument()
    expect(within(region()).queryByRole('button')).toBeNull()
  })
})
