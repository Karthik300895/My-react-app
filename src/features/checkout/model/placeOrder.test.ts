import { configureStore, type Middleware } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import { cartReducer } from '../../cart'
import type { CartItem } from '../../../shared/model/cartItem'
import { orderPlaced } from '../../../shared/model/events'
import { checkoutReducer, shippingDraftSaved } from '../index'
import { placeOrder } from './placeOrder'
import type { ShippingValues } from './shippingSchema'

const item: CartItem = {
  productId: 1,
  title: 'Product 1',
  thumbnail: 'https://example.test/1.png',
  unitPriceCents: 1000,
  stock: 9,
  quantity: 2,
}

const shipping: ShippingValues = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 010 9999',
  addressLine1: '10 Downing Street',
  addressLine2: '',
  city: 'London',
  state: 'Greater London',
  postalCode: 'SW1A2AA',
  country: 'United Kingdom',
}

// A reducer stands in for the real one only where needed; the recorder logs every action type.
function makeTestStore() {
  const events: string[] = []
  const recorder: Middleware = () => (next) => (action) => {
    if (typeof action === 'object' && action && 'type' in action) {
      events.push(String(action.type))
    }
    return next(action)
  }
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      checkout: checkoutReducer,
    },
    preloadedState: { cart: { items: [item] } },
    middleware: (getDefault) => getDefault().concat(recorder),
  })
  store.dispatch(shippingDraftSaved(shipping))
  events.length = 0
  return { store, events }
}

describe('placeOrder', () => {
  it('FR27: builds an Order from the Cart snapshot and dispatches orderPlaced once', async () => {
    const { store, events } = makeTestStore()
    await store.dispatch(placeOrder())

    expect(events.filter((type) => type === orderPlaced.type)).toHaveLength(1)
    expect(store.getState().cart.items).toEqual([])
    expect(store.getState().checkout.lastOrder?.number).toMatch(
      /^SSC-\d{8}-[A-Z0-9]{6}$/,
    )
  })

  it('FR27: a second placement while one is running creates no second Order', async () => {
    const { store, events } = makeTestStore()
    const first = store.dispatch(placeOrder())
    const second = store.dispatch(placeOrder())
    await Promise.all([first, second])

    expect(events.filter((type) => type === orderPlaced.type)).toHaveLength(1)
    expect(store.getState().checkout.issuedOrderNumbers).toHaveLength(1)
  })

  it('FR27: placing with an empty Cart does nothing', async () => {
    const { store, events } = makeTestStore()
    await store.dispatch(placeOrder())
    await store.dispatch(placeOrder())

    expect(events.filter((type) => type === orderPlaced.type)).toHaveLength(1)
  })

  it('FR27: "placing" is true while the Order is being placed', async () => {
    const { store } = makeTestStore()
    const pending = store.dispatch(placeOrder())
    expect(store.getState().checkout.placing).toBe(true)
    await pending
    expect(store.getState().checkout.placing).toBe(false)
  })

  it('AD-15: placing never dispatches cartCleared', async () => {
    const { store, events } = makeTestStore()
    await store.dispatch(placeOrder())
    expect(events).not.toContain('cart/cartCleared')
  })
})
