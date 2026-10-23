import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  checkoutStarted,
  CheckoutFlow,
  CheckoutGuard,
  shippingDraftSaved,
  shippingSchema,
  type CheckoutState,
  type ShippingValues,
} from '../features/checkout'

import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'

const EMPTY_SHIPPING: ShippingValues = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
}

// FR23, UX-DR27, AD-2: the guard keeps an empty Cart out; every visit starts at step 1.
// One form spans every step, and its values are copied into the session when the step
// changes and when the page unmounts (NFR6: memory only).
export function CheckoutPage() {
  useDocumentTitle('Checkout')
  const dispatch = useDispatch()
  const step = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.step,
  )
  const shippingDraft = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.shippingDraft,
  )

  const form = useForm<ShippingValues>({
    defaultValues: shippingDraft ?? EMPTY_SHIPPING,
    resolver: zodResolver(shippingSchema),
    mode: 'onBlur',
  })

  useEffect(() => {
    dispatch(checkoutStarted())
  }, [dispatch])

  // AD-2: copy the values on every step change. getValues is stable, so this does not loop.
  const { getValues } = form
  useEffect(() => {
    dispatch(shippingDraftSaved(getValues()))
  }, [step, dispatch, getValues])

  // AD-2: and when the page unmounts, such as on "Edit cart".
  useEffect(() => {
    return () => {
      dispatch(shippingDraftSaved(getValues()))
    }
  }, [dispatch, getValues])

  return (
    <PageContainer className="py-section-gap">
      <h1 className="text-h1 text-foreground">Checkout</h1>
      <div className="mt-6">
        <CheckoutGuard>
          <CheckoutFlow form={form} />
        </CheckoutGuard>
      </div>
    </PageContainer>
  )
}
