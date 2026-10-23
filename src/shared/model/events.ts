import { createAction } from '@reduxjs/toolkit'
import type { Order } from './order'

/**
 * AD-15: the shared event for a placed Order. The Cart empties and the checkout records the
 * Order from this one action. `cartCleared` is never used for placement.
 */
export const orderPlaced = createAction<Order>('orderPlaced')
