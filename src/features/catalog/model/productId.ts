import { z } from 'zod'

// AD-8: `:productId` must be a positive integer in canonical form ("7", not "07" or "7.0").
// Anything else is "Product not found" without a request.
const productIdSchema = z
  .string()
  .regex(/^[1-9]\d{0,8}$/)
  .transform(Number)

export function parseProductId(raw: string | undefined): number | null {
  const parsed = productIdSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}
