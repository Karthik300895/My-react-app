import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { type Notice, type NoticesState, noticeDismissed } from './noticesSlice'

// FR13: a transient Notice auto-dismisses after 5 s, and pauses while hovered or focused.
export const NOTICE_TIMEOUT_MS = 5000

type NoticeItemProps = {
  notice: Notice
  /** Only the newest Notice is expanded below `md` (UX-DR18). */
  expanded: boolean
  onDismiss: (id: number) => void
}

function NoticeItem({ notice, expanded, onDismiss }: NoticeItemProps) {
  const dispatch = useDispatch()
  const [paused, setPaused] = useState(false)

  // Auto-dismiss is not a user dismiss, so it never moves focus.
  useEffect(() => {
    if (notice.persistent || paused) return
    const timer = window.setTimeout(
      () => dispatch(noticeDismissed(notice.id)),
      NOTICE_TIMEOUT_MS,
    )
    return () => window.clearTimeout(timer)
  }, [dispatch, notice.id, notice.persistent, paused])

  return (
    <div
      data-notice-id={notice.id}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`pointer-events-auto w-full max-w-sm items-center gap-3 rounded-md bg-foreground px-4 py-3 text-body-sm text-surface shadow-float focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-surface md:w-80 ${
        expanded ? 'flex' : 'hidden md:flex'
      }`}
    >
      <p className="flex-1">{notice.message}</p>
      <button
        type="button"
        data-dismiss
        aria-label="Dismiss notice"
        onClick={() => onDismiss(notice.id)}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-surface"
      >
        <span aria-hidden="true" className="text-h3 leading-none">
          ×
        </span>
      </button>
    </div>
  )
}

// UX-DR18, AD-16: the one aria-live region. Notices are raised only by the notice listener.
export function NoticeRegion() {
  const dispatch = useDispatch()
  const notices = useSelector(
    (state: { notices: NoticesState }) => state.notices.items,
  )
  // After a manual dismiss, focus moves to the next Notice, or back to main (UX-DR18).
  const focusTarget = useRef<number | 'main' | null>(null)

  const dismiss = (id: number) => {
    const index = notices.findIndex((notice) => notice.id === id)
    const next = notices[index + 1] ?? notices[index - 1]
    focusTarget.current = next ? next.id : 'main'
    dispatch(noticeDismissed(id))
  }

  useEffect(() => {
    const target = focusTarget.current
    if (target === null) return
    focusTarget.current = null
    if (target === 'main') {
      document.getElementById('main')?.focus()
      return
    }
    document
      .querySelector<HTMLButtonElement>(
        `[data-notice-id="${target}"] [data-dismiss]`,
      )
      ?.focus()
  }, [notices])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 md:inset-x-auto md:top-4 md:right-4 md:bottom-auto md:items-end"
    >
      {notices.map((notice, index) => (
        <NoticeItem
          key={notice.id}
          notice={notice}
          expanded={index === 0}
          onDismiss={dismiss}
        />
      ))}
      {notices.length > 1 && (
        <p className="pointer-events-auto text-caption text-foreground md:hidden">
          +{notices.length - 1} more
        </p>
      )}
    </div>
  )
}
