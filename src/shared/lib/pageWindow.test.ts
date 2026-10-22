import { describe, expect, it } from 'vitest'
import { pageWindow } from './pageWindow'

describe('pageWindow (UX-DR14)', () => {
  it.each([
    [1, 1, [1]],
    [1, 3, [1, 2, 3]],
    [1, 10, [1, 2, 'gap', 10]],
    [5, 10, [1, 'gap', 4, 5, 6, 'gap', 10]],
    [3, 10, [1, 2, 3, 4, 'gap', 10]],
    [10, 10, [1, 'gap', 9, 10]],
    // A single skipped page is shown, not hidden behind a gap.
    [4, 10, [1, 2, 3, 4, 5, 'gap', 10]],
    [7, 10, [1, 'gap', 6, 7, 8, 9, 10]],
  ])('page %i of %i → %j', (page, count, expected) => {
    expect(pageWindow(page, count)).toEqual(expected)
  })
})
