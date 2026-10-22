import { beforeEach, describe, expect, it } from 'vitest'
import type { CartItem } from '../../../shared/model/cartItem'
import {
  CART_STORAGE_KEY,
  loadCart,
  parseStoredCart,
  saveCart,
  serializeCart,
} from './persistence'

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  title: 'Shirt',
  thumbnail: 'https://example.test/shirt.png',
  unitPriceCents: 1999,
  stock: 5,
  quantity: 2,
  ...overrides,
})

describe('cart persistence envelope', () => {
  beforeEach(() => localStorage.clear())

  it('FR19: the key is ssc.cart.v1 and the envelope is { version: 1, items }', () => {
    saveCart([item()])
    expect(CART_STORAGE_KEY).toBe('ssc.cart.v1')
    const stored = JSON.parse(localStorage.getItem('ssc.cart.v1')!)
    expect(stored).toEqual({ version: 1, items: [item()] })
  })

  it('NFR6: only the envelope keys and CartItem fields are written, with no Shipping Information', () => {
    saveCart([item()])
    const stored = JSON.parse(localStorage.getItem('ssc.cart.v1')!)
    expect(Object.keys(stored).sort()).toEqual(['items', 'version'])
    expect(Object.keys(stored.items[0]).sort()).toEqual([
      'productId',
      'quantity',
      'stock',
      'thumbnail',
      'title',
      'unitPriceCents',
    ])
    expect(localStorage.getItem('ssc.cart.v1')).not.toMatch(
      /shipping|address|notice|checkout/i,
    )
  })

  it('FR20: a valid stored Cart loads with the same items and Quantities', () => {
    saveCart([
      item({ productId: 1, quantity: 2 }),
      item({ productId: 2, quantity: 1 }),
    ])
    expect(loadCart().map((i) => [i.productId, i.quantity])).toEqual([
      [1, 2],
      [2, 1],
    ])
  })

  it('FR22: a missing key loads an empty Cart', () => {
    expect(loadCart()).toEqual([])
  })

  it('FR22: malformed JSON loads an empty Cart without throwing', () => {
    localStorage.setItem('ssc.cart.v1', '{not json')
    expect(loadCart()).toEqual([])
  })

  it('FR22: an unknown version loads an empty Cart', () => {
    localStorage.setItem(
      'ssc.cart.v1',
      JSON.stringify({ version: 2, items: [item()] }),
    )
    expect(loadCart()).toEqual([])
  })

  it('FR22: a quantity above stock fails validation and loads an empty Cart', () => {
    expect(
      parseStoredCart(serializeCart([item({ quantity: 9, stock: 5 })])),
    ).toEqual([])
  })

  it('FR22: a duplicate productId fails validation and loads an empty Cart', () => {
    expect(
      parseStoredCart(
        serializeCart([item({ productId: 1 }), item({ productId: 1 })]),
      ),
    ).toEqual([])
  })

  it('FR22: a non-integer price fails validation and loads an empty Cart', () => {
    const bad = { version: 1, items: [{ ...item(), unitPriceCents: 19.99 }] }
    expect(parseStoredCart(JSON.stringify(bad))).toEqual([])
  })
})
