import { describe, expect, it } from 'vitest'
import type { Product } from '../../../shared/model/product'
import { topRated } from './topRated'

function makeProduct(id: number, rating: number): Product {
  return {
    id,
    title: `Product ${id}`,
    description: '',
    priceCents: 1000,
    category: 'test',
    rating,
    stock: 10,
    thumbnail: `https://cdn.example.com/${id}.jpg`,
  }
}

describe('topRated', () => {
  const products = [
    makeProduct(1, 4.5),
    makeProduct(2, 4.9),
    makeProduct(3, 3.0),
    makeProduct(4, 4.9),
    makeProduct(5, 4.7),
  ]

  it('FR31: returns at most `limit` products', () => {
    expect(topRated(products, 3)).toHaveLength(3)
  })

  it('FR31: sorts by rating descending', () => {
    const result = topRated(products, 5)
    expect(result[0].rating).toBeGreaterThanOrEqual(result[1].rating)
    expect(result[1].rating).toBeGreaterThanOrEqual(result[2].rating)
  })

  it('FR31: breaks ties by id ascending', () => {
    // id 2 and id 4 both have rating 4.9; id 2 should come first
    const result = topRated(products, 5)
    const tiedIds = result.filter((p) => p.rating === 4.9).map((p) => p.id)
    expect(tiedIds).toEqual([2, 4])
  })

  it('returns all products when fewer than limit', () => {
    expect(topRated(products, 20)).toHaveLength(products.length)
  })

  it('returns empty array for empty input', () => {
    expect(topRated([], 8)).toEqual([])
  })

  it('does not mutate the input array', () => {
    const input = [...products]
    topRated(input, 3)
    expect(input).toEqual(products)
  })
})
