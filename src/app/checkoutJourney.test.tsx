import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CART_STORAGE_KEY } from '../features/cart'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { OrderConfirmationPage } from '../pages/OrderConfirmationPage'
import type { CartItem } from '../shared/model/cartItem'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { makeStore } from './store'

const item: CartItem = {
  productId: 1,
  title: 'Product 1',
  thumbnail: 'https://example.test/1.png',
  unitPriceCents: 1000,
  stock: 9,
  quantity: 2,
}

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`))

describe('UJ-3: checkout journey', () => {
  beforeEach(() => localStorage.clear())

  it('FR25–FR28: Cart → Review → Shipping (fixing an invalid postal code) → Summary → Confirm', async () => {
    const store = makeStore([item])
    const { router } = renderWithRouter(
      [
        { path: '/cart', Component: CartPage },
        { path: '/checkout', Component: CheckoutPage },
        { path: '/order-confirmation', Component: OrderConfirmationPage },
      ],
      '/checkout',
      store,
    )

    // Review, then Shipping.
    fireEvent.click(
      screen.getByRole('button', { name: 'Continue to shipping' }),
    )
    fireEvent.change(field('Full name'), { target: { value: 'Ada Lovelace' } })
    fireEvent.change(field('Email'), { target: { value: 'ada@example.com' } })
    fireEvent.change(field('Phone'), { target: { value: '+1 555 010 9999' } })
    fireEvent.change(field('Address line 1'), {
      target: { value: '10 Downing Street' },
    })
    fireEvent.change(field('City'), { target: { value: 'London' } })
    fireEvent.change(field('State or region'), {
      target: { value: 'Greater London' },
    })
    fireEvent.change(field('Country'), { target: { value: 'United Kingdom' } })

    // An invalid postal code is refused, and the Shopper is told how many fields to fix.
    fireEvent.change(field('Postal code'), { target: { value: 'SW1 !' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review order' }))
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Fix 1 field to continue.',
    )
    expect(store.getState().checkout.step).toBe('shipping')

    // Fixing it advances to Summary.
    fireEvent.change(field('Postal code'), { target: { value: 'SW1A2AA' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review order' }))
    await waitFor(() => expect(store.getState().checkout.step).toBe('summary'))
    expect(
      screen.getByRole('heading', { level: 2, name: 'Summary' }),
    ).toBeInTheDocument()

    // Confirm places exactly one Order and lands on the confirmation.
    fireEvent.click(screen.getByRole('button', { name: 'Confirm purchase' }))
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/order-confirmation'),
    )

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Order placed',
    })
    const main = heading.closest('main') ?? document.body
    const number = within(main).getByText(/^SSC-\d{8}-[A-Z0-9]{6}$/)
    expect(number).toBeInTheDocument()
    expect(
      within(main).getByText('Order Total').parentElement,
    ).toHaveTextContent('$20.00')

    expect(store.getState().cart.items).toEqual([])
    expect(
      JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '{}').items,
    ).toEqual([])
    expect(store.getState().checkout.issuedOrderNumbers).toHaveLength(1)
  })
})
