import { useId } from 'react'
import { useDispatch } from 'react-redux'
import { quantityDecremented, quantityIncremented } from '../model/cartSlice'

type QuantityStepperProps = {
  productId: number
  title: string
  quantity: number
  stock: number
}

const STEP_BUTTON =
  'inline-flex size-11 items-center justify-center rounded-md border border-border-strong bg-surface text-label'

// UX-DR8, FR12, FR13: Quantity changes by 1 within 1..Stock. Each reason is visible text
// linked by aria-describedby. The disabled buttons stay focusable (shared disabled contract).
export function QuantityStepper({
  productId,
  title,
  quantity,
  stock,
}: QuantityStepperProps) {
  const dispatch = useDispatch()
  const reasonId = useId()
  const atMin = quantity <= 1
  const atMax = quantity >= stock
  const minReason = `${reasonId}-min`
  const maxReason = `${reasonId}-max`

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease quantity of ${title}`}
          aria-disabled={atMin}
          aria-describedby={atMin ? minReason : undefined}
          onClick={() => {
            if (atMin) return
            dispatch(quantityDecremented(productId))
          }}
          className={`${STEP_BUTTON} ${atMin ? 'cursor-not-allowed text-muted-foreground' : 'text-foreground hover:bg-muted'}`}
        >
          <span aria-hidden="true">−</span>
        </button>
        <span className="min-w-8 text-center text-body tabular-nums text-foreground">
          {quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase quantity of ${title}`}
          aria-disabled={atMax}
          aria-describedby={atMax ? maxReason : undefined}
          onClick={() => {
            if (atMax) return
            dispatch(quantityIncremented(productId))
          }}
          className={`${STEP_BUTTON} ${atMax ? 'cursor-not-allowed text-muted-foreground' : 'text-foreground hover:bg-muted'}`}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      {atMin && (
        <p id={minReason} className="text-caption text-muted-foreground">
          Minimum 1
        </p>
      )}
      {atMax && (
        <p id={maxReason} className="text-caption text-muted-foreground">
          Only {stock} available
        </p>
      )}
    </div>
  )
}
