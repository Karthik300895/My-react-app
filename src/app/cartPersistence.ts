import { createListenerMiddleware } from '@reduxjs/toolkit'
import { saveCart } from '../features/cart'
import type { RootState } from './store'

// AD-4: writes only cart.items, and only after an action that changed them.
export const cartPersistenceMiddleware = createListenerMiddleware()

cartPersistenceMiddleware.startListening({
  predicate: (_action, current, previous) =>
    (current as RootState).cart.items !== (previous as RootState).cart.items,
  effect: (_action, api) => {
    saveCart((api.getState() as RootState).cart.items)
  },
})
