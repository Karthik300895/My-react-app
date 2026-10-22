type AlertProps = { message: string; onRetry?: () => void }

// UX-DR19: an inline error with an optional Retry. Load errors are never Notices.
export function Alert({ message, onRetry }: AlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md bg-danger-subtle p-4 text-danger sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2 text-body">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="mt-0.5 size-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6M12 16.5v.5" />
        </svg>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-touch-target shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-label text-foreground"
        >
          Retry
        </button>
      )}
    </div>
  )
}
