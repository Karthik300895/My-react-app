// Story 4.4: the trace rules, kept free of file-system access so they can be tested with fixtures.
// Only erasable TypeScript syntax, so Node type stripping can run this file (Node >= 22.18).

export type TestFile = { path: string; frs: number[] }

// `adUxdrs` are the architecture (AD-n) and UX (UX-DR-n) ids a story cites. They count as
// traceability alongside FRs and NFRs (Story 4.4 rule change, approved by the Manager).
export type EpicStory = {
  id: string
  frs: number[]
  nfrs: string[]
  adUxdrs: string[]
}

export type TraceInput = {
  frs: number[]
  testFiles: TestFile[]
  stories: EpicStory[]
}

export type MatrixRow = { fr: number; files: string[] }

export type TraceResult = { matrix: MatrixRow[]; failures: string[] }

// NFR8, SM-3: these FRs must have an automated test under src/ (unit, component or app),
// not only an e2e spec.
const UNIT_REQUIRED_FRS = new Set(range(10, 29))

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

// The PRD defines each FR as a heading: `#### FR-12: Title`.
export function parsePrdFrs(prdText: string): number[] {
  const found = [...prdText.matchAll(/^#### FR-(\d+):/gm)].map((m) =>
    Number(m[1]),
  )
  return [...new Set(found)].sort((a, b) => a - b)
}

// Test titles carry FR ids in two forms, `FR4:` and `FR-4:` (Stories 1.x to 4.3).
const FR_ID = /\bFR-?(\d+)\b/g

// A title is a line that starts a test (`it(`, `test(`), or a quoted string that starts with a
// title and contains an FR id (the title line of an `it.each` table).
function isTitleLine(line: string): boolean {
  return (
    /^\s*(it|test)[.(]/.test(line) ||
    /^\s*\(?\s*['"`][^'"`]*\bFR-?\d+\b/.test(line)
  )
}

// The FR ids named by a test file's test titles. `describe` titles are not counted.
export function parseTestFrs(source: string): number[] {
  const found = new Set<number>()
  for (const line of source.split('\n')) {
    if (!isTitleLine(line)) continue
    for (const m of line.matchAll(FR_ID)) found.add(Number(m[1]))
  }
  return [...found].sort((a, b) => a - b)
}

// The epics name each story as `### Story 2.3: Title`. A story's FRs and NFRs are the ids
// mentioned in its body, up to the next heading.
export function parseEpicStories(epicsText: string): EpicStory[] {
  const parts = epicsText
    .split(/^(?=### Story \d+\.\d+:)/m)
    .filter((part) => /^### Story /.test(part))
  return parts.map((part) => {
    const id = /^### Story (\d+\.\d+):/.exec(part)?.[1] ?? '?'
    // Skip the heading line, then stop at the next heading.
    const [, ...rest] = part.split('\n')
    const body = rest.join('\n').split(/^(?=## |### )/m)[0]
    const frs = [...new Set([...body.matchAll(FR_ID)].map((m) => Number(m[1])))]
    const nfrs = [...new Set(body.match(/\bNFR-?\d+\b/g) ?? [])]
    const adUxdrs = [...new Set(body.match(/\b(?:AD-\d+|UX-DR\d+)\b/g) ?? [])]
    return { id, frs: frs.sort((a, b) => a - b), nfrs, adUxdrs }
  })
}

export function checkTrace(input: TraceInput): TraceResult {
  const failures: string[] = []
  const matrix: MatrixRow[] = input.frs.map((fr) => {
    const files = input.testFiles
      .filter((file) => file.frs.includes(fr))
      .map((file) => file.path)
    return { fr, files }
  })

  for (const row of matrix) {
    if (row.files.length === 0) {
      failures.push(`FR-${row.fr} has no test`)
    } else if (
      UNIT_REQUIRED_FRS.has(row.fr) &&
      !row.files.some((file) => file.startsWith('src/'))
    ) {
      failures.push(
        `FR-${row.fr} has no automated unit, component or app test under src/`,
      )
    }
  }

  const covered = new Set(input.stories.flatMap((story) => story.frs))
  for (const fr of input.frs) {
    if (!covered.has(fr)) failures.push(`FR-${fr} is covered by no story`)
  }
  for (const story of input.stories) {
    if (
      story.frs.length === 0 &&
      story.nfrs.length === 0 &&
      story.adUxdrs.length === 0
    ) {
      failures.push(`Story ${story.id} names no FR, NFR, AD or UX-DR`)
    }
  }

  return { matrix, failures }
}
