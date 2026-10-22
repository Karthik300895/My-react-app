import { describe, expect, it } from 'vitest'
import { categoryLabel } from './categoryLabel'
import { paginate, PAGE_SIZE } from './paginate'
import { parsePage } from './useListingCriteria'

const items = Array.from({ length: 45 }, (_, i) => i + 1)

describe('paginate (AD-6)', () => {
  it('FR1: 20 items per page', () => {
    expect(PAGE_SIZE).toBe(20)
    expect(paginate(items, 1)).toEqual({
      items: items.slice(0, 20),
      page: 1,
      pageCount: 3,
    })
    expect(paginate(items, 3).items).toEqual([41, 42, 43, 44, 45])
  })

  it('FR1: a page beyond the last falls back to page 1', () => {
    expect(paginate(items, 4).page).toBe(1)
    expect(paginate(items, 0).page).toBe(1)
  })

  it('FR6: an empty result is one empty page', () => {
    expect(paginate([], 1)).toEqual({ items: [], page: 1, pageCount: 1 })
  })
})

describe('parsePage (AD-7)', () => {
  it.each([
    [null, 1],
    ['2', 2],
    ['0', 1],
    ['-3', 1],
    ['1.5', 1],
    ['abc', 1],
    ['', 1],
  ])('FR5: %j → %i', (raw, page) => {
    expect(parsePage(raw)).toBe(page)
  })
})

describe('categoryLabel', () => {
  it.each([
    ['beauty', 'Beauty'],
    ['mens-shirts', 'Mens Shirts'],
    ['home-decoration', 'Home Decoration'],
  ])('FR1: %s → %s', (slug, label) => {
    expect(categoryLabel(slug)).toBe(label)
  })
})
