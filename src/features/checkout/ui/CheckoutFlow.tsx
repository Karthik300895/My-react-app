import { useEffect, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useSelector } from 'react-redux'
import type { CartState } from '../../cart'
import type { CheckoutState } from '../model/checkoutSlice'
import type { ShippingValues } from '../model/shippingSchema'
import { CheckoutProgress } from './CheckoutProgress'
import { OrderTotalPanel } from './OrderTotalPanel'
import { ReviewStep } from './ReviewStep'
import { ShippingStep } from './ShippingStep'
import { SummaryStep } from './SummaryStep'

type CheckoutFlowProps = {
  /** AD-2: the single shipping form, owned by CheckoutPage so it spans every step. */
  form: UseFormReturn<ShippingValues>
}

// UX-DR16, UX-DR27: the steps, with focus moved to the new step's heading on each change.
export function CheckoutFlow({ form }: CheckoutFlowProps) {
  const step = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.step,
  )
  const items = useSelector((state: { cart: CartState }) => state.cart.items)
  const shippingDraft = useSelector(
    (state: { checkout: CheckoutState }) => state.checkout.shippingDraft,
  )

  // Track the last step so a StrictMode re-run does not move focus on mount.
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    document.querySelector<HTMLElement>('[data-step-heading]')?.focus()
  }, [step])

  return (
    <div className="flex flex-col gap-6">
      <CheckoutProgress step={step} />
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8">
        <div className="order-2 min-w-0 lg:order-1">
          {step === 'review' && <ReviewStep items={items} />}
          {step === 'shipping' && <ShippingStep form={form} />}
          {step === 'summary' && shippingDraft && (
            <SummaryStep items={items} shipping={shippingDraft} />
          )}
        </div>
        <div className="order-1 lg:order-2">
          <OrderTotalPanel items={items} />
        </div>
      </div>
    </div>
  )
}
