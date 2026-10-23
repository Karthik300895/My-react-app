const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SUFFIX_LENGTH = 6
const MAX_ATTEMPTS = 100

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** FR28: the local date as YYYYMMDD. */
function datePart(now: Date): string {
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
}

/**
 * AD-15, FR28: `SSC-YYYYMMDD-XXXXXX`, using the local date and 6 uppercase alphanumerics.
 * The clock and randomness are injected so tests can fix them. Never returns a number in
 * `issued`. `random` returns values in [0, 1), as `Math.random` does.
 */
export function createOrderNumber(
  now: Date,
  random: () => number,
  issued: readonly string[],
): string {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let suffix = ''
    for (let i = 0; i < SUFFIX_LENGTH; i++) {
      suffix += ALPHABET[Math.floor(random() * ALPHABET.length)]
    }
    const number = `SSC-${datePart(now)}-${suffix}`
    if (!issued.includes(number)) return number
  }
  throw new Error('Could not create a unique order number')
}
