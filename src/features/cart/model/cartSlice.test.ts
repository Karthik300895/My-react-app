import { describe, expect, it } from 'vitest'
import { toCartItemSnapshot } from '../../../shared/model/cartItem'
import type { Product } from '../../../shared/model/product'
import {
  cartReducer,
  initialCartState,
  itemAdded,
  itemRemoved,
  quantityDecremented,
  quantityIncremented,
} from './cartSlice'

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Shirt',
  description: 'A shirt',
  priceCents: 2500,
  category: 'mens-shirts',
  rating: 4.5,
  stock: 3,
  thumbnail: 'https://example.test/shirt.png',
  ...overrides,
})

const add = (p: Product) => itemAdded(toCartItemSnapshot(p))

describe('cart slice', () => {
  it('FR10: a Product not yet in the Cart becomes a CartItem with quantity 1', () => {
    const state = cartReducer(initialCartState, add(product()))
    expect(state.items).toEqual([
      {
        productId: 1,
        quantity: 1,
        title: 'Shirt',
        thumbnail: 'https://example.test/shirt.png',
        unitPriceCents: 2500,
        stock: 3,
      },
    ])
  })

  it('FR10: adding a Product already in the Cart gains 1 Quantity, never a second line', () => {
    let state = cartReducer(initialCartState, add(product()))
    state = cartReducer(state, add(product()))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('NFR5: Quantity never rises above Stock', () => {
    let state = cartReducer(initialCartState, add(product({ stock: 2 })))
    state = cartReducer(state, add(product({ stock: 2 })))
    state = cartReducer(state, add(product({ stock: 2 })))
    expect(state.items[0].quantity).toBe(2)
  })

  it('FR10: an existing line takes the snapshot fields from the payload', () => {
    let state = cartReducer(initialCartState, add(product()))
    state = cartReducer(
      state,
      add(
        product({
          title: 'New title',
          priceCents: 999,
          stock: 10,
          thumbnail: 'https://example.test/new.png',
        }),
      ),
    )
    expect(state.items[0]).toMatchObject({
      title: 'New title',
      unitPriceCents: 999,
      stock: 10,
      thumbnail: 'https://example.test/new.png',
      quantity: 2,
    })
  })

  it('NFR5: a Product with no Stock is never added', () => {
    const state = cartReducer(initialCartState, add(product({ stock: 0 })))
    expect(state.items).toEqual([])
  })

  it('FR12: incrementing raises Quantity by 1, never above Stock', () => {
    let state = cartReducer(initialCartState, add(product({ stock: 2 })))
    state = cartReducer(state, quantityIncremented(1))
    expect(state.items[0].quantity).toBe(2)
    state = cartReducer(state, quantityIncremented(1))
    expect(state.items[0].quantity).toBe(2)
  })

  it('FR12: decrementing lowers Quantity by 1, never below 1', () => {
    let state = cartReducer(initialCartState, add(product({ stock: 5 })))
    state = cartReducer(state, add(product({ stock: 5 })))
    state = cartReducer(state, quantityDecremented(1))
    expect(state.items[0].quantity).toBe(1)
    state = cartReducer(state, quantityDecremented(1))
    expect(state.items[0].quantity).toBe(1)
  })

  it('FR14: removing a Product drops its line and leaves the others', () => {
    let state = cartReducer(initialCartState, add(product({ id: 1 })))
    state = cartReducer(state, add(product({ id: 2 })))
    state = cartReducer(state, itemRemoved(1))
    expect(state.items.map((item) => item.productId)).toEqual([2])
  })

  it('NFR5: a line whose Stock dropped below its Quantity clamps to the new Stock', () => {
    let state = cartReducer(initialCartState, add(product({ stock: 5 })))
    state = cartReducer(state, add(product({ stock: 5 })))
    state = cartReducer(state, add(product({ stock: 2 })))
    expect(state.items[0].quantity).toBe(2)
    expect(state.items[0].stock).toBe(2)
  })
})
