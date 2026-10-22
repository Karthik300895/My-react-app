---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T16:03:23.319Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 1.1: Set Up the Store Foundation'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-21'
story_key: 1-1-set-up-the-store-foundation
review_loop_iteration: 0
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/4-implementation/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The repo is a bare Vite 8 + React 19 + TS 6.0.3 demo scaffold. It has no shop stack, no AD-1 folder layout, no design tokens and no quality gates, and it shares `vite.config.ts` with Markdown Studio.

**Approach:** Extend the scaffold in place. Install the pinned stack, scaffold `src/` per AD-1 with enforced import boundaries, declare every DESIGN.md token in a Tailwind v4 `@theme`, wire `npm run quality` plus CI, and add a dev-only MSW bootstrap that can never ship. Markdown Studio must keep working unchanged.

## Boundaries & Constraints

**Always:** Pin exact versions for the stack the AC lists. Import only from `react-router`/`react-router/dom`. Leave Tailwind's default breakpoints unchanged. Cite AD ids at enforcement points.

**Ask First:** Any edit inside the `acl-markdown-saver` plugin (lines 1–658 of `vite.config.ts`). Any change to a protected path. Bumping TypeScript past 6.0.3.

**Never:** Add `react-router-dom`. Put `mockServiceWorker.js` in `public/`. Edit `netlify.toml`, `vercel.json`, `api/`, `public/markdown.html` or `public/markdown/`. Build Story 1.2+ features (router, shell, pages).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Deep feature import | `pages/X.tsx` imports `../features/catalog/ui/Y` | `eslint` reports `no-restricted-imports` | Lint fails |
| Cross-feature | `features/cart/*` imports `../../catalog` | Lint error | Lint fails |
| Shared upward import | `shared/ui/X.tsx` imports `../../features/cart` | Lint error | Lint fails |
| Allowed import | `features/checkout/*` imports `../../cart` | No error | N/A |
| Hex in component | `src/**/*.tsx` contains `#0F766E` | Hex-literal test fails | Test fails |
| MSW in build | `dist/` contains `mockServiceWorker.js` or MSW code | `check:build` exits 1 | Build fails |
| Mock off | `npm run dev` without `VITE_API_MOCK` | No worker registered | N/A |

</frozen-after-approval>

## Code Map

