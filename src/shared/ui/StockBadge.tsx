import { stockLabel, stockLevel, type StockLevel } from '../model/availability'

const LEVEL_STYLES: Record<StockLevel, string> = {
  'in-stock': 'bg-success-subtle text-success',
  'low-stock': 'bg-warning-subtle text-warning',
  // Out of stock is a fact, not an error: an inverted neutral pill, never red.
  'out-of-stock': 'bg-foreground text-surface',
}

type StockBadgeProps = { stock: number; className?: string }

// UX-DR7, FR8: stock state is always text; colour only reinforces it.
export function StockBadge({ stock, className = '' }: StockBadgeProps) {
  const level = stockLevel({ stock })
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption ${LEVEL_STYLES[level]} ${className}`}
    >
      {stockLabel({ stock })}
    </span>
  )
}
