// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { findMswArtifacts, isStudioFile } from './mswArtifacts.ts'

const dirs: string[] = []
function makeDist(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'ssc-dist-'))
  dirs.push(dir)
  for (const [name, content] of Object.entries(files)) {
    mkdirSync(join(dir, name, '..'), { recursive: true })
    writeFileSync(join(dir, name), content)
  }
  return dir
}

describe('check:build (AD-10)', () => {
  afterEach(() => {
    for (const dir of dirs.splice(0))
      rmSync(dir, { recursive: true, force: true })
  })

  it('AD-10: passes a clean build', () => {
    const dist = makeDist({
      'index.html': '<div id="root"></div>',
      'assets/index.js': 'console.log(1)',
    })
    expect(findMswArtifacts(dist)).toEqual([])
  })

  it('AD-10: fails when dist/ contains mockServiceWorker.js', () => {
    const dist = makeDist({
      'mockServiceWorker.js': 'self.addEventListener("fetch", () => {})',
    })
    expect(findMswArtifacts(dist)).toEqual([
      'mockServiceWorker.js: MSW worker file must not ship',
    ])
  })

  it('AD-12: ignores Markdown Studio files, which ship beside the shop and name MSW in their text', () => {
    const dist = makeDist({
      'markdown.html':
        '<p>mockServiceWorker.js is never shipped by the shop</p>',
      'markdown/js/app.js': 'const note = "[MSW] docs"',
    })
    expect(findMswArtifacts(dist)).toEqual([])
  })

  it('AD-10: still fails when the shop page itself contains MSW code', () => {
    const dist = makeDist({
      'index.html':
        '<script>navigator.serviceWorker.register("/mockServiceWorker.js")</script>',
      'markdown.html': '<p>docs only</p>',
    })
    expect(findMswArtifacts(dist)).toEqual([
      'index.html: contains MSW code (mockServiceWorker)',
    ])
  })

  it('AD-12: isStudioFile matches only the Studio page and its folder', () => {
    expect(isStudioFile('markdown.html')).toBe(true)
    expect(isStudioFile('markdown/js/app.js')).toBe(true)
    expect(isStudioFile('index.html')).toBe(false)
    expect(isStudioFile('assets/markdown-helper.js')).toBe(false)
  })

  it('AD-10: fails when a bundle contains MSW code', () => {
    const dist = makeDist({
      'assets/chunk.js':
        'navigator.serviceWorker.register("/mockServiceWorker.js")',
    })
    expect(findMswArtifacts(dist)).toEqual([
      'assets/chunk.js: contains MSW code (mockServiceWorker)',
    ])
  })

  it('AD-10: fails when a source map carries MSW logging', () => {
    const dist = makeDist({
      'assets/chunk.js.map':
        '{"sourcesContent":["console.warn(\\"[MSW] x\\")"]}',
    })
    expect(findMswArtifacts(dist)).toEqual([
      'assets/chunk.js.map: contains MSW code ([MSW])',
    ])
  })

  it('AD-10: fails loudly when there is no build output', () => {
    const missing = join(makeDist({}), 'missing')
    expect(() => findMswArtifacts(missing)).toThrow(/Build output not found/)
  })
})
