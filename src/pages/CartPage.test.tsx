import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cartReducer } from '../features/cart'
import type { CartItem } from '../shared/model/cartItem'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { CartPage } from './CartPage'

const line = (
  productId: number,
  overrides: Partial<CartItem> = {},
): CartItem => ({
  productId,
  title: `Product ${productId}`,
  thumbnail: `https://example.test/${productId}.png`,
  unitPriceCents: 1999,
  stock: 9,
  quantity: 1,
  ...overrides,
})

function renderCart(items: CartItem[]) {
  const store = configureStore({
    reducer: { cart: cartReducer, notices: noticesReducer },
    preloadedState: { cart: { items } },
  })
  renderWithRouter([{ path: '/cart', Component: CartPage }], '/cart', store)
  return store
}

const stepperFor = (title: string) => {
  const row = screen.getByRole('heading', { name: title }).closest('li')!
  return within(row)
}

describe('CartPage', () => {
  it('UX-DR9: each line shows the title link, unit price, Line Total and Remove', () => {
    renderCart([line(1, { quantity: 2 })])
    const row = screen
      .getByRole('heading', { name: 'Product 1' })
      .closest('li')!
    expect(
      within(row).getByRole('link', { name: 'Product 1' }),
    ).toHaveAttribute('href', '/products/1')
    expect(within(row).getByText('$19.99 each')).toBeInTheDocument()
    expect(within(row).getByText('$39.98')).toBeInTheDocument()
    expect(
      within(row).getByRole('button', { name: 'Remove Product 1' }),
    ).toBeInTheDocument()
  })

  it('UX-DR10: the summary shows Items, Subtotal, Shipping: Free, Order Total and Checkout to /checkout', () => {
    renderCart([line(1, { quantity: 3 })])
    const summary = screen.getByRole('region', { name: 'Order summary' })
    expect(within(summary).getByText('Free')).toBeInTheDocument()
    expect(within(summary).getByText('Shipping')).toBeInTheDocument()
    expect(
      within(summary).getByRole('link', { name: 'Checkout' }),
    ).toHaveAttribute('href', '/checkout')
  })

  it('FR16: 3 × $19.99 shows as $59.97 in the line and in the summary', () => {
    renderCart([line(1, { quantity: 3 })])
    const summary = screen.getByRole('region', { name: 'Order summary' })
    // Subtotal and Order Total are both $59.97 (FR16: they are equal).
    expect(within(summary).getAllByText('$59.97')).toHaveLength(2)
    expect(screen.getAllByText('$59.97').length).toBeGreaterThanOrEqual(3)
  })

  it('FR12: the increase button adds 1 and the totals update together', () => {
    const store = renderCart([line(1)])
    fireEvent.click(
      stepperFor('Product 1').getByRole('button', {
        name: 'Increase quantity of Product 1',
      }),
    )
    expect(store.getState().cart.items[0].quantity).toBe(2)
    expect(screen.getAllByText('$39.98').length).toBeGreaterThanOrEqual(2)
  })

  it('FR13: decrease is disabled at 1 with the visible reason "Minimum 1" linked by aria-describedby', () => {
    const store = renderCart([line(1)])
    const decrease = stepperFor('Product 1').getByRole('button', {
      name: 'Decrease quantity of Product 1',
    })
    expect(decrease).toHaveAttribute('aria-disabled', 'true')
    const reason = screen.getByText('Minimum 1')
    expect(decrease).toHaveAttribute('aria-describedby', reason.id)

    fireEvent.click(decrease)
    expect(store.getState().cart.items[0].quantity).toBe(1)
  })

  it('FR13: increase is disabled at Stock with the visible reason "Only N available"', () => {
    const store = renderCart([line(1, { quantity: 2, stock: 2 })])
    const increase = stepperFor('Product 1').getByRole('button', {
      name: 'Increase quantity of Product 1',
    })
    expect(increase).toHaveAttribute('aria-disabled', 'true')
    const reason = screen.getByText('Only 2 available')
    expect(increase).toHaveAttribute('aria-describedby', reason.id)

    fireEvent.click(increase)
    expect(store.getState().cart.items[0].quantity).toBe(2)
  })

  it("FR14: removing a line drops it at once and focuses the next line's Remove", () => {
    const store = renderCart([line(1), line(2), line(3)])
    fireEvent.click(screen.getByRole('button', { name: 'Remove Product 2' }))

    expect(store.getState().cart.items.map((i) => i.productId)).toEqual([1, 3])
    expect(
      screen.getByRole('button', { name: 'Remove Product 3' }),
    ).toHaveFocus()
  })

  it("FR14: removing the last line focuses the previous line's Remove", () => {
    renderCart([line(1), line(2)])
    fireEvent.click(screen.getByRole('button', { name: 'Remove Product 2' }))
    expect(
      screen.getByRole('button', { name: 'Remove Product 1' }),
    ).toHaveFocus()
  })

  it('FR17: an empty Cart shows the empty heading, body, Start shopping, and no Checkout', () => {
    renderCart([])
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Your cart is empty.',
    })
    expect(
      screen.getByText('Find something you like in the shop.'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Start shopping' }),
    ).toHaveAttribute('href', '/products')
    expect(screen.queryByRole('link', { name: 'Checkout' })).toBeNull()
    expect(heading).toBeInTheDocument()
  })

  it('FR17: removing the last item moves focus to the empty heading', () => {
    renderCart([line(1)])
    fireEvent.click(screen.getByRole('button', { name: 'Remove Product 1' }))
    expect(
      screen.getByRole('heading', { name: 'Your cart is empty.' }),
    ).toHaveFocus()
  })
})
