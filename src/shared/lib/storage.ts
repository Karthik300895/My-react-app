// AD-4: the only module that touches localStorage. Storage can throw (blocked storage,
// private browsing, quota), so every call is guarded and the app keeps working without it.

/** The stored string for `key`, or `null` when it is missing or storage throws. */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

/** Stores `value` under `key`. A failure is silent: the Cart still works for the session. */
export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Blocked or full storage: nothing to persist to, and nothing to report.
  }
}
