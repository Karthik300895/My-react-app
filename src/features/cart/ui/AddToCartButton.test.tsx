import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../../../shared/model/product'
import { cartReducer } from '../model/cartSlice'
import { AddToCartButton, ADDED_FEEDBACK_MS } from './AddToCartButton'
import { InCartLine } from './InCartLine'

const makeStore = () => configureStore({ reducer: { cart: cartReducer } })

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 3,
  title: 'Lamp',
  description: 'A lamp',
  priceCents: 4000,
  category: 'home',
  rating: 4.2,
  stock: 2,
  thumbnail: 'https://example.test/lamp.png',
  ...overrides,
})

function renderButton(p: Product, store = makeStore()) {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <AddToCartButton product={p} />
        <InCartLine productId={p.id} />
      </MemoryRouter>
    </Provider>,
  )
  return store
}

describe('AddToCartButton', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('FR10: activating an Available Product adds 1 and shows "Added ✓" for 1.5 s', () => {
    const store = renderButton(product())
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    expect(store.getState().cart.items[0].quantity).toBe(1)
    expect(screen.getByRole('button', { name: 'Added ✓' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(ADDED_FEEDBACK_MS)
    })
    expect(
      screen.getByRole('button', { name: 'Add to Cart' }),
    ).toBeInTheDocument()
  })

  it('FR10: once in the Cart, Product Details says "In your cart: N" with a View cart link', () => {
    renderButton(product())
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))
    expect(screen.getByText(/In your cart: 1/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View cart' })).toHaveAttribute(
      'href',
      '/cart',
    )
  })

  it('FR11: an Out-of-stock Product shows the reason as its label, is aria-disabled, and adds nothing', () => {
    const store = renderButton(product({ stock: 0 }))
    const button = screen.getByRole('button', { name: 'Out of stock' })

    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toBeDisabled()
    fireEvent.click(button)
    expect(store.getState().cart.items).toEqual([])
  })

  it('FR11: a Cart Quantity at Stock shows the max reason and changes nothing on click', () => {
    const store = renderButton(product({ stock: 1 }))
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))
    act(() => {
      vi.advanceTimersByTime(ADDED_FEEDBACK_MS)
    })
    const button = screen.getByRole('button', {
      name: 'Maximum available quantity in cart',
    })

    expect(button).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(button)
    expect(store.getState().cart.items[0].quantity).toBe(1)
  })
})
