import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CartItem, CartItemSnapshot } from '../../../shared/model/cartItem'

export type CartState = {
  items: CartItem[]
}

export const initialCartState: CartState = { items: [] }

// AD-3: the Cart changes only through these actions. Reducers stay pure and clamp silently.
export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    /** FR10: adds 1 Quantity; a Product never appears twice and never exceeds Stock (NFR5). */
    itemAdded(state, action: PayloadAction<CartItemSnapshot>) {
      const { productId, title, thumbnail, unitPriceCents, stock } =
        action.payload
      // A Product with no Stock cannot be added (FR11).
      if (stock <= 0) return

      const existing = state.items.find((item) => item.productId === productId)
      if (existing) {
        // AD-13: overwrite the snapshot from the payload, then clamp the Quantity.
        Object.assign(existing, { title, thumbnail, unitPriceCents, stock })
        existing.quantity = Math.min(existing.quantity + 1, stock)
        return
      }
      state.items.push({
        productId,
        title,
        thumbnail,
        unitPriceCents,
        stock,
        quantity: 1,
      })
    },
    /** FR12: +1 Quantity, never above Stock (NFR5). */
    quantityIncremented(state, action: PayloadAction<number>) {
      const item = state.items.find((i) => i.productId === action.payload)
      if (item) item.quantity = Math.min(item.quantity + 1, item.stock)
    },
    /** FR12: -1 Quantity, never below 1. */
    quantityDecremented(state, action: PayloadAction<number>) {
      const item = state.items.find((i) => i.productId === action.payload)
      if (item) item.quantity = Math.max(item.quantity - 1, 1)
    },
    /** FR14: removes the line immediately. */
    itemRemoved(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.productId !== action.payload)
    },
    /** FR15: the Shopper's own Clear cart. Reserved for that action (AD-15). */
    cartCleared(state) {
      state.items = []
    },
  },
})

export const {
  itemAdded,
  quantityIncremented,
  quantityDecremented,
  itemRemoved,
  cartCleared,
} = cartSlice.actions
export const cartReducer = cartSlice.reducer
