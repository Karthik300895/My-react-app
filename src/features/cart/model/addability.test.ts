import { describe, expect, it } from 'vitest'
import type { CartItem } from '../../../shared/model/cartItem'
import {
  addability,
  MAX_IN_CART_REASON,
  OUT_OF_STOCK_REASON,
} from './addability'

const item = (quantity: number, productId = 1): CartItem => ({
  productId,
  quantity,
  title: 'Shirt',
  thumbnail: '',
  unitPriceCents: 100,
  stock: 5,
})

describe('addability', () => {
  it('FR11: an Available Product not in the Cart can be added', () => {
    expect(addability([], 1, 3)).toEqual({ canAdd: true, reason: null })
  })

  it('FR11: an Out-of-stock Product cannot be added, with the reason as the label', () => {
    expect(addability([], 1, 0)).toEqual({
      canAdd: false,
      reason: OUT_OF_STOCK_REASON,
    })
  })

  it('FR11: a Cart Quantity equal to Stock cannot be added, with the max reason', () => {
    expect(addability([item(3)], 1, 3)).toEqual({
      canAdd: false,
      reason: MAX_IN_CART_REASON,
    })
  })

  it('FR11: a Cart Quantity below Stock can still be added', () => {
    expect(addability([item(2)], 1, 3)).toEqual({ canAdd: true, reason: null })
  })

  it('FR11: another Product in the Cart does not block this one', () => {
    expect(addability([item(3, 2)], 1, 3)).toEqual({
      canAdd: true,
      reason: null,
    })
  })
})
