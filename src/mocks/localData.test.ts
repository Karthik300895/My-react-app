import { describe, expect, it } from 'vitest'
import {
  catalogResponseDtoSchema,
  categoriesResponseDtoSchema,
  productDetailsDtoSchema,
} from '../shared/api/dto'
import { localJson } from './localData'

describe('local fallback data (dev only)', () => {
  it('FR6: the whole catalog is valid against the Product API schema, with local images', () => {
    const body = localJson('/products?limit=0')
    const parsed = catalogResponseDtoSchema.parse(body)
    expect(parsed.products).toHaveLength(parsed.total)
    expect(parsed.products[0].thumbnail.startsWith('data:image/svg+xml')).toBe(
      true,
    )
  })

  it('FR3: the categories are valid against the Product API schema', () => {
    expect(
      categoriesResponseDtoSchema.parse(localJson('/products/categories'))
        .length,
    ).toBeGreaterThan(0)
  })

  it('FR7: a single product carries every image and matches the details schema', () => {
    const product = productDetailsDtoSchema.parse(localJson('/products/1'))
    expect(product.id).toBe(1)
    expect(
      product.images.every((src) => src.startsWith('data:image/svg+xml')),
    ).toBe(true)
  })

  it('FR7: the select parameter keeps only the requested fields, plus id', () => {
    const body = localJson('/products?limit=2&select=title,price') as {
      products: Record<string, unknown>[]
    }
    expect(Object.keys(body.products[0]).sort()).toEqual([
      'id',
      'price',
      'title',
    ])
  })

  it('FR9: an unknown path or product id is not answered locally', () => {
    expect(localJson('/products/99999')).toBeUndefined()
    expect(localJson('/nope')).toBeUndefined()
  })
})
