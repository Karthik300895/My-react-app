import { configureStore } from '@reduxjs/toolkit'
import { cartReducer, loadCart, type CartState } from '../features/cart'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { cartPersistenceMiddleware } from './cartPersistence'
import { noticeListenerMiddleware } from './noticeListener'

// AD-2: the only global state. Product API data stays in the TanStack Query cache.
// `items` preloads the Cart (FR20); tests build stores without it.
export function makeStore(items: CartState['items'] = []) {
  return configureStore({
    reducer: { cart: cartReducer, notices: noticesReducer },
    preloadedState: { cart: { items } },
    middleware: (getDefault) =>
      getDefault().prepend(
        noticeListenerMiddleware.middleware,
        cartPersistenceMiddleware.middleware,
      ),
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

// AD-4: the app's store starts from the stored Cart, after zod validation (FR20, FR22).
export const store = makeStore(loadCart())
