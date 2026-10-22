export type ApiErrorKind = 'network' | 'http' | 'not-found' | 'parse'

// AD-8: the only error type the Product API adapter throws.
export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(
    kind: ApiErrorKind,
    options: { status?: number; cause?: unknown } = {},
  ) {
    super(
      `Product API ${kind} error${options.status !== undefined ? ` (${options.status})` : ''}`,
      { cause: options.cause },
    )
    this.name = 'ApiError'
    this.kind = kind
    this.status = options.status
  }
}

/** Errors worth an automatic retry: a network failure or a 5xx. A 4xx won't change. */
export function isRetryable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.kind === 'network') return true
  return error.kind === 'http' && (error.status ?? 0) >= 500
}

/** AD-8: the API says the Product doesn't exist (HTTP 404 or 400 for one Product). */
export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'not-found'
}
