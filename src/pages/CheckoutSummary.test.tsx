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

const item: CartItem = {
  productId: 1,
  title: 'Product 1',
  thumbnail: 'https://example.test/1.png',
  unitPriceCents: 1000,
  stock: 9,
  quantity: 2,
}

const VALID: Record<string, string> = {
  'Full name': 'Ada Lovelace',
  Email: 'ada@example.com',
  Phone: '+1 555 010 9999',
  'Address line 1': '10 Downing Street',
  City: 'London',
  'State or region': 'Greater London',
  'Postal code': 'SW1A2AA',
  Country: 'United Kingdom',
}

function Stub({ name }: { name: string }) {
  return <h1>{name}</h1>
}

// Renders the real checkout, then gets to Summary through Review and Shipping.
function renderSummary(initial: Partial<CheckoutState> = {}) {
  const checkout: CheckoutState = {
    step: 'review',
    shippingDraft: null,
    lastOrder: null,
    issuedOrderNumbers: [],
    placing: false,
    ...initial,
  }
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      notices: noticesReducer,
      checkout: checkoutReducer,
    },
    preloadedState: {
      cart: { items: [item] },
      checkout: checkout,
    },
  })
  const { router } = renderWithRouter(
    [
      { path: '/cart', Component: CartPage },
      { path: '/checkout', Component: CheckoutPage },
      {
        path: '/order-confirmation',
        element: <Stub name="Order confirmation" />,
      },
    ],
    '/checkout',
    store,
  )
  const visited: string[] = []
  router.subscribe((state) => visited.push(state.location.pathname))
  fireEvent.click(screen.getByRole('button', { name: 'Continue to shipping' }))
  for (const [label, value] of Object.entries(VALID)) {
    fireEvent.change(screenField(label), { target: { value } })
  }
  fireEvent.click(screen.getByRole('button', { name: 'Review order' }))
  return { store, router, visited }
}

function screenField(label: string) {
  return screen.getByLabelText(new RegExp(`^${label}`))
}

describe('CheckoutPage summary step', () => {
  it('FR26: shows the items with quantities and line totals, the Order Total, and the Shipping Information', async () => {
    renderSummary()
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 2, name: 'Summary' }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByText('Quantity 2')).toBeInTheDocument()
    // The Order Total row sits beside the total label; the side panel repeats the same figure.
    const totalRow = screen.getAllByText('Order Total')[0].parentElement
    expect(totalRow).toHaveTextContent('$20.00')
    expect(screen.getByText('10 Downing Street')).toBeInTheDocument()
    expect(
      screen.getByText('London, Greater London SW1A2AA'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('ada@example.com · +1 555 010 9999'),
    ).toBeInTheDocument()
  })

  it('FR26: shows the demo note and no payment fields', async () => {
    renderSummary()
    expect(
      await screen.findByText('This is a demo store. No payment is taken.'),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/card/i)).not.toBeInTheDocument()
  })

  it('FR26: "Back" returns the Shopper to Shipping with values kept', async () => {
    const { store } = renderSummary()
    fireEvent.click(await screen.findByRole('button', { name: 'Back' }))
    expect(store.getState().checkout.step).toBe('shipping')
    expect(screenField('Full name')).toHaveValue('Ada Lovelace')
  })

  it('FR26: "Edit cart" links to the Cart', async () => {
    renderSummary()
    const link = await screen.findByRole('link', { name: 'Edit cart' })
    expect(link).toHaveAttribute('href', '/cart')
  })

  it('FR27: "Confirm purchase" shows "Placing order…" at once and keeps the button disabled while placing', async () => {
    renderSummary()
    const confirm = await screen.findByRole('button', {
      name: 'Confirm purchase',
    })
    fireEvent.click(confirm)
    expect(
      screen.getByRole('button', { name: 'Placing order…' }),
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('FR27: repeated clicks on "Confirm purchase" create exactly one Order', async () => {
    const { store } = renderSummary()
    const confirm = await screen.findByRole('button', {
      name: 'Confirm purchase',
    })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    fireEvent.click(confirm)

    await waitFor(() =>
      expect(store.getState().checkout.lastOrder).not.toBeNull(),
    )
    expect(store.getState().checkout.issuedOrderNumbers).toHaveLength(1)
  })

  it('FR27: placing sends the Shopper to /order-confirmation with replace, never via /cart', async () => {
    const { store, router, visited } = renderSummary()
    fireEvent.click(
      await screen.findByRole('button', { name: 'Confirm purchase' }),
    )

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/order-confirmation'),
    )
    expect(
      within(document.body).getByRole('heading', {
        name: 'Order confirmation',
      }),
    ).toBeInTheDocument()
    expect(visited).not.toContain('/cart')
    expect(store.getState().cart.items).toEqual([])
    expect(store.getState().checkout.lastOrder?.number).toMatch(
      /^SSC-\d{8}-[A-Z0-9]{6}$/,
    )
  })
})
