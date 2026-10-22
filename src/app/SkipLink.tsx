// UX-DR3: the first focusable element on every page.
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:inline-flex focus:min-h-touch-target focus:items-center focus:rounded-md focus:bg-surface focus:px-4 focus:text-label focus:text-foreground"
    >
      Skip to content
    </a>
  )
}
