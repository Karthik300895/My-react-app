import { describe, expect, it } from 'vitest'
import {
  catalogProductDtoSchema,
  catalogResponseDtoSchema,
  categoriesResponseDtoSchema,
  PRODUCT_API_ORIGIN,
} from '../shared/api/dto'
import { categoryFixtures } from './fixtures/categories'
import { productFixtures } from './fixtures/products'

describe('MSW fixtures (AD-10)', () => {
  it('AD-10: every fixture validates against the DTO schema', () => {
    for (const product of productFixtures)
      expect(
        catalogProductDtoSchema.safeParse(product).success,
        product.title,
      ).toBe(true)
  })

  it('AD-10: includes ≥ 2 out-of-stock and ≥ 1 low-stock products, and more than one page', () => {
    expect(
      productFixtures.filter((p) => p.stock === 0).length,
    ).toBeGreaterThanOrEqual(2)
    expect(
      productFixtures.filter((p) => p.stock >= 1 && p.stock <= 5).length,
    ).toBeGreaterThanOrEqual(1)
    expect(productFixtures.length).toBeGreaterThan(20)
    expect(new Set(productFixtures.map((p) => p.id)).size).toBe(
      productFixtures.length,
    )
  })
})

describe('/products handler (AD-10)', () => {
  const get = async (query: string) => {
    const response = await fetch(`${PRODUCT_API_ORIGIN}/products${query}`)
    return response.json() as Promise<Record<string, unknown>>
  }

  it('AD-10: limit=0 returns the whole catalog as a valid DummyJSON list', async () => {
    const body = await get('?limit=0')
    const parsed = catalogResponseDtoSchema.parse(body)
    expect(parsed.products).toHaveLength(productFixtures.length)
    expect(parsed.total).toBe(productFixtures.length)
  })

  it('AD-10: honours limit and skip', async () => {
    const body = catalogResponseDtoSchema.parse(await get('?limit=5&skip=10'))
    expect(body.products.map((p) => p.id)).toEqual([11, 12, 13, 14, 15])
    expect(body).toMatchObject({ skip: 10, limit: 5 })
  })

  it('AD-10: defaults to 30 items like DummyJSON when limit is absent', async () => {
    const body = catalogResponseDtoSchema.parse(await get(''))
    expect(body.products).toHaveLength(Math.min(30, productFixtures.length))
  })

  it('AD-10: honours select, always including id', async () => {
    const body = await get('?limit=2&select=title,price')
    expect(body.products).toEqual([
      {
        id: 1,
        title: productFixtures[0].title,
        price: productFixtures[0].price,
      },
      {
        id: 2,
        title: productFixtures[1].title,
        price: productFixtures[1].price,
      },
    ])
  })
})

describe('/products/categories handler (AD-10)', () => {
  it('AD-10: every product Category is listed, built through the DTO schema', async () => {
    const response = await fetch(`${PRODUCT_API_ORIGIN}/products/categories`)
    const categories = categoriesResponseDtoSchema.parse(await response.json())
    const slugs = categories.map((c) => c.slug)
    for (const product of productFixtures)
      expect(slugs).toContain(product.category)
    expect(categories).toEqual(categoryFixtures)
  })
})
