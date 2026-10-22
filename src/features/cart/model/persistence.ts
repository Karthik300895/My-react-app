import { z } from 'zod'
import { readStorage, writeStorage } from '../../../shared/lib/storage'
import type { CartItem } from '../../../shared/model/cartItem'

// AD-4: the key and envelope version. Bump the version to change the shape.
export const CART_STORAGE_KEY = 'ssc.cart.v1'
const CART_VERSION = 1

const storedItemSchema = z
  .object({
    productId: z.number().int().positive(),
    title: z.string(),
    thumbnail: z.string(),
    unitPriceCents: z.number().int().nonnegative(),
    stock: z.number().int().nonnegative(),
    quantity: z.number().int().positive(),
  })
  .refine((item) => item.quantity <= item.stock, {
    message: 'quantity must not exceed stock',
  })

// AD-4: the envelope is `{ version, items }`. Product ids must be unique (AD-3).
const storedCartSchema = z
  .object({
    version: z.literal(CART_VERSION),
    items: z.array(storedItemSchema),
  })
  .refine(
    ({ items }) =>
      new Set(items.map((item) => item.productId)).size === items.length,
    { message: 'productId must be unique' },
  )

/** Parses a stored Cart. Anything malformed, of another version, or invalid loads empty (FR22). */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (raw === null) return []
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return []
  }
  const parsed = storedCartSchema.safeParse(json)
  return parsed.success ? parsed.data.items : []
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify({ version: CART_VERSION, items })
}

/** FR20: the Cart as it was at the last write, or empty. */
export function loadCart(): CartItem[] {
  return parseStoredCart(readStorage(CART_STORAGE_KEY))
}

/** FR19: writes only the Cart's items (AD-4). */
export function saveCart(items: CartItem[]): void {
  writeStorage(CART_STORAGE_KEY, serializeCart(items))
}
