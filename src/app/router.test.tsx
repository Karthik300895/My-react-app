import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { productFixtures } from '../mocks/fixtures/products'
import { server } from '../mocks/node'
import { PRODUCT_API_ORIGIN } from '../shared/api/dto'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { routes } from './router'
import { makeStore } from './store'

function renderAt(path: string, table: RouteObject[] = routes) {
  return renderWithRouter(table, path, makeStore()).router
}

// The real route table plus one extra child route under the root layout.
function withChild(child: RouteObject): RouteObject[] {
  const [root] = routes
  if (root.index) throw new Error('The root route cannot be an index route')
  return [{ ...root, children: [...(root.children ?? []), child] }]
}

const HOME_H1 = /find your favourite/i

const h1 = (name: string | RegExp) =>
  screen.findByRole('heading', { level: 1, name })

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('route table (AD-11)', () => {
  it.each([
    ['/', /find your favourite/i, 'Home'],
    ['/products', 'Products', 'Products'],
    [
      '/products/1',
      'Essence Mascara Lash Princess',
      'Essence Mascara Lash Princess',
    ],
    ['/cart', 'Your cart', 'Cart'],
    ['/checkout', 'Checkout', 'Checkout'],
    ['/order-confirmation', 'Order confirmation', 'Order confirmation'],
  ])(
    'FR30: %s renders its page with one h1 and a page title',
    async (path, heading, title) => {
      renderAt(path)

      expect(await h1(heading)).toBeInTheDocument()
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
      await waitFor(() =>
        expect(document.title).toBe(`${title} · Simple Shopping Cart`),
      )
    },
  )

  it('FR30: browser Back and Forward move between visited pages', async () => {
    const router = renderAt('/')
    await h1(HOME_H1)

    await act(() => router.navigate('/cart'))
    expect(await h1('Your cart')).toBeInTheDocument()

    await act(() => router.navigate(-1))
    expect(await h1(HOME_H1)).toBeInTheDocument()

    await act(() => router.navigate(1))
    expect(await h1('Your cart')).toBeInTheDocument()
  })

  it('FR32: an unknown URL shows Not Found with links to Home and Shop', async () => {
    renderAt('/nope')

    const heading = await h1('Page not found')
    expect(heading).toHaveClass('text-display')
    const main = screen.getByRole('main')
    expect(
      within(main).getByRole('link', { name: 'Go to Home' }),
    ).toHaveAttribute('href', '/')
    expect(
      within(main).getByRole('link', { name: 'Browse the shop' }),
    ).toHaveAttribute('href', '/products')
    await waitFor(() =>
      expect(document.title).toBe('Page not found · Simple Shopping Cart'),
    )
  })
})

describe('store shell (UX-DR3)', () => {
  it('UX-DR3: renders one header, main#main and footer, with the skip link first in Tab order', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await h1(HOME_H1)

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)

    await user.tab()
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('href', '#main')
  })

  it('UX-DR3: the header has the wordmark and a Shop link; the footer note links to Shop', async () => {
    renderAt('/')
    await h1(HOME_H1)

    const header = screen.getByRole('banner')
    expect(
      within(header).getByRole('link', { name: 'Simple Shopping Cart' }),
    ).toHaveAttribute('href', '/')
    expect(within(header).getByRole('link', { name: 'Shop' })).toHaveAttribute(
      'href',
      '/products',
    )
    expect(within(header).queryByRole('button')).toBeNull()
    expect(
      within(header).getByRole('link', { name: 'Shop' }),
    ).not.toHaveAttribute('aria-current')

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Demo store · No real orders or payments')
    const footerLink = within(footer).getByRole('link', { name: 'Shop' })
    expect(footerLink).toHaveAttribute('href', '/products')
    // UX-DR23: links inside running text are underlined, not shown by colour alone.
    expect(footerLink).toHaveClass('underline')
  })
})

