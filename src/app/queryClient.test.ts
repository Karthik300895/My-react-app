import { describe, expect, it } from 'vitest'
import { ApiError } from '../shared/api/ApiError'
import { createQueryClient } from './queryClient'

describe('createQueryClient retry policy (AD-8)', () => {
  const retry = createQueryClient().getDefaultOptions().queries?.retry as (
    failureCount: number,
    error: unknown,
  ) => boolean

  it.each([
    [0, new ApiError('network'), true],
    [1, new ApiError('network'), false],
    [0, new ApiError('http', { status: 500 }), true],
    [1, new ApiError('http', { status: 500 }), false],
    [0, new ApiError('http', { status: 404 }), false],
    [0, new ApiError('parse'), false],
    [0, new ApiError('not-found'), false],
  ])('FR34: failure %i with %s → retry %s', (count, error, expected) => {
    expect(retry(count, error)).toBe(expected)
  })

  it('does not refetch when the window regains focus', () => {
    expect(
      createQueryClient().getDefaultOptions().queries?.refetchOnWindowFocus,
    ).toBe(false)
  })
})
