import type { ReactNode } from 'react'
import type { Product } from '../../../shared/model/product'
import { GRID_CLASSES } from './gridClasses'
import { ProductCard } from './ProductCard'

type ProductGridProps = {
  products: Product[]
  renderAction?: (product: Product) => ReactNode
  categoryName?: (slug: string) => string
}

export function ProductGrid({
  products,
  renderAction,
  categoryName,
}: ProductGridProps) {
  return (
    <ul className={GRID_CLASSES}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            action={renderAction?.(product)}
            categoryName={categoryName?.(product.category)}
          />
        </li>
      ))}
    </ul>
  )
}
