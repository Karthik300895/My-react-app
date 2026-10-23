import { useDispatch } from 'react-redux'
import type { CheckoutStep } from '../model/checkoutSlice'
import { stepChanged } from '../model/checkoutSlice'
import { CHECKOUT_STEPS, STEP_LABELS } from '../model/steps'

type CheckoutProgressProps = { step: CheckoutStep }

// UX-DR16: an ordered progress list. Completed steps are buttons back to that step;
// upcoming steps are plain text.
export function CheckoutProgress({ step }: CheckoutProgressProps) {
  const dispatch = useDispatch()
  const currentIndex = CHECKOUT_STEPS.indexOf(step)

  return (
    <nav aria-label="Checkout progress">
      <ol className="flex flex-wrap items-center gap-2 text-body-sm">
        {CHECKOUT_STEPS.map((s, index) => {
          const label = STEP_LABELS[s]
          const isCurrent = index === currentIndex
          const isDone = index < currentIndex
          return (
            <li key={s} className="flex items-center gap-2">
              {isDone ? (
                <button
                  type="button"
                  onClick={() => dispatch(stepChanged(s))}
                  className="inline-flex min-h-touch-target items-center text-primary underline"
                >
                  {label}
                </button>
              ) : (
                <span
                  aria-current={isCurrent ? 'step' : undefined}
                  className={
                    isCurrent
                      ? 'font-semibold text-foreground'
                      : 'text-muted-foreground'
                  }
                >
                  {label}
                </span>
              )}
              {index < CHECKOUT_STEPS.length - 1 && (
                <span aria-hidden="true" className="text-muted-foreground">
                  ·
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
