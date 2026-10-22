type NoResultsProps = {
  description: string
  /** Omitted when there are no filters to clear (an empty catalog). */
  onClear?: () => void
}

// FR6: an explicit empty state that names the criteria and offers a way out.
export function NoResults({ description, onClear }: NoResultsProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-gutter-tablet text-center">
      <h2 className="text-h2 text-foreground">No products match</h2>
      <p className="mt-2 text-body text-muted-foreground">{description}</p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 inline-flex min-h-touch-target items-center rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
