// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const TOKENS_CSS = 'src/index.css'
const DESIGN_MD =
  '_acl-output/planning-artifacts/ux-designs/ux-my-react-app-2026-10-21/DESIGN.md'

const HEX = /(?<![\w&])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/i

function findHexLiterals(text: string): string[] {
  return text.split('\n').filter((line) => HEX.test(line))
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(tsx?|css)$/.test(name) ? [full] : []
  })
}

const frontmatterLines = (() => {
  const md = readFileSync(join(ROOT, DESIGN_MD), 'utf8')
  const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(md)?.[1]
  if (!front) throw new Error(`No frontmatter in ${DESIGN_MD}`)
  return front.split(/\r?\n/)
})()

/** Lines of one top-level frontmatter map in DESIGN.md (e.g. `colors:`). */
function sectionLines(section: string): string[] {
  const start = frontmatterLines.indexOf(`${section}:`)
  if (start === -1) throw new Error(`DESIGN.md has no ${section}: section`)
  const rest = frontmatterLines.slice(start + 1)
  const end = rest.findIndex((line) => /^\S/.test(line))
  return end === -1 ? rest : rest.slice(0, end)
}

/** A flat DESIGN.md map (colors, rounded, spacing) as key → raw value. */
function designSection(section: string): Map<string, string> {
  const entries = new Map<string, string>()
  for (const line of sectionLines(section)) {
    const match = /^ {2}([\w-]+):\s*(.+)$/.exec(line)
    if (match) entries.set(match[1], match[2].replace(/^'|'$/g, ''))
  }
  return entries
}

/** Typography roles with their nested fontSize (e.g. display → 32px). */
function designFontSizes(): Map<string, string> {
  const sizes = new Map<string, string>()
  let role = ''
  for (const line of sectionLines('typography')) {
    role = /^ {2}([\w-]+):\s*$/.exec(line)?.[1] ?? role
    const size = /^ {4}fontSize:\s*(\S+)/.exec(line)?.[1]
    if (size) sizes.set(role, size)
  }
  return sizes
}

const css = readFileSync(join(ROOT, TOKENS_CSS), 'utf8')
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const declares = (name: string, value?: string) =>
  new RegExp(`--${name}:\\s*${value ? escape(value) : '[^;]+'};`, 'i').test(css)

describe('UX-DR1 design tokens', () => {
  it('UX-DR1: declares every DESIGN.md colour with its value', () => {
    const colors = designSection('colors')
    expect(colors.size).toBe(20)
    for (const [name, hex] of colors)
      expect(declares(`color-${name}`, hex), name).toBe(true)
  })

  it('UX-DR1: declares every typography role, radius and named spacing with its value', () => {
    const fontSizes = designFontSizes()
    const rounded = designSection('rounded')
    const spacing = designSection('spacing')
    expect([fontSizes.size, rounded.size, spacing.size]).toEqual([11, 4, 9])
    for (const [role, size] of fontSizes)
      expect(declares(`text-${role}`, size), role).toBe(true)
    for (const [name, value] of rounded)
      expect(declares(`radius-${name}`, value), name).toBe(true)
    for (const [name, value] of spacing)
      expect(declares(`spacing-${name}`, value), name).toBe(true)
  })

  it('UX-DR1: declares the implementation tokens', () => {
    for (const name of [
      'shadow-card-hover',
      'shadow-float',
      'overlay-opacity',
      'oos-image-filter',
      'motion-fast',
      'motion-pop',
      'motion-shimmer',
    ])
      expect(declares(name), name).toBe(true)
  })

  it('UX-DR2: keeps Tailwind default breakpoints', () => {
    expect(css).not.toMatch(/--breakpoint-/)
  })
})

describe('UX-DR1 no hard-coded colours', () => {
  it('UX-DR1: the detector flags a hex literal in a component (failing fixture)', () => {
    expect(findHexLiterals('<p style={{ color: "#0F766E" }} />')).toHaveLength(
      1,
    )
    expect(findHexLiterals('<a href="#main">Skip</a> &#8226;')).toEqual([])
  })

  it('UX-DR1: no file under src/ except src/index.css contains a hex colour', () => {
    const offenders = sourceFiles(join(ROOT, 'src'))
      .map((file) => relative(ROOT, file).replaceAll('\\', '/'))
      .filter((file) => file !== TOKENS_CSS)
      .filter(
        (file) =>
          findHexLiterals(readFileSync(join(ROOT, file), 'utf8')).length > 0,
      )
    expect(offenders).toEqual([])
  })
})
