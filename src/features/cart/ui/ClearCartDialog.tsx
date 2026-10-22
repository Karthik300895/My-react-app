import { useId, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { cartCleared } from '../model/cartSlice'

type ClearCartDialogProps = {
  /** Units in the Cart (sum of quantities), as the header counts them. */
  count: number
  /** Runs before the Cart empties, so the page can move focus to the empty state. */
  onCleared: () => void
}

// FR15, UX-DR21: the one place cartCleared is dispatched (AD-15).
export function ClearCartDialog({ count, onCleared }: ClearCartDialogProps) {
  const dispatch = useDispatch()
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmedRef = useRef(false)
  const title = `Remove all ${count} ${count === 1 ? 'item' : 'items'} from your cart?`

  const open = () => {
    confirmedRef.current = false
    // UX-DR21: Cancel is the autofocus target. Set it here, since React's autoFocus
    // prop would fire while the dialog is still closed.
    cancelRef.current?.setAttribute('autofocus', '')
    dialogRef.current?.showModal()
    cancelRef.current?.focus()
  }

  const cancel = () => dialogRef.current?.close()

  const confirm = () => {
    confirmedRef.current = true
    dialogRef.current?.close()
    onCleared()
    dispatch(cartCleared())
  }

  // Esc and Cancel both land here. Confirming does not: the trigger is gone once the Cart is empty.
  const handleClose = () => {
    if (!confirmedRef.current) triggerRef.current?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className="inline-flex min-h-touch-target items-center rounded-md px-3 text-label text-danger hover:bg-danger-subtle"
      >
        Clear cart
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={handleClose}
        className="m-auto w-[min(100%-2rem,28rem)] rounded-lg border border-border bg-surface p-6 text-foreground shadow-float backdrop:bg-foreground/40"
      >
        <h2 id={titleId} className="text-h2 text-foreground">
          {title}
        </h2>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={cancel}
            className="inline-flex min-h-touch-target items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-label text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="inline-flex min-h-touch-target items-center justify-center rounded-md bg-danger px-4 text-label text-surface"
          >
            Clear cart
          </button>
        </div>
      </dialog>
    </>
  )
}
