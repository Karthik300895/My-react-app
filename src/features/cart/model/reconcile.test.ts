import { describe, expect, it } from 'vitest'
import {
  toCartItemSnapshot,
  type CartItem,
} from '../../../shared/model/cartItem'
import type { Product } from '../../../shared/model/product'
import { cartReducer, cartReconciled } from './cartSlice'
import { reconcile } from './reconcile'

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: 'Mug',
  description: 'A mug',
  priceCents: 1200,
  category: 'kitchen',
  rating: 4,
  stock: 5,
  thumbnail: 'https://example.test/mug.png',
  ...overrides,
})

// A cart line exactly as the Shopper saw it when they added it.
const lineFrom = (p: Product, quantity: number): CartItem => ({
  ...toCartItemSnapshot(p),
  quantity,
})

describe('reconcile', () => {
  it('FR21: a Product absent from the complete catalog is removed as not-found', () => {
    const cart = [lineFrom(product({ id: 9, title: 'Gone' }), 1)]
    const result = reconcile(cart, [product({ id: 1 })])
    expect(result.items).toEqual([])
    expect(result.changes).toEqual([
      { kind: 'not-found', productId: 9, title: 'Gone' },
    ])
  })

  it('FR21: a Product that now has no Stock is removed as out-of-stock', () => {
    const p = product()
    const result = reconcile([lineFrom(p, 2)], [product({ stock: 0 })])
    expect(result.items).toEqual([])
    expect(result.changes).toEqual([
      { kind: 'out-of-stock', productId: 1, title: 'Mug' },
    ])
  })

  it('FR21: a Quantity above the new Stock is capped at it', () => {
    const p = product({ stock: 5 })
    const result = reconcile([lineFrom(p, 4)], [product({ stock: 2 })])
    expect(result.items[0]).toMatchObject({ quantity: 2, stock: 2 })
    expect(result.changes).toEqual([
      { kind: 'capped', productId: 1, title: 'Mug', stock: 2 },
    ])
  })

  it('FR21: a changed price updates the snapshot and is reported with both prices', () => {
    const result = reconcile(
      [lineFrom(product(), 1)],
      [product({ priceCents: 1500 })],
    )
    expect(result.items[0]).toMatchObject({ unitPriceCents: 1500, quantity: 1 })
    expect(result.changes).toEqual([
      {
        kind: 'price',
        productId: 1,
        title: 'Mug',
        oldCents: 1200,
        newCents: 1500,
      },
    ])
  })

  it('FR21: a kept line takes the fresh title, thumbnail and stock from the catalog (AD-13)', () => {
    const result = reconcile(
      [lineFrom(product({ title: 'Old' }), 1)],
      [
        product({
          title: 'New',
          thumbnail: 'https://example.test/new.png',
          stock: 9,
        }),
      ],
    )
    expect(result.items[0]).toMatchObject({
      title: 'New',
      thumbnail: 'https://example.test/new.png',
      stock: 9,
      quantity: 1,
    })
    expect(result.changes).toEqual([])
  })

  it('FR21: a Stock fall that still covers the Quantity is updated without a change', () => {
    const result = reconcile(
      [lineFrom(product({ stock: 5 }), 2)],
      [product({ stock: 4 })],
    )
    expect(result.items[0]).toMatchObject({ quantity: 2, stock: 4 })
    expect(result.changes).toEqual([])
  })

  it('FR21: an unchanged catalog reports no changes and keeps every line', () => {
    const cart = [
      lineFrom(product({ id: 1 }), 1),
      lineFrom(product({ id: 2 }), 3),
    ]
    const catalog = [product({ id: 1 }), product({ id: 2 })]
    const result = reconcile(cart, catalog)
    expect(result.items).toEqual(cart)
    expect(result.changes).toEqual([])
  })

  it('FR21: cartReconciled replaces the items and leaves the changes out of the state', () => {
    const cart = [lineFrom(product(), 1)]
    const { items, changes } = reconcile(cart, [product({ priceCents: 1500 })])
    const state = cartReducer(
      { items: cart },
      cartReconciled({ items, changes }),
    )
    expect(state.items).toEqual(items)
    expect(state).not.toHaveProperty('changes')
  })
})
