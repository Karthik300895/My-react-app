import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// AD-1: one-way imports (app → pages → features → shared).
// Regexes match relative imports that climb (`../`) straight into a layer or feature folder,
// so package subpaths ('firebase/app') and nested modules ('./icons/cart') are not caught.
const UP = '^(\\.\\./)+'
const UPWARD = {
  pages: {
    regex: `${UP}pages(/|$)`,
    message: 'AD-1: nothing below pages/ may import pages/.',
  },
  app: {
    regex: `${UP}app(/|$)`,
    message: 'AD-1: nothing below app/ may import app/.',
  },
  features: {
    regex: `${UP}features(/|$)`,
    message: 'AD-1: shared/ and mocks/ must not import features/.',
  },
  mocks: {
    regex: `${UP}mocks(/|$)`,
    message: 'AD-1: mocks/ is imported only by app/ and test setup.',
  },
}
const DEEP_FEATURE = {
  regex: `${UP}features/[^/]+/.`,
  message:
    'AD-1: import a feature only through its index.ts (e.g. ../features/cart).',
}
const feature = (name) => ({
  regex: `${UP}(features/)?${name}(/|$)`,
  message: `AD-1: this feature must not import features/${name}.`,
})
const DEEP_CART = {
  regex: `${UP}(features/)?cart/.`,
  message: 'AD-1: checkout imports cart only through its index.ts.',
}

// Each block replaces no-restricted-imports for its files (flat config does not merge rule
// options), so the `files` globs below must never overlap. Every layer yields two disjoint
// blocks: source files get every pattern; test files may also import mocks/ (AD-1 allows
// mocks/ in test setup), so they get the same patterns minus the mocks ban.
const TESTS = '**/*.test.{ts,tsx}'
const rule = (patterns) => ({
  'no-restricted-imports': ['error', { patterns }],
})
const boundaries = (files, patterns) => [
  { files, ignores: [TESTS], rules: rule(patterns) },
  {
    files: files.map((glob) => `${glob}/*.test.{ts,tsx}`),
    rules: rule(patterns.filter((p) => p !== UPWARD.mocks)),
  },
]

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'playwright-report',
    'test-results',
    '_acl-output',
    '_acl',
    'public/markdown*',
    'api',
    '.claude',
    '.cursor',
    // AD-12: holds the frozen Markdown Studio plugin, which cannot be changed to satisfy lint.
    'vite.config.ts',
  ]),
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // AD-5: only the Product API adapter performs HTTP (tests may fetch MSW directly).
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/api/productApi.ts', TESTS],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'AD-5: only src/shared/api/productApi.ts may call fetch.',
        },
      ],
    },
  },
  {
    files: ['tooling/**/*.ts', 'e2e/**/*.ts', '*.config.ts', 'vitest.setup.ts'],
    languageOptions: { globals: globals.node },
  },
  boundaries(
    ['src/shared/**'],
    [UPWARD.features, UPWARD.pages, UPWARD.app, UPWARD.mocks],
  ),
  boundaries(['src/mocks/**'], [UPWARD.features, UPWARD.pages, UPWARD.app]),
  boundaries(
    ['src/features/catalog/**'],
    [
      UPWARD.pages,
      UPWARD.app,
      UPWARD.mocks,
      feature('cart'),
      feature('checkout'),
    ],
  ),
  boundaries(
    ['src/features/cart/**'],
    [
      UPWARD.pages,
      UPWARD.app,
      UPWARD.mocks,
      feature('catalog'),
      feature('checkout'),
    ],
  ),
  boundaries(
    ['src/features/checkout/**'],
    [UPWARD.pages, UPWARD.app, UPWARD.mocks, feature('catalog'), DEEP_CART],
  ),
  boundaries(['src/pages/**'], [UPWARD.app, UPWARD.mocks, DEEP_FEATURE]),
  boundaries(['src/app/**'], [DEEP_FEATURE]),
])
