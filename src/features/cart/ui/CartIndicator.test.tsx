import { act, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import { toCartItemSnapshot } from '../../../shared/model/cartItem'
import type { Product } from '../../../shared/model/product'
import { cartReducer, itemAdded } from '../model/cartSlice'
import { CartIndicator } from './CartIndicator'

const makeStore = () => configureStore({ reducer: { cart: cartReducer } })

const product: Product = {
  id: 9,
  title: 'Chair',
  description: 'A chair',
  priceCents: 8000,
  category: 'home',
  rating: 4,
  stock: 9,
  thumbnail: 'https://example.test/chair.png',
}

describe('CartIndicator', () => {
  it('FR18: at 0 the pill reads "0" and the link is named "Cart, 0 items" and goes to /cart', () => {
    render(
      <Provider store={makeStore()}>
        <MemoryRouter>
          <CartIndicator />
        </MemoryRouter>
      </Provider>,
    )
    const link = screen.getByRole('link', { name: 'Cart, 0 items' })
    expect(link).toHaveAttribute('href', '/cart')
    expect(link).toHaveTextContent('0')
  })

  it('FR18: the count updates in the same interaction as the add', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CartIndicator />
        </MemoryRouter>
      </Provider>,
    )
    act(() => {
      store.dispatch(itemAdded(toCartItemSnapshot(product)))
      store.dispatch(itemAdded(toCartItemSnapshot(product)))
    })
    expect(
      screen.getByRole('link', { name: 'Cart, 2 items' }),
    ).toBeInTheDocument()
  })
})
