import { setLocalFallback } from '../shared/api/productApi'

// Development only: when the live Product API is unreachable, the app shows the local dummy data.
// The import sits behind the DEV check, so production builds never include the fixtures (AD-10).
export async function enableLocalFallback(): Promise<void> {
  if (!import.meta.env.DEV) return
  const { localJson } = await import('../mocks/localData')
  setLocalFallback(localJson)
}
