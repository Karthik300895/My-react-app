import { useEffect, useRef, useState, type RefObject } from 'react'
import { MAX_QUERY_LENGTH } from '../model/criteria'

const SEARCH_DEBOUNCE_MS = 300

type SearchBoxProps = {
  /** The committed query from the URL. */
  query: string
  /** Changes whenever any URL criterion changes (from here or elsewhere). */
  urlKey: string
  onSearch: (query: string) => void
  inputRef: RefObject<HTMLInputElement | null>
}

// UX-DR11, FR2: searches 300 ms after typing stops, or at once on Enter. The typed text is
// local; only the committed query lives in the URL (AD-7).
export function SearchBox({
  query,
  urlKey,
  onSearch,
  inputRef,
}: SearchBoxProps) {
  const [text, setText] = useState(query)
  const [syncedKey, setSyncedKey] = useState(urlKey)
  const timer = useRef<number | undefined>(undefined)

  // Re-sync when the URL changes (a chip, Clear filters, Back, or our own commit).
  if (urlKey !== syncedKey) {
    setSyncedKey(urlKey)
    if (query !== text.trim()) setText(query)
  }

  // Any URL change cancels a pending search, so typed-but-uncommitted text can't
  // overwrite a newer URL (e.g. type, then Clear filters within 300 ms).
  useEffect(() => () => window.clearTimeout(timer.current), [urlKey])

  function commit(value: string) {
    window.clearTimeout(timer.current)
    if (value.trim() !== query) onSearch(value.trim())
  }

  return (
    <form
      role="search"
      className="w-full sm:max-w-sm"
      onSubmit={(event) => {
        event.preventDefault()
        commit(text)
      }}
    >
      <label htmlFor="product-search" className="text-label text-foreground">
        Search products
      </label>
      <div className="relative mt-1">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          id="product-search"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          maxLength={MAX_QUERY_LENGTH}
          value={text}
          onChange={(event) => {
            const value = event.target.value
            setText(value)
            window.clearTimeout(timer.current)
            timer.current = window.setTimeout(
              () => commit(value),
              SEARCH_DEBOUNCE_MS,
            )
          }}
          className="min-h-touch-target w-full rounded-md border border-border-strong bg-surface pr-12 pl-10 text-body text-foreground [&::-webkit-search-cancel-button]:appearance-none"
        />
        {text && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setText('')
              commit('')
              inputRef.current?.focus()
            }}
            className="absolute top-0 right-0 inline-flex size-touch-target items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </form>
  )
}
