// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  checkTrace,
  parseEpicStories,
  parsePrdFrs,
  parseTestFrs,
} from './traceRules.ts'

describe('trace rules (Story 4.4)', () => {
  it('NFR10: reads FR-1 to FR-35 from the PRD headings', () => {
    const prd =
      '#### FR-1: View\n\ntext\n#### FR-2: Search\n#### FR-35: Boundary'
    expect(parsePrdFrs(prd)).toEqual([1, 2, 35])
  })

  it('NFR10: a test title counts for its FR in both the `FR4:` and `FR-4:` forms', () => {
    const source = [
      "  it('FR4: sorts by price', () => {})",
      "  it('FR-5: combines criteria', () => {})",
    ].join('\n')
    expect(parseTestFrs(source)).toEqual([4, 5])
  })

  it('NFR10: a describe title does not count, but an it.each title line does', () => {
    const source = [
      "describe('Search (FR2–FR6)', () => {",
      '  it.each([[1]])(',
      "    'FR30: %s renders its page',",
      '    () => {},',
      '  )',
      '})',
    ].join('\n')
    expect(parseTestFrs(source)).toEqual([30])
  })

  it('NFR10: an e2e title names every FR it cites, by journey', () => {
    const source =
      "test('UJ-3 FR25–FR28: checkout places one Order', async () => {})"
    expect(parseTestFrs(source)).toEqual([25, 28])
  })

  it('NFR10: a story lists the FRs and NFRs in its body, up to the next heading', () => {
    const epics = [
      '### Story 1.1: One',
      'Covers FR1 and FR-2, with NFR1.',
      '## Epic 2',
      '### Story 2.1: Two',
      'Mentions FR9 only.',
    ].join('\n')
    const stories = parseEpicStories(epics)
    expect(stories).toEqual([
      { id: '1.1', frs: [1, 2], nfrs: ['NFR1'], adUxdrs: [] },
      { id: '2.1', frs: [9], nfrs: [], adUxdrs: [] },
    ])
  })

  it('NFR8: fails when an FR has no test, and names the FR', () => {
    const result = checkTrace({
      frs: [1, 2],
      testFiles: [{ path: 'src/a.test.ts', frs: [1] }],
      stories: [{ id: '1.1', frs: [1, 2], nfrs: [], adUxdrs: [] }],
    })
    expect(result.failures).toEqual(['FR-2 has no test'])
  })

  it('NFR8, SM-3: an FR in FR-10 to FR-29 needs a unit, component or app test under src/', () => {
    const result = checkTrace({
      frs: [12],
      testFiles: [{ path: 'e2e/uj-2.spec.ts', frs: [12] }],
      stories: [{ id: '2.1', frs: [12], nfrs: [], adUxdrs: [] }],
    })
    expect(result.failures).toEqual([
      'FR-12 has no automated unit, component or app test under src/',
    ])
  })

  it('NFR8: an FR outside FR-10 to FR-29 may be covered by an e2e spec alone', () => {
    const result = checkTrace({
      frs: [31],
      testFiles: [{ path: 'e2e/home.spec.ts', frs: [31] }],
      stories: [{ id: '3.1', frs: [31], nfrs: [], adUxdrs: [] }],
    })
    expect(result.failures).toEqual([])
  })

  it('NFR10: a story that cites only an AD or UX-DR is still traced', () => {
    const result = checkTrace({
      frs: [],
      testFiles: [],
      stories: [{ id: '1.1', frs: [], nfrs: [], adUxdrs: ['AD-1'] }],
    })
    expect(result.failures).toEqual([])
  })

  it('NFR10: a story naming no FR, NFR, AD or UX-DR fails', () => {
    const result = checkTrace({
      frs: [],
      testFiles: [],
      stories: [{ id: '9.9', frs: [], nfrs: [], adUxdrs: [] }],
    })
    expect(result.failures).toEqual(['Story 9.9 names no FR, NFR, AD or UX-DR'])
  })

  it('NFR10: fails when an FR is covered by no story', () => {
    const result = checkTrace({
      frs: [7],
      testFiles: [{ path: 'src/b.test.ts', frs: [7] }],
      stories: [{ id: '1.1', frs: [], nfrs: ['NFR1'], adUxdrs: [] }],
    })
    // Story 1.1 names an NFR, so it passes; only the uncovered FR is reported.
    expect(result.failures).toEqual(['FR-7 is covered by no story'])
  })

  it('NFR10: passes a fully traced set and reports the matrix', () => {
    const result = checkTrace({
      frs: [1],
      testFiles: [{ path: 'src/a.test.ts', frs: [1] }],
      stories: [{ id: '1.1', frs: [1], nfrs: [], adUxdrs: [] }],
    })
    expect(result.failures).toEqual([])
    expect(result.matrix).toEqual([{ fr: 1, files: ['src/a.test.ts'] }])
  })
})
