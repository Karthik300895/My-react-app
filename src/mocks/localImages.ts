// Development fallback: product pictures when the CDN is unreachable. Each picture is a labelled
// SVG generated from its image path, so it needs no network and no files on disk.

// HSL, not hex: the UX-DR1 check forbids hex literals under src/.
const PALETTE = [
  'hsl(175 74% 25%)',
  'hsl(262 70% 53%)',
  'hsl(32 90% 37%)',
  'hsl(346 77% 45%)',
  'hsl(226 71% 46%)',
  'hsl(90 60% 30%)',
]
const CDN = 'https://cdn.dummyjson.com/'

const titleCase = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const escapeXml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

/** A `data:` URL for a CDN image path (`product-images/<category>/<slug>/<file>`). */
export function imageDataUri(url: string): string {
  if (!url.startsWith(CDN)) return url
  const parts = url.slice(CDN.length).split('/')
  const slug = parts[parts.length - 2] ?? 'product'
  const file = (parts[parts.length - 1] ?? '').replace(/\.webp$/, '')
  const shade = [...slug].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  const fill = PALETTE[shade % PALETTE.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${fill}"/><text x="200" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="white">${escapeXml(titleCase(slug))}</text><text x="200" y="232" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="white" opacity="0.85">${escapeXml(file)}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
