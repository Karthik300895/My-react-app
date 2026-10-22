import type { ReactNode } from 'react'
import { useLateHeadingFocus } from '../../../shared/lib/focusPageHeading'
import { formatMoney } from '../../../shared/lib/formatMoney'
import { isAvailable } from '../../../shared/model/availability'
import type { ProductDetails } from '../../../shared/model/product'
import { StockBadge } from '../../../shared/ui/StockBadge'
import { BackToProducts } from './BackToProducts'
import { DETAILS_GRID } from './detailsClasses'
import { ProductGallery } from './ProductGallery'
import { ProductRating } from './ProductRating'

type ProductDetailsViewProps = {
  product: ProductDetails
  categoryName: string
  /** AD-1: pages fill this slot by composition (Epic 2 adds Add to Cart). */
  action?: ReactNode
}

// FR7, FR8, UX-DR26: gallery on the left from `md`, everything to decide on the right.
export function ProductDetailsView({
  product,
  categoryName,
  action,
}: ProductDetailsViewProps) {
  // The h1 arrives after the data: take focus over from `main` (AD-11).
  useLateHeadingFocus()
  // Unique URLs (they key the thumbnails); the thumbnail stands in when there are none.
  const unique = [...new Set(product.images)]
  const images = unique.length > 0 ? unique : [product.thumbnail]

  return (
    <div className={DETAILS_GRID}>
      <ProductGallery
        key={product.id}
        title={product.title}
        images={images}
        available={isAvailable(product)}
      />
      <div className="flex flex-col items-start gap-3">
        <p className="text-caption text-muted-foreground">{categoryName}</p>
        <h1 className="text-h1 text-foreground">{product.title}</h1>
        <ProductRating rating={product.rating} />
        <p className="text-price-lg text-foreground tabular-nums">
          {formatMoney(product.priceCents)}
        </p>
        <StockBadge stock={product.stock} />
        <p className="text-body text-foreground">{product.description}</p>
        <div data-slot="action" className="w-full">
          {action}
        </div>
        <BackToProducts />
      </div>
    </div>
  )
}
