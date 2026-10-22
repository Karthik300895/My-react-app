// @vitest-environment node
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

// AD-1: deliberately failing fixtures prove each no-restricted-imports boundary.
const eslint = new ESLint({
  cwd: fileURLToPath(new URL('..', import.meta.url)),
})

async function restrictedImports(
  filePath: string,
  code: string,
): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath })
  return result.messages
    .filter((m) => m.ruleId === 'no-restricted-imports')
    .map((m) => m.message)
}

const blocked: Array<[string, string, string]> = [
  [
    'deep import into a feature',
    'src/pages/Fixture.ts',
    "import { x } from '../features/catalog/ui/ProductCard'",
  ],
  [
    'cart → catalog',
    'src/features/cart/model/fixture.ts',
    "import { x } from '../../catalog'",
  ],
  [
    'catalog → cart',
    'src/features/catalog/ui/fixture.ts',
    "import { x } from '../../cart'",
  ],
  [
    'checkout → cart internals',
    'src/features/checkout/model/fixture.ts',
    "import { x } from '../../cart/model/cartSlice'",
  ],
  [
    'shared → features',
    'src/shared/ui/fixture.ts',
    "import { x } from '../../features/cart'",
  ],
  [
    'shared → pages',
    'src/shared/lib/fixture.ts',
    "import { x } from '../../pages/HomePage'",
  ],
  [
    'shared → app',
    'src/shared/api/fixture.ts',
    "import { x } from '../../app/router'",
  ],
  [
    'shared → mocks',
    'src/shared/model/fixture.ts',
    "import { x } from '../../mocks/handlers'",
  ],
  [
    'features → pages',
    'src/features/catalog/ui/fixture2.ts',
    "import { x } from '../../../pages/HomePage'",
  ],
  [
    'pages → mocks',
    'src/pages/Fixture2.ts',
    "import { x } from '../mocks/handlers'",
  ],
  [
    'catalog → checkout',
    'src/features/catalog/model/fixture.ts',
    "import { x } from '../../checkout'",
  ],
  [
    'cart → checkout',
    'src/features/cart/model/fixture.ts',
    "import { x } from '../../checkout'",
  ],
  [
    'checkout → catalog',
    'src/features/checkout/ui/fixture.ts',
    "import { x } from '../../catalog'",
  ],
  [
    'features → app',
    'src/features/cart/ui/fixture.ts',
    "import { x } from '../../../app/router'",
  ],
  [
    'features → mocks',
    'src/features/checkout/model/fixture.ts',
    "import { x } from '../../../mocks/handlers'",
  ],
  [
    'mocks → features',
    'src/mocks/fixture.ts',
    "import { x } from '../features/catalog'",
  ],
  [
    'mocks → pages',
    'src/mocks/fixture.ts',
    "import { x } from '../pages/HomePage'",
  ],
  ['mocks → app', 'src/mocks/fixture.ts', "import { x } from '../app/router'"],
  ['pages → app', 'src/pages/Fixture.ts', "import { x } from '../app/router'"],
  [
    'app deep import into a feature',
    'src/app/fixture.ts',
    "import { x } from '../features/cart/model/cartSlice'",
  ],
  [
    'test file: shared → features is still blocked',
    'src/shared/ui/fixture.test.ts',
    "import { x } from '../../features/cart'",
  ],
  [
    'test file: catalog → cart is still blocked',
    'src/features/catalog/ui/fixture.test.tsx',
    "import { x } from '../../cart'",
  ],
]

const allowed: Array<[string, string, string]> = [
  [
    'checkout → cart public API',
    'src/features/checkout/model/fixture.ts',
    "import { x } from '../../cart'",
  ],
  [
    'page → feature index',
    'src/pages/Fixture.ts',
    "import { x } from '../features/catalog'",
  ],
  [
    'feature → shared',
    'src/features/cart/model/fixture.ts',
    "import { x } from '../../../shared/model/availability'",
  ],
  [
    'feature-internal import',
    'src/features/cart/ui/fixture.ts',
    "import { x } from '../model/cartSlice'",
  ],
  [
    'app → mocks (dev bootstrap)',
    'src/app/fixture.ts',
    "import { x } from '../mocks/browser'",
  ],
  [
    'package subpath named like a layer',
    'src/shared/lib/fixture.ts',
    "import { x } from 'firebase/app'",
  ],
  [
    'shared-internal module named like a feature',
    'src/features/catalog/ui/fixture.ts',
    "import { x } from '../../../shared/ui/icons/cart'",
  ],
  [
    'test file: shared → mocks (test setup)',
    'src/shared/api/fixture.test.ts',
    "import { x } from '../../mocks/handlers'",
  ],
]

describe('AD-1 import boundaries', () => {
  it.each(blocked)(
    'AD-1: lint fails for %s',
    async (_label, filePath, code) => {
      expect(
        await restrictedImports(filePath, `${code}\nexport { x }\n`),
      ).not.toEqual([])
    },
  )

  it.each(allowed)('AD-1: lint allows %s', async (_label, filePath, code) => {
    expect(
      await restrictedImports(filePath, `${code}\nexport { x }\n`),
    ).toEqual([])
  })
})

describe('AD-5 fetch boundary', () => {
  const restrictedFetch = async (filePath: string) => {
    const [result] = await eslint.lintText('void fetch("https://x.test")', {
      filePath,
    })
    return result.messages.filter((m) => m.ruleId === 'no-restricted-globals')
  }

  it('AD-5: fetch outside the Product API adapter fails lint', async () => {
    expect(
      await restrictedFetch('src/features/cart/model/fixture.ts'),
    ).not.toEqual([])
    expect(await restrictedFetch('src/pages/Fixture.ts')).not.toEqual([])
  })

  it('AD-5: the adapter and test files may call fetch', async () => {
    expect(await restrictedFetch('src/shared/api/productApi.ts')).toEqual([])
    expect(await restrictedFetch('src/mocks/fixture.test.ts')).toEqual([])
  })
})
