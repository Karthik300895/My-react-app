import type { CartItem } from './cartItem'

/** FR26: the Shipping Information as the Order records it. Matches the checkout form's values. */
export type OrderShipping = {
  fullName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
}

/** FR27: the Order created by placing the Cart. Its items are copies, not live Cart state. */
export type Order = {
  number: string
  createdAt: string
  items: CartItem[]
  shipping: OrderShipping
}
