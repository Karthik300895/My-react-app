import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useDispatch, useStore } from 'react-redux'
import { catalogQueryOptions } from '../../../shared/api/queries'
import { cartReconciled, type CartState } from './cartSlice'
import { reconcile } from './reconcile'

/**
 * AD-14: reconciles the Cart with the catalog. Mounted once, in RootLayout.
 * Runs once per successful catalog `dataUpdatedAt`, and only while the Cart has items.
 * A failed or incomplete catalog has no data, so the Cart is left as it is (FR21).
 */
export function useCartReconciliation(): void {
  const dispatch = useDispatch()
  const store = useStore<{ cart: CartState }>()
  const { data, dataUpdatedAt } = useQuery(catalogQueryOptions())
  // Guards against a second run for the same catalog, including StrictMode's double effect.
  const lastRun = useRef(0)

  useEffect(() => {
    if (!data || dataUpdatedAt === 0 || dataUpdatedAt === lastRun.current)
      return
    lastRun.current = dataUpdatedAt

    const { items } = store.getState().cart
    if (items.length === 0) return
    dispatch(cartReconciled(reconcile(items, data)))
  }, [data, dataUpdatedAt, dispatch, store])
}
