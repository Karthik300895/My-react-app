import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cartReducer } from '../features/cart'
import { checkoutReducer, type CheckoutState } from '../features/checkout'
import type { CartItem } from '../shared/model/cartItem'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { CartPage } from './CartPage'
import { CheckoutPage } from './CheckoutPage'

const line = (
  productId: number,
  quantity: number,
  unitPriceCents: number,
): CartItem => ({
  productId,
  title: `Product ${productId}`,
  thumbnail: `https://example.test/${productId}.png`,
  unitPriceCents,
  stock: 9,
  quantity,
})

function renderCheckout(
  items: CartItem[],
  checkout: Partial<CheckoutState> = {},
) {
  const checkoutState: CheckoutState = {
    step: 'review',
    shippingDraft: null,
    lastOrder: null,
    issuedOrderNumbers: [],
    placing: false,
    ...checkout,
  }
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      notices: noticesReducer,
      checkout: checkoutReducer,
    },
    preloadedState: { cart: { items }, checkout: checkoutState },
  })
  const { router } = renderWithRouter(
    [
      { path: '/cart', Component: CartPage },
      { path: '/checkout', Component: CheckoutPage },
    ],
    '/checkout',
    store,
  )
  return { store, router }
}

describe('CheckoutPage', () => {
  it('FR23: an empty Cart redirects to /cart and raises the empty-cart Notice', async () => {
    const { store, router } = renderCheckout([])

    await waitFor(() => expect(router.state.location.pathname).toBe('/cart'))
    await waitFor(() =>
      expect(store.getState().notices.items.map((n) => n.message)).toEqual([
        "Your cart is empty, so there's nothing to check out yet.",
      ]),
    )
  })

  it('UX-DR27: with items, Checkout opens at Review even after an earlier step', () => {
    renderCheckout([line(1, 1, 1000)], { step: 'shipping' })
    expect(
      screen.getByRole('heading', { level: 2, name: 'Review your order' }),
    ).toBeInTheDocument()
  })

  it('UX-DR16: the progress lists Review, Shipping and Summary, with aria-current on Review', () => {
    renderCheckout([line(1, 1, 1000)])
    const progress = screen.getByRole('navigation', {
      name: 'Checkout progress',
    })
    expect(within(progress).getAllByRole('listitem')).toHaveLength(3)
    expect(within(progress).getByText('Review')).toHaveAttribute(
      'aria-current',
      'step',
    )
    expect(within(progress).getByText('Shipping')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('FR24: Review lists each item with Quantity, its Line Total, and the Order Total', () => {
    renderCheckout([line(1, 2, 1999), line(2, 1, 500)])
    const review = screen
      .getByRole('heading', { name: 'Review your order' })
      .closest('section')!
    expect(within(review).getByText('Quantity 2')).toBeInTheDocument()
    expect(within(review).getByText('$39.98')).toBeInTheDocument()
    expect(within(review).getByText('$44.98')).toBeInTheDocument()
  })

  it('FR24: "Edit cart" links to /cart', () => {
    renderCheckout([line(1, 1, 1000)])
    expect(screen.getByRole('link', { name: 'Edit cart' })).toHaveAttribute(
      'href',
      '/cart',
    )
  })

  it('FR24: "Continue to shipping" moves to step 2 and focuses its heading', () => {
    const { store } = renderCheckout([line(1, 1, 1000)])
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to shipping' }),
    )

    expect(store.getState().checkout.step).toBe('shipping')
    expect(
      screen.getByRole('heading', { level: 2, name: 'Shipping' }),
    ).toHaveFocus()
  })

  it('UX-DR10: from lg, a sticky panel shows the items and the Order Total, with no Checkout button', () => {
    renderCheckout([line(1, 1, 1000)])
    const panel = screen.getByRole('complementary', { name: 'Order total' })
    expect(within(panel).getByText('Order total $10.00')).toBeInTheDocument()
    expect(within(panel).getByText('Product 1 × 1')).toBeInTheDocument()
    expect(
      within(panel).queryByRole('button', { name: /checkout/i }),
    ).toBeNull()
  })

  it('UX-DR10: below lg, a "Show items" disclosure reveals the item rows', () => {
    renderCheckout([line(1, 1, 1000)])
    const disclosure = screen.getByRole('button', { name: 'Show items' })
    expect(disclosure).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(disclosure)

    expect(disclosure).toHaveAttribute('aria-expanded', 'true')
  })

  it('UX-DR27: with the catalog unavailable, Checkout still uses the Cart snapshot prices', () => {
    renderCheckout([line(1, 2, 1250)])
    expect(
      screen.getByRole('heading', { name: 'Review your order' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('$25.00').length).toBeGreaterThan(0)
  })
})
