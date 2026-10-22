// AD-10: manual contract check of the live Product API against the same DTO schemas the
// adapter and the MSW fixtures use. Run with `npm run contract:live`; it is not part of CI.
import {
  CATALOG_SELECT,
  catalogResponseDtoSchema,
  PRODUCT_API_ORIGIN,
  PRODUCT_SELECT,
  productDetailsDtoSchema,
} from '../src/shared/api/dto.ts'

const url = `${PRODUCT_API_ORIGIN}/products?limit=0&select=${CATALOG_SELECT.join(',')}`

async function main(): Promise<number> {
  console.log(`contract:live → GET ${url}`)
  let response: Response
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
  } catch (error) {
    const cause = (error as { cause?: { message?: string } }).cause?.message
    console.error(
      `✗ Could not reach the Product API: ${cause ?? String(error)}`,
    )
    return 2
  }
  if (!response.ok) {
    console.error(`✗ HTTP ${response.status}`)
    return 1
  }

  let json: unknown
  try {
    json = await response.json()
  } catch {
    console.error('✗ The response is not JSON')
    return 1
  }
  const parsed = catalogResponseDtoSchema.safeParse(json)
  if (!parsed.success) {
    console.error('✗ The response does not match the DTO schemas:')
    for (const issue of parsed.error.issues.slice(0, 10))
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    return 1
  }

  const { products, total } = parsed.data
  if (products.length !== total) {
    console.error(`✗ Incomplete catalog: ${products.length} of ${total}`)
    return 1
  }
  const outOfStock = products.filter((p) => p.stock === 0).length
  console.log(
    `✓ ${total} products match the DTO schemas (${outOfStock} out of stock).`,
  )
  return checkProduct(products[0]?.id)
}

/** FR7: one Product's details record matches the details schema. */
async function checkProduct(id: number | undefined): Promise<number> {
  if (id === undefined) {
    console.error('✗ The catalog is empty, so no Product to check')
    return 1
  }
  const productUrl = `${PRODUCT_API_ORIGIN}/products/${id}?select=${PRODUCT_SELECT.join(',')}`
  console.log(`contract:live → GET ${productUrl}`)
  try {
    const response = await fetch(productUrl, {
      signal: AbortSignal.timeout(30_000),
    })
    if (!response.ok) {
      console.error(`✗ HTTP ${response.status}`)
      return 1
    }
    let json: unknown
    try {
      json = await response.json()
    } catch {
      console.error(`✗ Product ${id}: the response is not JSON`)
      return 1
    }
    const parsed = productDetailsDtoSchema.safeParse(json)
    if (!parsed.success) {
      console.error(`✗ Product ${id} does not match the details schema:`)
      for (const issue of parsed.error.issues.slice(0, 10))
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
      return 1
    }
    if (parsed.data.id !== id) {
      console.error(`✗ Requested Product ${id}, received ${parsed.data.id}`)
      return 1
    }
    console.log(
      `✓ Product ${id} matches the details schema (${parsed.data.images.length} images).`,
    )
    return 0
  } catch (error) {
    console.error(`✗ Could not check Product ${id}: ${String(error)}`)
    return 2
  }
}

process.exitCode = await main()
