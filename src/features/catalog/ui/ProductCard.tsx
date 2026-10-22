import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { formatMoney } from '../../../shared/lib/formatMoney'
import { isAvailable, stockLevel } from '../../../shared/model/availability'
import type { Product } from '../../../shared/model/product'
import { StockBadge } from '../../../shared/ui/StockBadge'
import { categoryLabel } from '../model/categoryLabel'
import { listingReturnState } from '../model/listingReturn'

type ProductCardProps = {
  product: Product
  /** AD-1: pages fill this slot by composition (Epic 2 adds Add to Cart). */
  action?: ReactNode
  /** The Category's API name; falls back to a label made from the slug. */
  categoryName?: string
}

// UX-DR5, UX-DR6, FR1: one stretched title link. Only the image wrapper clips, so the
// focus ring on the title link is never cut off.
export function ProductCard({
  product,
  action,
  categoryName,
}: ProductCardProps) {
  const location = useLocation()
  const available = isAvailable(product)
  const level = stockLevel(product)
  const rating = product.rating.toFixed(1)

  return (
    <article className="relative flex h-full flex-col rounded-lg border border-border bg-surface p-3 transition-[translate,box-shadow] duration-[var(--motion-fast)] hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-square overflow-hidden rounded-md bg-surface">
        <img
          src={product.thumbnail}
          alt={product.title}
          loading="lazy"
          decoding="async"
          width={300}
          height={300}
          className={`size-full object-contain ${available ? '' : '[filter:var(--oos-image-filter)]'}`}
        />
        {level === 'low-stock' && (
          <StockBadge stock={product.stock} className="absolute top-2 left-2" />
        )}
        {level === 'out-of-stock' && (
          <div className="absolute inset-x-0 bottom-1/6 flex justify-center">
            <StockBadge stock={product.stock} />
          </div>
        )}
      </div>
      <p className="mt-3 text-caption text-muted-foreground">
        {categoryName ?? categoryLabel(product.category)}
      </p>
      <h3 className="mt-1 text-h3 text-foreground">
        <Link
          to={`/products/${product.id}`}
          state={listingReturnState(location)}
          className="after:absolute after:inset-0 after:rounded-lg"
        >
          <span className="line-clamp-2">{product.title}</span>
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-body-sm text-muted-foreground">
        {product.description}
      </p>
      <p className="mt-2 text-body-sm text-muted-foreground">
        <span aria-hidden="true">
          <span className="text-rating">★</span> {rating}
        </span>
        <span className="sr-only">Rated {rating} out of 5</span>
      </p>
      <p className="mt-1 text-price text-foreground tabular-nums">
        {formatMoney(product.priceCents)}
      </p>
      <div data-slot="action" className="relative z-10 mt-auto pt-3">
        {action}
      </div>
    </article>
  )
}
