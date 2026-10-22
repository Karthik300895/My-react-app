export type FilterChipKey = 'q' | 'category' | 'sort'

export type FilterChip = {
  key: FilterChipKey
  /** Shown on the chip, e.g. `“steel”`. */
  label: string
  /** Used in the remove button's name: "Remove filter: {value}". */
  value: string
}

type FilterChipsProps = {
  chips: FilterChip[]
  onRemove: (key: FilterChipKey) => void
  onClearAll: () => void
}

// UX-DR13: one chip per active criterion, plus "Clear filters".
export function FilterChips({ chips, onRemove, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <ul aria-label="Active filters" className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <li
            key={chip.key}
            className="inline-flex items-center rounded-full bg-primary-subtle pl-3 text-label text-primary"
          >
            {chip.label}
            <button
              type="button"
              aria-label={`Remove filter: ${chip.value}`}
              onClick={() => onRemove(chip.key)}
              className="inline-flex size-touch-target items-center justify-center rounded-full"
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex min-h-touch-target items-center rounded-md px-3 text-label text-primary"
      >
        Clear filters
      </button>
    </div>
  )
}
