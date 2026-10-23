// Local Product API for development and the Lighthouse budget run. It serves the dummy data in
// tooling/api-stub/ and generates a labelled image for every product image path, so the app
// needs no internet access. Plain HTTP on port 4500; nothing here ships to production.
// Usage: node tooling/api-stub.mjs   (or `npm run dev:local`, which starts the app as well)
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

export const STUB_PORT = 4500
const origin = `http://localhost:${STUB_PORT}`
const { products, categories } = JSON.parse(
  readFileSync(new URL('./api-stub/fixtures.json', import.meta.url), 'utf8'),
)

// Rewrite the CDN host to this stub, so every image request also stays local.
const local = (value) =>
  JSON.parse(
    JSON.stringify(value).replaceAll(
      'https://cdn.dummyjson.com',
      `${origin}/cdn`,
    ),
  )

const PALETTE = [
  '#0f766e',
  '#7c3aed',
  '#b45309',
  '#be123c',
  '#1d4ed8',
  '#4d7c0f',
]

// Turns a slug such as `essence-mascara-lash-princess` into a title, for the picture's label.
const titleCase = (slug) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

function escapeXml(text) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

// One SVG per image path: the product name on a colour picked from the path.
export function imageFor(path) {
  // Path shape: /product-images/<category>/<slug>/<file>
  const parts = path.split('/').filter(Boolean)
  const slug = parts[parts.length - 2] ?? 'product'
  const file = parts[parts.length - 1] ?? ''
  const shade = [...slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const fill = PALETTE[shade % PALETTE.length]
  const label = escapeXml(titleCase(slug))
  const sub = escapeXml(file.replace(/\.webp$/, ''))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${fill}"/>
  <text x="200" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">${label}</text>
  <text x="200" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#ffffff" opacity="0.85">${sub}</text>
</svg>`
}

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, {
    'content-type': type,
    'access-control-allow-origin': '*',
  })
  res.end(type === 'application/json' ? JSON.stringify(body) : body)
}

export function handle(req, res) {
  const url = new URL(req.url, origin)
  if (url.pathname.startsWith('/cdn/')) {
    return send(
      res,
      200,
      imageFor(url.pathname.slice('/cdn'.length)),
      'image/svg+xml',
    )
  }
  if (url.pathname === '/products/categories') {
    return send(res, 200, local(categories))
  }
  const single = /^\/products\/(\d+)$/.exec(url.pathname)
  if (single) {
    const product = products.find((p) => String(p.id) === single[1])
    return product
      ? send(res, 200, local(product))
      : send(res, 404, { message: 'Not found' })
  }
  if (url.pathname === '/products') {
    const limit = Number(url.searchParams.get('limit') ?? 30)
    const skip = Number(url.searchParams.get('skip') ?? 0)
    const page =
      limit === 0 ? products.slice(skip) : products.slice(skip, skip + limit)
    return send(
      res,
      200,
      local({
        products: page,
        total: products.length,
        skip,
        limit: page.length,
      }),
    )
  }
  send(res, 404, { message: 'Not stubbed' })
}

// Start the server only when run directly, so tests can import the handlers.
if (process.argv[1]?.includes('api-stub')) {
  createServer(handle).listen(STUB_PORT, () =>
    console.log(`Local product API on ${origin}`),
  )
}
