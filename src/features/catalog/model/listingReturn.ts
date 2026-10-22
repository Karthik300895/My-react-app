// FR7: "Back to products" returns to the listing URL the Shopper came from. The URL rides
// in the history entry's state (AD-7: criteria still live only in URLs).

const LISTING_PATH = '/products'

export type ListingReturnState = { listingUrl: string }

/** State for a link to Product Details: set only when the link is on the listing. */
export function listingReturnState(location: {
  pathname: string
  search: string
}): ListingReturnState | undefined {
  // The router also matches `/products/` here; store the canonical path.
  if (location.pathname.replace(/\/+$/, '') !== LISTING_PATH) return undefined
  return { listingUrl: `${LISTING_PATH}${location.search}` }
}

/** The listing URL stored by the card link, or `null`. History state is untrusted input. */
export function readListingReturn(state: unknown): string | null {
  if (typeof state !== 'object' || state === null) return null
  const { listingUrl } = state as Partial<ListingReturnState>
  if (typeof listingUrl !== 'string') return null
  return /^\/products(?:\?[^#]*)?$/.test(listingUrl) ? listingUrl : null
}
