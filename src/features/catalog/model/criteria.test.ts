import { describe, expect, it } from 'vitest'
import type { Product } from '../../../shared/model/product'
import {
  parseCategory,
  parseQuery,
  parseSort,
  sortLabel,
  SORT_OPTIONS,
} from './criteria'
import {
  applyCriteria,
  describeNoMatch,
  matchesCategory,
  matchesSearch,
} from './listing'

const product = (
  id: number,
  title: string,
  priceCents: number,
  category: string,
  description = '',
  stock = 10,
): Product => ({
  id,
  title,
  description,
  priceCents,
  category,
  rating: 4,
  stock,
  thumbnail: 'https://cdn.example/x.webp',
})

// API (relevance) order is the array order.
const catalog = [
  product(1, 'Steel Watch', 15000, 'mens-watches', 'Brushed steel case'),
  product(2, 'Red Lipstick', 1299, 'beauty', 'A bold red'),
  product(3, 'Leather Watch', 9000, 'mens-watches', 'Soft strap', 0),
  product(4, 'Stainless Pan', 4500, 'kitchen', 'Made of STEEL'),
  product(5, 'Gold Watch', 9000, 'mens-watches', 'Polished'),
]
const ids = (products: Product[]) => products.map((p) => p.id)

describe('criteria parsing (AD-7)', () => {
  it.each([
    [null, ''],
    ['  steel  ', 'steel'],
    ['x'.repeat(150), 'x'.repeat(100)],
  ])('FR2: q %j → %j', (raw, q) => {
    expect(parseQuery(raw)).toBe(q)
  })

  it.each([
    [null, ''],
    ['mens-watches', 'mens-watches'],
    ['beauty', 'beauty'],
    ['Bad Slug!', ''],
    ['-leading', ''],
    ['UPPER', ''],
  ])('FR3: category %j → %j', (raw, category) => {
    expect(parseCategory(raw)).toBe(category)
  })

  it.each([
    [null, 'relevance'],
    ['price-asc', 'price-asc'],
    ['price-desc', 'price-desc'],
    ['cheap', 'relevance'],
    ['rating', 'relevance'],
  ])('FR4: sort %j → %j', (raw, sort) => {
    expect(parseSort(raw)).toBe(sort)
  })

  it('FR4: the sort table lists exactly the three V1 options with their labels', () => {
    expect(SORT_OPTIONS.map((o) => [o.value, o.label])).toEqual([
      ['relevance', 'Relevance'],
      ['price-asc', 'Price: low to high'],
      ['price-desc', 'Price: high to low'],
    ])
    expect(sortLabel('price-desc')).toBe('Price: high to low')
  })
})

describe('listing functions (AD-6)', () => {
  it('FR2: search is case-insensitive over title and description', () => {
    expect(matchesSearch(catalog[0], 'STEEL')).toBe(true)
    expect(matchesSearch(catalog[3], 'steel')).toBe(true) // description only
    expect(matchesSearch(catalog[1], 'steel')).toBe(false)
    expect(matchesSearch(catalog[1], '   ')).toBe(true)
  })

  it('FR3: the Category filter matches by slug; empty means all', () => {
    expect(matchesCategory(catalog[0], 'mens-watches')).toBe(true)
    expect(matchesCategory(catalog[1], 'mens-watches')).toBe(false)
    expect(matchesCategory(catalog[1], '')).toBe(true)
  })

  it('FR4: relevance keeps the API order', () => {
    expect(
      ids(applyCriteria(catalog, { q: '', category: '', sort: 'relevance' })),
    ).toEqual([1, 2, 3, 4, 5])
  })

  it('FR4: price sorts apply to the whole set and are stable for equal prices', () => {
    expect(
      ids(applyCriteria(catalog, { q: '', category: '', sort: 'price-asc' })),
    ).toEqual([2, 4, 3, 5, 1])
    expect(
      ids(applyCriteria(catalog, { q: '', category: '', sort: 'price-desc' })),
    ).toEqual([1, 3, 5, 4, 2])
  })

  it('FR5: combined criteria return only Products matching all of them', () => {
    expect(
      ids(
        applyCriteria(catalog, {
          q: 'watch',
          category: 'mens-watches',
          sort: 'price-asc',
        }),
      ),
    ).toEqual([3, 5, 1])
    expect(
      ids(
        applyCriteria(catalog, {
          q: 'steel',
          category: 'mens-watches',
          sort: 'relevance',
        }),
      ),
    ).toEqual([1])
  })

  it('AD-9: out-of-stock Products are never filtered out', () => {
    expect(
      ids(
        applyCriteria(catalog, {
          q: 'leather',
          category: '',
          sort: 'relevance',
        }),
      ),
    ).toEqual([3])
  })

  it('does not mutate the catalog when sorting', () => {
    const before = ids(catalog)
    applyCriteria(catalog, { q: '', category: '', sort: 'price-desc' })
    expect(ids(catalog)).toEqual(before)
  })

  it.each([
    ['steel', 'Mens Watches', 'No products match “steel” in Mens Watches.'],
    ['steel', '', 'No products match “steel”.'],
    ['', 'Beauty', 'No products match the Beauty category.'],
    ['', '', 'No products match.'],
  ])('FR6: describes q=%j category=%j', (q, name, text) => {
    expect(describeNoMatch(q, name)).toBe(text)
  })
})
