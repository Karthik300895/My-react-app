const STARS = 5

type ProductRatingProps = { rating: number }

// FR7, UX-DR26: the rating as visible text, with stars as a decorative echo.
export function ProductRating({ rating }: ProductRatingProps) {
  const filled = Math.min(STARS, Math.max(0, Math.round(rating)))
  return (
    <p className="flex flex-wrap items-center gap-2 text-body-sm text-muted-foreground">
      <span aria-hidden="true" className="tracking-wider">
        <span className="text-rating">{'★'.repeat(filled)}</span>
        <span className="text-border-strong">{'★'.repeat(STARS - filled)}</span>
      </span>
      <span>Rated {rating.toFixed(1)} out of 5</span>
    </p>
  )
}
