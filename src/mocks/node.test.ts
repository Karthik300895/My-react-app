import { describe, expect, it } from 'vitest'
import { PRODUCT_API_ORIGIN } from './handlers'

describe('MSW test server', () => {
  it('AD-10: an unmocked request is rejected by MSW instead of reaching the live API', async () => {
    const error = await fetch(
      `${PRODUCT_API_ORIGIN}/no-handler-for-this-path`,
    ).then(
      () => null,
      (e: unknown) => e as Error & { cause?: unknown },
    )

    // Asserting on MSW's own reason matters: a blocked network would also reject the fetch.
    expect(String((error?.cause as Error | undefined)?.message)).toContain(
      '[MSW] Cannot bypass a request when using the "error" strategy',
    )
  })
})
