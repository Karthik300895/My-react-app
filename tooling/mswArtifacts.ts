// AD-10: detects MSW in a production build. Used by tooling/check-build.ts.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const WORKER_FILENAME = 'mockServiceWorker.js'

// `mockServiceWorker` is the worker URL that msw/browser always embeds (verified against a
// development build that bundles it); `[MSW]` prefixes msw's console messages.
export const MSW_MARKERS = ['mockServiceWorker', '[MSW]']

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? listFiles(full) : [full]
  })
}

export function findMswArtifacts(distDir: string): string[] {
  if (!existsSync(distDir) || !statSync(distDir).isDirectory())
    throw new Error(`Build output not found: ${distDir}`)

  const problems: string[] = []
  for (const file of listFiles(distDir)) {
    const rel = relative(distDir, file).replaceAll('\\', '/')
    if (file.endsWith(WORKER_FILENAME)) {
      problems.push(`${rel}: MSW worker file must not ship`)
      continue
    }
    if (!/\.(js|mjs|cjs|html|map)$/.test(file)) continue
    const text = readFileSync(file, 'utf8')
    const marker = MSW_MARKERS.find((m) => text.includes(m))
    if (marker) problems.push(`${rel}: contains MSW code (${marker})`)
  }
  return problems
}