describe('route-change focus (UX-DR32)', () => {
  it('UX-DR3: the Shop link is current on /products only, not on Product Details', async () => {
    const router = renderAt('/products')
    await h1('Products')
    const shop = () =>
      within(screen.getByRole('banner')).getByRole('link', { name: 'Shop' })
    expect(shop()).toHaveAttribute('aria-current', 'page')

    await act(() => router.navigate('/products/1'))
    await h1('Essence Mascara Lash Princess')

    expect(shop()).not.toHaveAttribute('aria-current')
  })

  it('UX-DR32: the initial load does not move focus', async () => {
    renderAt('/')
    await h1(HOME_H1)

    expect(document.body).toHaveFocus()
  })

  it('UX-DR32: a path change moves focus to the new page h1', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await h1(HOME_H1)

    await user.click(
      within(screen.getByRole('banner')).getByRole('link', { name: 'Shop' }),
    )

    const heading = await h1('Products')
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it.each(['/products/2', '/products/999', '/products/abc'])(
    'UX-DR32: a direct load of %s leaves focus alone once it renders',
    async (path) => {
      renderAt(path)
      await h1(/Eyeshadow Palette with Mirror|Product not found/)
      await new Promise((resolve) => setTimeout(resolve, 20))
      expect(document.body).toHaveFocus()
    },
  )

  it('AD-11: navigating to an unknown Product moves focus to "Product not found"', async () => {
    const router = renderAt('/products')
    await h1('Products')

    await act(() => router.navigate('/products/999'))

    const heading = await h1('Product not found')
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it('AD-11: on Product Details, focus moves from main to the h1 once the Product arrives', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(`${PRODUCT_API_ORIGIN}/products/:id`, async () => {
        await delay(50)
        return HttpResponse.json(
          productFixtures.find((p) => p.id === 2) ?? null,
        )
      }),
    )
    renderAt('/products')
    await user.click(
      await screen.findByRole('link', {
        name: 'Eyeshadow Palette with Mirror',
      }),
    )

    // While the Product loads there is no h1, so the route focus lands on main.
    await waitFor(() => expect(screen.getByRole('main')).toHaveFocus())
    const heading = await h1('Eyeshadow Palette with Mirror')
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it('UX-DR32: a query-only change keeps focus on the control used and keeps the title', async () => {
    const router = renderAt('/products')
    await h1('Products')
    await waitFor(() =>
      expect(document.title).toBe('Products · Simple Shopping Cart'),
    )
    const control = within(screen.getByRole('banner')).getByRole('link', {
      name: 'Shop',
    })
    control.focus()

    await act(() => router.navigate('/products?q=phone'))

    expect(router.state.location.search).toBe('?q=phone')
    expect(control).toHaveFocus()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Products' }),
    ).not.toHaveFocus()
    expect(document.title).toBe('Products · Simple Shopping Cart')
  })
})

describe('lazy page loading (UX-DR22)', () => {
  it('UX-DR22: the first page load shows the progress bar until its module arrives', async () => {
    const warn = vi.spyOn(console, 'warn')
    renderAt('/')

    expect(
      screen.getByRole('progressbar', { name: 'Loading page' }),
    ).toBeInTheDocument()
    expect(await h1(HOME_H1)).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('HydrateFallback'),
    )
  })

  it('UX-DR22: shows the progress bar while a page module loads, keeping the previous page visible', async () => {
    let finish: () => void = () => {}
    const slowPage = new Promise<{ Component: () => React.JSX.Element }>(
      (resolve) => {
        finish = () => resolve({ Component: () => <h1>Slow page</h1> })
      },
    )
    const router = renderAt(
      '/',
      withChild({ path: 'slow', lazy: () => slowPage }),
    )
    await h1(HOME_H1)

    act(() => {
      void router.navigate('/slow')
    })

    expect(
      await screen.findByRole('progressbar', { name: 'Loading page' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: HOME_H1 }),
    ).toBeInTheDocument()

    await act(async () => finish())

    expect(await h1('Slow page')).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).toBeNull()
  })
})

describe('global error page (FR35)', () => {
  it('FR35: a render error shows the fallback and leaves Local Storage untouched', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem('ssc.cart.v1', '{"version":1,"items":[]}')
    const Boom = () => {
      throw new Error('boom')
    }

    renderAt('/boom', withChild({ path: 'boom', Component: Boom }))

    expect(await h1('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Your cart is safe.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Go to Home' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
    expect(localStorage.length).toBe(1)
    expect(localStorage.getItem('ssc.cart.v1')).toBe('{"version":1,"items":[]}')
    await waitFor(() =>
      expect(document.title).toBe(
        'Something went wrong · Simple Shopping Cart',
      ),
    )
  })

  it('FR35: Reload reloads the page and Go to Home loads / (full page loads, not router navigation)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const reload = vi.fn()
    const assign = vi.fn()
    vi.stubGlobal('location', { ...window.location, reload, assign })
    const user = userEvent.setup()
    const Boom = () => {
      throw new Error('boom')
    }
    renderAt('/boom', withChild({ path: 'boom', Component: Boom }))
    await h1('Something went wrong')

    await user.click(screen.getByRole('button', { name: 'Reload' }))
    expect(reload).toHaveBeenCalledOnce()
    expect(assign).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Go to Home' }))
    expect(assign).toHaveBeenCalledWith('/')
    vi.unstubAllGlobals()
  })

  it('FR35: navigating into a crashing page moves focus to the error page h1', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const Boom = () => {
      throw new Error('boom')
    }
    const router = renderAt('/', withChild({ path: 'boom', Component: Boom }))
    await h1(HOME_H1)

    await act(() => router.navigate('/boom'))

    const heading = await h1('Something went wrong')
    await waitFor(() => expect(heading).toHaveFocus())
  })

  it('FR35: a page module that fails to load shows the global error page', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderAt(
      '/broken',
      withChild({
        path: 'broken',
        lazy: () => Promise.reject(new Error('Failed to fetch module')),
      }),
    )

    expect(await h1('Something went wrong')).toBeInTheDocument()
  })
})
