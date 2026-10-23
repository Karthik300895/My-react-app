// Story 4.4 (NFR8, NFR10, SM-3): the FR ↔ story ↔ test trace.
// Usage: node tooling/trace.ts   (Node >= 22.18 runs .ts via type stripping)
// The parsing lives in traceRules.ts so the rules can be tested without touching the disk.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  checkTrace,
  parseEpicStories,
  parsePrdFrs,
  parseTestFrs,
  type TestFile,
} from './traceRules.ts'

const root = process.cwd()
const EPICS = '_acl-output/planning-artifacts/epics.md'

const TEST_FILE = /\.(test|spec)\.(ts|tsx)$/
const SCAN_DIRS = ['src', 'e2e']

function walk(dir: string, out: string[]): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (TEST_FILE.test(name)) out.push(path)
  }
  return out
}

// Locate the PRD by its path under planning-artifacts, so the check does not hard-code a slug.
function findPrd(): string {
  const base = join(root, '_acl-output/planning-artifacts/prds')
  for (const dir of readdirSync(base)) {
    const candidate = join(base, dir, 'prd.md')
    try {
      statSync(candidate)
      return candidate
    } catch {
      // Keep looking.
    }
  }
  throw new Error(`No prd.md under ${base}`)
}

const prdText = readFileSync(findPrd(), 'utf8')
const epicsText = readFileSync(join(root, EPICS), 'utf8')

const testFiles: TestFile[] = SCAN_DIRS.flatMap((dir) => {
  try {
    return walk(join(root, dir), [])
  } catch {
    return []
  }
}).map((path) => ({
  path: relative(root, path).replaceAll('\\', '/'),
  frs: parseTestFrs(readFileSync(path, 'utf8')),
}))

const result = checkTrace({
  frs: parsePrdFrs(prdText),
  testFiles,
  stories: parseEpicStories(epicsText),
})

console.log('FR      TEST FILES')
for (const row of result.matrix) {
  const files = row.files.length > 0 ? row.files.join(', ') : '(none)'
  console.log(`FR-${String(row.fr).padEnd(4)}  ${files}`)
}

if (result.failures.length > 0) {
  console.error('\ntrace failed:')
  for (const failure of result.failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(`\ntrace passed: ${result.matrix.length} FRs covered`)
