import { describe, expect, it } from 'vitest'
import { listingReturnState, readListingReturn } from './listingReturn'
import { parseProductId } from './productId'

describe('parseProductId (AD-8)', () => {
  it.each([
    ['1', 1],
    ['24', 24],
    ['123456789', 123456789],
  ])('FR7: %s is the id %i', (raw, id) => {
    expect(parseProductId(raw)).toBe(id)
  })

  it.each([
    'abc',
    '-1',
    '0',
    '1.5',
    '07',
    '1e3',
    ' 1',
    '',
    '1234567890',
    undefined,
  ])('FR9: %j is malformed', (raw) => {
    expect(parseProductId(raw)).toBeNull()
  })
})

describe('listing return (FR7)', () => {
  it('stores the listing URL, criteria included, only from the listing', () => {
    expect(
      listingReturnState({ pathname: '/products', search: '?category=beauty' }),
    ).toEqual({ listingUrl: '/products?category=beauty' })
    expect(listingReturnState({ pathname: '/products', search: '' })).toEqual({
      listingUrl: '/products',
    })
    expect(
      listingReturnState({ pathname: '/products/', search: '?q=lip' }),
    ).toEqual({ listingUrl: '/products?q=lip' })
    expect(listingReturnState({ pathname: '/', search: '' })).toBeUndefined()
  })

  it.each([
    [{ listingUrl: '/products?q=lip&page=2' }, '/products?q=lip&page=2'],
    [{ listingUrl: '/products' }, '/products'],
    [{ listingUrl: '//evil.example/products' }, null],
    [{ listingUrl: 'https://evil.example/products' }, null],
    [{ listingUrl: '/products/4' }, null],
    [{ listingUrl: '/cart' }, null],
    [{ listingUrl: 42 }, null],
    [null, null],
    ['/products', null],
    [undefined, null],
  ])('reads %j as %j (history state is untrusted)', (state, expected) => {
    expect(readListingReturn(state)).toBe(expected)
  })
})
