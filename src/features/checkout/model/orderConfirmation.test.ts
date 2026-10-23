import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import { cartReducer, itemAdded } from '../../cart'
import { orderPlaced } from '../../../shared/model/events'
import type { Order } from '../../../shared/model/order'
import { checkoutReducer } from './checkoutSlice'

const order: Order = {
  number: 'SSC-20261022-AB12CD',
  createdAt: '2026-10-22T09:30:00.000Z',
  items: [],
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

const product = {
  productId: 2,
  title: 'Product 2',
  thumbnail: 'https://example.test/2.png',
  unitPriceCents: 500,
  stock: 3,
}

function makeCheckoutStore() {
  return configureStore({
    reducer: { cart: cartReducer, checkout: checkoutReducer },
  })
}

describe('order confirmation state', () => {
  it('FR28: lastOrder keeps the whole placed Order, not only its number', () => {
    const store = makeCheckoutStore()
    store.dispatch(orderPlaced(order))
    expect(store.getState().checkout.lastOrder).toEqual(order)
  })

  it('AD-15: adding any Product clears lastOrder so Checkout works for the new Cart', () => {
    const store = makeCheckoutStore()
    store.dispatch(orderPlaced(order))
    store.dispatch(itemAdded(product))
    expect(store.getState().checkout.lastOrder).toBeNull()
  })

  it('AD-15: a placement records the number without clearing the order it just made', () => {
    const store = makeCheckoutStore()
    store.dispatch(orderPlaced(order))
    expect(store.getState().checkout.issuedOrderNumbers).toEqual([order.number])
    expect(store.getState().checkout.placing).toBe(false)
  })
})
