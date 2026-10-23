import { useState } from 'react'
import type { FieldErrors, UseFormReturn } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { shippingDraftSaved, stepChanged } from '../model/checkoutSlice'
import {
  OPTIONAL_FIELDS,
  SHIPPING_AUTOCOMPLETE,
  SHIPPING_FIELD_ORDER,
  SHIPPING_LABELS,
  type ShippingField,
  type ShippingValues,
} from '../model/shippingSchema'

type ShippingStepProps = { form: UseFormReturn<ShippingValues> }

const INPUT_CLASSES =
  'min-h-touch-target w-full rounded-md border bg-surface px-3 text-body text-foreground'

// FR25, UX-DR17: one column of labelled fields. Errors show on blur, and a failed submit
// names the count and moves focus to the first invalid field.
export function ShippingStep({ form }: ShippingStepProps) {
  const dispatch = useDispatch()
  const { register, handleSubmit, formState, setFocus } = form
  const { errors } = formState
  const [failedCount, setFailedCount] = useState(0)

  const onValid = (values: ShippingValues) => {
    setFailedCount(0)
    dispatch(shippingDraftSaved(values))
    dispatch(stepChanged('summary'))
  }

  const onInvalid = (invalid: FieldErrors<ShippingValues>) => {
    const fields = SHIPPING_FIELD_ORDER.filter((field) => invalid[field])
    setFailedCount(fields.length)
    if (fields[0]) setFocus(fields[0])
  }

  return (
    <section className="flex flex-col gap-4">
      <h2
        data-step-heading
        tabIndex={-1}
        className="text-h2 text-foreground focus:outline-none"
      >
        Shipping
      </h2>
      <form
        noValidate
        onSubmit={handleSubmit(onValid, onInvalid)}
        className="flex w-full max-w-[var(--spacing-form-max)] flex-col gap-4"
      >
        {failedCount > 0 && (
          <p role="status" className="text-body-sm font-semibold text-danger">
            Fix {failedCount} {failedCount === 1 ? 'field' : 'fields'} to
            continue.
          </p>
        )}
        {SHIPPING_FIELD_ORDER.map((field) => (
          <ShippingInput
            key={field}
            field={field}
            register={register}
            error={errors[field]?.message}
          />
        ))}
        <button
          type="submit"
          className="inline-flex min-h-touch-target items-center justify-center self-start rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover"
        >
          Review order
        </button>
      </form>
    </section>
  )
}

type ShippingInputProps = {
  field: ShippingField
  register: UseFormReturn<ShippingValues>['register']
  error: string | undefined
}

function ShippingInput({ field, register, error }: ShippingInputProps) {
  const id = `shipping-${field}`
  const errorId = `${id}-error`
  const optional = OPTIONAL_FIELDS.includes(field)

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label text-foreground">
        {SHIPPING_LABELS[field]}{' '}
        <span className="text-caption text-muted-foreground">
          {optional ? '(optional)' : '(required)'}
        </span>
      </label>
      <input
        id={id}
        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
        autoComplete={SHIPPING_AUTOCOMPLETE[field]}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${INPUT_CLASSES} ${error ? 'border-danger' : 'border-border-strong'}`}
        {...register(field)}
      />
      {error && (
        <p
          id={errorId}
          className="flex items-start gap-2 text-caption text-danger"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-0.5 size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16.5v.5" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
