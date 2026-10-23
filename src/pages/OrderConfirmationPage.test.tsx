import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cartReducer } from '../features/cart'
import { checkoutReducer, type CheckoutState } from '../features/checkout'
import type { Order } from '../shared/model/order'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { OrderConfirmationPage } from './OrderConfirmationPage'

const order: Order = {
  number: 'SSC-20261022-AB12CD',
  createdAt: '2026-10-22T09:30:00.000Z',
  items: [
    {
      productId: 1,
      title: 'Product 1',
      thumbnail: 'https://example.test/1.png',
      unitPriceCents: 1000,
      stock: 9,
      quantity: 2,
    },
  ],
  shipping: {
    fullName: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '+1 555 010 9999',
    addressLine1: '10 Downing Street',
    addressLine2: '',
    city: 'London',
    state: 'Greater London',
    postalCode: 'SW1A2AA',
    country: 'United Kingdom',
  },
}

function renderConfirmation(lastOrder: Order | null) {
  const checkout: CheckoutState = {
    step: 'review',
    shippingDraft: null,
    lastOrder,
    issuedOrderNumbers: lastOrder ? [lastOrder.number] : [],
    placing: false,
  }
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      notices: noticesReducer,
      checkout: checkoutReducer,
    },
    preloadedState: { cart: { items: [] }, checkout },
  })
  return renderWithRouter(
    [
      { path: '/', element: <h1>Home page</h1> },
      { path: '/order-confirmation', Component: OrderConfirmationPage },
      { path: '/products', element: <h1>Products page</h1> },
    ],
    '/order-confirmation',
    store,
  )
}

describe('OrderConfirmationPage', () => {
  it('FR28: shows "Order placed", the Order Number, and the Order Total', () => {
    renderConfirmation(order)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Order placed' }),
    ).toBeInTheDocument()
    expect(screen.getByText('SSC-20261022-AB12CD')).toHaveClass('font-mono')
    expect(screen.getByText('Order Total').parentElement).toHaveTextContent(
      '$20.00',
    )
  })

  it('FR28: "Continue shopping" goes to the product listing', async () => {
    const { router } = renderConfirmation(order)
    fireEvent.click(screen.getByRole('link', { name: 'Continue shopping' }))
    expect(router.state.location.pathname).toBe('/products')
  })

  it('FR29: with no placed Order, the Shopper is sent Home silently', async () => {
    const { router } = renderConfirmation(null)
    expect(
      await screen.findByRole('heading', { name: 'Home page' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })
})