- `vite.config.ts` -- lines 1–658 are the Studio plugin (frozen, SHA-256 `194662ea…0369`). It already fails `tsc` (15 errors) and `eslint` (19 errors), so it is excluded from tsc, ESLint and Prettier. Only the `plugins` array is appended to.
- `tsconfig.node.json` -- `include` currently lists `vite.config.ts` → replace it with the tooling and config files.
- `eslint.config.js` -- existing flat config → add ignores and AD-1 boundaries.
- `src/main.tsx`, `src/App.tsx`, `src/App.css`, `src/index.css`, `src/assets/*` -- Vite demo content (hex literals, `#root` width hack) → replace.
- `index.html` -- entry `/src/main.tsx` → `/src/app/main.tsx`, title "Simple Shopping Cart".
- DESIGN.md frontmatter -- the source of the token names and values for `@theme`.
- Installed versions vite 8.3.5 and typescript-eslint 8.72.0 already satisfy their ranges → leave existing deps alone.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- pin the stack exactly, plus `@vitest/coverage-v8@5.0.5` (needed for `--coverage`); `engines.node >=22.22.2`; scripts `quality`, `test`, `format`, `check:build` (chained into `build`), `test:e2e` -- AC 1, 5, 6
- [x] `.nvmrc` -- `22.22.2`
- [x] `.npmrc` -- `legacy-peer-deps=true` (see Spec Change Log #1)
- [x] `src/{app,pages,features/{catalog,cart,checkout},shared/{api,model,ui,lib},mocks}`, `e2e/` -- create them; each feature gets an `index.ts` public API; `app/main.tsx` and `app/App.tsx` hold a placeholder page -- AD-1
- [x] `eslint.config.js` -- ignores, plus per-layer `no-restricted-imports` patterns -- AD-1
- [x] `src/index.css` -- `@import "tailwindcss"`, a full `@theme` (DESIGN.md names), base focus ring and reduced motion -- UX-DR1/2
- [x] `vite.config.ts`, `tooling/shopPlugins.ts` -- append `...shopPlugins()` (`tailwindcss()` + `{ ...msw({ mode: 'worker-only' }), apply: 'serve' }`) to `plugins`; the plugin list is in `tooling/` so it is type-checked and linted (see Spec Change Log #2) -- AD-12, AD-10
- [x] `src/app/enableMocking.ts`, `src/mocks/{handlers,browser,node}.ts`, `vitest.setup.ts` -- an empty handler list (fixtures land in 1.3), the dev worker with `onUnhandledFrame: 'bypass'` (see Spec Change Log #3), and the test server
- [x] `vitest.config.ts` -- jsdom, setup file, v8 coverage with 80% statement/branch thresholds on `src/features/{cart,checkout}/**`
- [x] `tooling/check-build.ts`, `tooling/mswArtifacts.ts` -- fail if `dist/` holds the worker file or MSW markers (CLI runs unconditionally via Node type stripping; logic is unit-tested)
- [x] `tooling/*.test.ts`, `src/app/*.test.ts(x)` -- an ESLint boundary test (failing fixtures via `lintText`), a hex-literal scan of `src/`, a token parity test (DESIGN.md ↔ `@theme`), build-check tests and `enableMocking` tests
- [x] `.prettierrc.json`, `.prettierignore` -- the required ignores plus `vite.config.ts` and agent folders
- [x] `.github/workflows/quality.yml` -- push + PR: `npm ci`, `npm run quality`, then `npm run build` (enforces `check:build` in CI)

**Acceptance Criteria:**
- Given the scaffold, when `npm run quality` runs, then `tsc -b`, `eslint .`, `prettier --check .` and `vitest run --coverage` all pass.
- Given `npm run dev`, when `/markdown.html` and `/api/list-markdown-files` are requested, then both return 200 with the same payloads as the pre-change baseline, and the plugin hash is unchanged.
- Given `VITE_API_MOCK=true npm run dev`, then `/mockServiceWorker.js` is served and the worker starts. Given `npm run build`, then `check:build` passes and `dist/` has no MSW.

## Spec Change Log

1. **Finding:** `@hookform/resolvers@6.0.0` declares conflicting optional peers (`effect@^4`, and `@typeschema/main`, which pulls in `effect@^3`), so a strict `npm install` fails with ERESOLVE, and a lockfile made with `--legacy-peer-deps` fails `npm ci`. **Amended:** added a project `.npmrc` with `legacy-peer-deps=true`. **Avoids:** CI `npm ci` failing on an unused optional peer. **KEEP:** this is verified by a clean `npm ci` from the lockfile.
2. **Finding:** msw 3.0.3 ships an official `msw/vite` plugin, but its `worker-only` mode always emits `mockServiceWorker.js` into `dist/`. **Amended:** use the official plugin wrapped with `apply: 'serve'` instead of a custom `tooling/vite-msw-dev-worker.ts`. **Avoids:** shipping the worker (AD-10). **KEEP:** the `apply: 'serve'` wrapper.
3. **Finding:** msw 3 renamed `onUnhandledRequest` to `onUnhandledFrame` (same `'bypass' | 'warn' | 'error'` values). **Amended:** the dev worker uses `onUnhandledFrame: 'bypass'`, and tests use `'error'`. **Avoids:** a type error and a silently ignored option.
4. **Finding:** `vitest.setup.ts` imports `src/mocks`, which uses bundler resolution. **Amended:** it is type-checked by `tsconfig.app.json`, not `tsconfig.node.json`. The check script is `.ts` (Node ≥ 22.18 type stripping), not `.mjs`, so it is tested and type-checked.

## Design Notes

- **Why `vite.config.ts` is excluded from the gates:** AD-12 freezes the plugin bytes, and those bytes fail the gates today. Excluding the file is the only way to satisfy both rules. The appended lines only spread `shopPlugins()` from `tooling/shopPlugins.ts`, which is type-checked and linted.
- **Boundary patterns** match relative import strings, e.g. in `src/pages/**` the pattern `**/features/*/*` blocks deep imports. Fixtures in the lint test prove each rule.
- **Token naming** uses Tailwind v4 namespaces: `--color-<name>`, `--text-<role>` (with `--line-height`, `--font-weight` and `--letter-spacing` sub-vars), `--radius-*`, `--spacing-<name>` (which also drives `max-w-content-max`), `--shadow-card-hover`/`float`; the remaining implementation vars keep their DESIGN.md names.

## Verification

**Commands:**
- `npm run quality` -- exit 0
- `npm run build` -- exit 0 (includes `check:build`)
- `npx eslint` on a temporary deep-import file -- exit 1

**Manual checks:**
- With the dev server running, compare `/markdown.html` and `/api/list-markdown-files` against the baseline, and confirm the protected files' SHA-256 hashes are unchanged.

## Suggested Review Order

**Coexisting with Markdown Studio (AD-12)**

- Entry point: the frozen plugin is untouched; the shop only spreads its own plugins.
  [`vite.config.ts:667`](../../vite.config.ts#L667)

- The shop's plugin list lives here so it is type-checked; `apply: 'serve'` keeps the worker out of `dist/`.
  [`shopPlugins.ts:11`](../../tooling/shopPlugins.ts#L11)

- `vite.config.ts` is excluded from tsc, ESLint and Prettier because its frozen bytes fail all three.
  [`tsconfig.node.json:23`](../../tsconfig.node.json#L23)

**Import boundaries (AD-1)**

- Regexes anchored on `../` climbs, so package subpaths and nested modules are not caught.
  [`eslint.config.js:11`](../../eslint.config.js#L11)

- One block per layer; the globs must not overlap, because flat config replaces rule options.
  [`eslint.config.js:46`](../../eslint.config.js#L46)

**Design tokens (UX-DR1/2)**

- Every DESIGN.md token in Tailwind v4 namespaces; this is the only file allowed to contain hex values.
  [`index.css:8`](../../src/index.css#L8)

- Base focus ring and reduced-motion rules.
  [`index.css:104`](../../src/index.css#L104)

**MSW: dev-only, never shipped (AD-10)**

- Build-time DEV guard plus the opt-in flag; production drops the mocks import.
  [`enableMocking.ts:4`](../../src/app/enableMocking.ts#L4)

- The app still renders if the mock worker fails to start.
  [`main.tsx:9`](../../src/app/main.tsx#L9)

- Scans `dist/` for the worker file and MSW markers; proven against a real dev build.
  [`mswArtifacts.ts:18`](../../tooling/mswArtifacts.ts#L18)

- Tests reject unmocked requests, so they never reach the live API.
  [`vitest.setup.ts:7`](../../vitest.setup.ts#L7)

**Quality gates and CI**

- `quality` chains tsc, ESLint, Prettier and Vitest with coverage.
  [`package.json:21`](../../package.json#L21)

- 80% statement and branch thresholds on cart and checkout (shown to fail on an uncovered file).
  [`vitest.config.ts:18`](../../vitest.config.ts#L18)

- CI also builds, so the MSW check runs on every push and PR.
  [`quality.yml:22`](../../.github/workflows/quality.yml#L22)

- Workaround for `@hookform/resolvers`' conflicting optional peers, needed for `npm ci`.
  [`.npmrc:3`](../../.npmrc#L3)

**Tests (peripherals)**

- Failing and allowed fixtures for every boundary, linted through the ESLint API.
  [`eslint-boundaries.test.ts:154`](../../tooling/eslint-boundaries.test.ts#L154)

- Token parity against DESIGN.md frontmatter, plus the hex-literal scan.
  [`design-tokens.test.ts:69`](../../tooling/design-tokens.test.ts#L69)

- Build-check cases: clean build, worker file, bundled code, source map, missing output.
  [`mswArtifacts.test.ts:19`](../../tooling/mswArtifacts.test.ts#L19)

- Asserts MSW's own rejection reason, because a blocked network also rejects.
  [`node.test.ts:4`](../../src/mocks/node.test.ts#L4)

- Worker starts only in DEV with `VITE_API_MOCK=true`.
  [`enableMocking.test.ts:8`](../../src/app/enableMocking.test.ts#L8)
