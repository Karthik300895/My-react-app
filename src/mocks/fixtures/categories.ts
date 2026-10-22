import {
  categoryDtoSchema,
  PRODUCT_API_ORIGIN,
  type CategoryDto,
} from '../../shared/api/dto'
import { productFixtures } from './products'

// AD-10: one Category per slug used by the product fixtures, in DummyJSON's shape, plus
// one Category with no products (an empty filter result is a real API case).
const NAMES: Record<string, string> = {
  beauty: 'Beauty',
  fragrances: 'Fragrances',
  furniture: 'Furniture',
  groceries: 'Groceries',
  'mens-watches': 'Mens Watches',
}

const slugs = [
  ...new Set([...productFixtures.map((p) => p.category), 'mens-watches']),
]

export const categoryFixtures: CategoryDto[] = slugs.map((slug) => {
  const name = NAMES[slug]
  if (!name) throw new Error(`categories fixture: add a name for "${slug}"`)
  return categoryDtoSchema.parse({
    slug,
    name,
    url: `${PRODUCT_API_ORIGIN}/products/category/${slug}`,
  })
})
