---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T16:51:43.577Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 1.3: See the Product Grid'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-21'
story_key: 1-3-see-the-product-grid
review_loop_iteration: 0
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/4-implementation/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/products` is a placeholder. There is no Product API adapter, query layer, mock data or Product Card, so a Shopper can't see what's for sale (FR1, FR8, FR33, FR34).

**Approach:**
- **Data layer:** the AD-5/AD-6 adapter and query layer, plus contract-checked MSW fixtures and scenarios (AD-10).
- **Shared building blocks:** `isAvailable()`/`stockLabel()` (AD-9), `formatMoney()`, StockBadge, Skeleton, Alert, AsyncState (AD-8) and Pagination (with `page` in the URL via `useListingCriteria()`, AD-7).
- **The listing:** a responsive grid of Product Cards that includes out-of-stock Products.

## Boundaries & Constraints

**Always:**
- `productApi.ts` is the only `fetch`, and prices are converted to cents only there.
- `useQuery` is called only with the `queries.ts` factories.
- Never filter on stock.
- Money is formatted only by `formatMoney()`, and stock text comes only from `stockLabel()`.
- Use tokens only. Interactive targets are at least 44 px. Hover lift is pointer-only and off under reduced motion.

**Ask First:** Any new runtime dependency. Changing the AD-6 catalog strategy or the `CATALOG_SELECT` contract.

**Never:**
- Search, Category filter or sort UI (Story 1.4).
- Product Details content (1.5).
- *Add to Cart* (Epic 2): the action slot stays empty.
- Calling the live API from tests.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Catalog OK | `GET /products?limit=0&select=…` returns all items | `Product[]`, price 9.99 → 999 cents | N/A |
| Incomplete catalog | `products.length !== total` | — | `ApiError{kind:'parse'}` |
| Network failure | `fetch` rejects | — | `ApiError{kind:'network'}` |
| Server error | HTTP 500 | — | `ApiError{kind:'http', status:500}` |
| Bad shape | JSON fails the DTO schema | — | `ApiError{kind:'parse'}` |
| Loading | Query pending | 8 skeleton cards, `aria-busy="true"`, "Loading products…" | N/A |
| Load failed | Query error | Alert "We couldn't load products. Check your connection and try again." + Retry | Retry refetches and focuses the region |
| Low stock | stock 1–5 | "Only N left" badge over the image | N/A |
| Out of stock | stock 0 | Card shown, filtered image, "Out of stock" badge, full-contrast title and price | N/A |
| > 20 products | 24 items, `?page=2` | 4 cards; Pagination with `aria-current="page"`; the count is focused after a page change | N/A |
| One page | ≤ 20 items | Pagination hidden | N/A |
| Invalid page | `?page=abc`, `0` or beyond the last page | Page 1 | N/A |

</frozen-after-approval>

## Code Map

- `src/pages/ProductListingPage.tsx` -- Story 1.2 placeholder (h1 "Products", title "Products") → becomes the listing.
- `src/app/main.tsx` -- add `QueryClientProvider` around `RouterProvider`. `src/app/router.test.tsx` `renderAt` needs the provider too.
- `src/mocks/handlers.ts` -- `PRODUCT_API_ORIGIN`, empty `handlers` → real handlers. `vitest.setup.ts` already runs the server with `onUnhandledFrame: 'error'`.
- `src/index.css` -- add the shimmer keyframes and `--animate-shimmer` (using `--motion-shimmer`).
- `playwright.config.ts` -- `webServer` currently builds and runs preview, where MSW is stripped (AD-10).
- `eslint.config.js` -- `shared/` must not import `features/`. `pages/` imports features only via `index.ts`.
- `tsconfig.node.json` -- type-checks `tooling/**/*.ts` with `nodenext`, so any `src/` file the contract script imports must carry only extension-free bare imports (`dto.ts` imports only `zod`).
- DummyJSON list shape is `{ products, total, skip, limit }`. With `select`, each item has `id` plus the selected fields. Its `category` is a slug, e.g. `mens-shirts`.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/model/{product,availability}.ts` -- `Product { id, title, description, priceCents, category, rating, stock, thumbnail }`; `isAvailable`, `LOW_STOCK_THRESHOLD = 5`, `stockLevel`, `stockLabel` -- AD-9
- [x] `src/shared/lib/formatMoney.ts` -- en-US USD from cents
- [x] `src/shared/api/{dto,ApiError,productApi,queries}.ts` -- `CATALOG_SELECT`, zod schemas, typed errors, `getCatalog()`, `catalogKeys`, `catalogQueryOptions()` (10 min stale and gc) -- AD-5, AD-6, AD-8
- [x] `src/app/queryClient.ts`, `src/app/main.tsx` -- QueryClient (retry once, only for network or http errors) and provider
- [x] `src/mocks/{fixtures/products.ts,handlers.ts,scenarios.ts}` -- 24 DTO-shaped products (≥ 2 with stock 0, ≥ 1 low), a `/products` handler honouring `limit`, `skip` and `select`, and `networkError`, `serverError` and `incompleteCatalog` scenarios -- AD-10
- [x] `tooling/contract-live.ts`, `package.json` `contract:live` -- validate live `/products?limit=0` against the same schemas (manual, not CI)
- [x] `src/shared/ui/{StockBadge,Skeleton,Alert,AsyncState,Pagination}.tsx` -- UX-DR7, 19, 20, 14
- [x] `src/features/catalog/{model/{paginate,categoryLabel,useListingCriteria}.ts,api/useCatalog.ts,ui/{ProductCard,ProductGrid,ProductGridSkeleton}.tsx,index.ts}` -- UX-DR5, 6, 25; AD-7
- [x] `src/pages/ProductListingPage.tsx` -- count, AsyncState, grid, Pagination (scroll to the count and focus it on page change)
- [x] `playwright.config.ts` -- e2e `webServer` = dev server with `VITE_API_MOCK=true` (AD-10)
- [x] Tests: adapter, queries, fixtures, pure model functions, ProductCard, listing page (every matrix row), and `e2e/listing.spec.ts` (columns 2/3/4 at 360/640/1024 px, out-of-stock card visible)

**Acceptance Criteria:**
- Given `npm run quality`, `npm run build` and `npm run test:e2e`, when they run, then all pass.
- Given the source, when it is searched for `fetch(`, then only `src/shared/api/productApi.ts` calls it (the tooling contract script excepted).

## Spec Change Log

1. **Finding:** tests under `shared/` and `pages/` must import `mocks/` (server, scenarios, fixtures), which the AD-1 lint rule blocked. AD-1 allows `mocks/` in "test setup". **Amended:** each boundary block in `eslint.config.js` is split into two disjoint blocks. Source files get every pattern; `*.test.{ts,tsx}` files get the same patterns minus the `mocks/` ban. **Avoids:** overlapping flat-config blocks silently dropping each other's patterns. **KEEP:** non-test files are still blocked from `mocks/` (lint fixture "shared → mocks").
2. **Finding:** the page tests need a router plus a QueryClient, and `pages/` may not import `app/`. **Amended:** added the test helper `shared/lib/renderWithRouter.tsx` (no app imports). The router tests use it too.
3. **Finding:** on every initial load, react-router warned "No `HydrateFallback` element", and the screen stayed blank while the first lazy module loaded (a Story 1.2 gap that surfaced here). **Amended:** the root route has `HydrateFallback: ProgressBar`, covered by a test.
4. **Finding:** the Story 1.1 "unmocked request" test used `/products`, which is now mocked. **Amended:** it uses a path no handler covers.
5. **Review fixes (patch):**
   - **AsyncState:** keeps showing cached data when a background refetch fails, instead of swapping the grid for the Alert.
   - **Retries:** `isRetryable` retries network errors and 5xx only, not 4xx. The retry policy has its own test.
   - **Catalog request:** the adapter now passes TanStack's abort signal plus a 15 s timeout to `fetch`, and rejects duplicate ids.
   - **Page URL:** an invalid or out-of-range `?page` is rewritten with `replace`, so "Page 1" is never stuck.
   - **Screen readers:** the skeleton list is `aria-hidden`, so it isn't announced as an empty list.
   - **Progress bar:** it ignores query-only navigations.
   - **AD-5 enforcement:** an ESLint `no-restricted-globals` rule allows `fetch` only in `productApi.ts` and tests.
   - **Mocks:** `incompleteCatalog` is built through the schema, and handlers reject non-integer or negative `limit`/`skip`.
   - **contract:live:** has a timeout and guards against a non-JSON body.
   - **New tests:** retry in-flight state, cached-data refetch failure, the `pageWindow` single-gap fill, and lint fixtures for test files and for `fetch`.
   - **Rejected:** image `alt` = title (required by the AC). Focus styles (the global `:focus-visible` rule from Story 1.1 covers them). Branded `Money`. All-or-nothing parsing of a malformed record (AD-6 needs a complete catalog).

## Design Notes

- **The Category caption is a humanised slug** (`mens-shirts` → "Mens Shirts") until Story 1.4 brings `getCategories()` names. It is isolated in `categoryLabel()` so it can be swapped.
- **The fixtures are hand-written in DummyJSON's shape,** because the corporate network blocks dummyjson.com (TLS access denied). `contract:live` is what verifies the live API against the same schemas.
- **The result count is the page-change focus target.** It sits just above the grid, so scrolling it into view (with `scroll-padding-top` from Story 1.2) satisfies "scroll to the top of the grid".

## Verification

**Commands:**
- `npm run quality` -- exit 0
- `npm run build` -- exit 0
- `npm run test:e2e` -- exit 0
- `npm run contract:live` -- run manually; expected to fail with a clear message here, because the network blocks the API

## Suggested Review Order

**Data layer (AD-5, AD-6, AD-8)**

- Entry point: one request for the whole catalog; incomplete or duplicate data is a parse error.
  [`productApi.ts:59`](../../src/shared/api/productApi.ts#L59)

- The only `fetch`: abort signal plus 15 s timeout, typed errors only.
  [`productApi.ts:15`](../../src/shared/api/productApi.ts#L15)

- DTO schemas import only zod, so the Node contract script can share them.
  [`dto.ts:9`](../../src/shared/api/dto.ts#L9)

- The shared catalog query (10 min stale/gc) used by Listing, Home and reconciliation.
  [`queries.ts:14`](../../src/shared/api/queries.ts#L14)

- Retry only what can change: network errors and 5xx, once.
  [`ApiError.ts:23`](../../src/shared/api/ApiError.ts#L23)

**Listing behaviour (FR1, FR33, FR34, AD-7)**

- One pattern for data regions; cached data wins over a failed background refetch.
  [`AsyncState.tsx:26`](../../src/shared/ui/AsyncState.tsx#L26)

- An invalid `?page` is normalised in place, so the URL matches the view.
  [`ProductListingPage.tsx:29`](../../src/pages/ProductListingPage.tsx#L29)

- On page change, scroll to the count and focus it, so it is announced once.
  [`ProductListingPage.tsx:38`](../../src/pages/ProductListingPage.tsx#L38)

- The only reader and writer of listing criteria; Story 1.4 extends it.
  [`useListingCriteria.ts:12`](../../src/features/catalog/model/useListingCriteria.ts#L12)

- Windowed 44 px pages; disabled ends stay focusable.
  [`Pagination.tsx:17`](../../src/shared/ui/Pagination.tsx#L17)

**Product Card (UX-DR5, UX-DR6, AD-9)**

- Stretched title link, clamped on an inner span so the focus ring isn't clipped.
  [`ProductCard.tsx:46`](../../src/features/catalog/ui/ProductCard.tsx#L46)

- Out of stock: a filtered image and a text badge, never hidden.
  [`ProductCard.tsx:32`](../../src/features/catalog/ui/ProductCard.tsx#L32)

- The single source of stock text.
  [`availability.ts:20`](../../src/shared/model/availability.ts#L20)

**Mocks and contract (AD-10)**

- Handlers honour `limit`, `skip` and `select`, and every response goes through the DTO schemas.
  [`handlers.ts:25`](../../src/mocks/handlers.ts#L25)

- Failure scenarios for tests.
  [`scenarios.ts:13`](../../src/mocks/scenarios.ts#L13)

- Manual live check against the same schemas (blocked on this network).
  [`contract-live.ts:11`](../../tooling/contract-live.ts#L11)

- e2e runs on the MSW dev server, because builds strip MSW.
  [`playwright.config.ts:9`](../../playwright.config.ts#L9)

**Enforcement and app wiring**

- Lint allows `fetch` only in the adapter.
  [`eslint.config.js:93`](../../eslint.config.js#L93)

- Test files may import mocks; every other boundary still applies to them.
  [`eslint.config.js:48`](../../eslint.config.js#L48)

- The first page load shows the progress bar, not a blank screen.
  [`router.tsx:14`](../../src/app/router.tsx#L14)

- The production retry policy.
  [`queryClient.ts:5`](../../src/app/queryClient.ts#L5)

**Tests (peripherals)**

- Adapter: request shape, cents, and every error kind.
  [`productApi.test.ts:19`](../../src/shared/api/productApi.test.ts#L19)

- Listing page: every row of the I/O matrix, plus retry in-flight and cached-data cases.
  [`ProductListingPage.test.tsx:47`](../../src/pages/ProductListingPage.test.tsx#L47)

- Real-browser columns at 360, 640 and 1024 px, out-of-stock card, pagination and reload.
  [`listing.spec.ts:10`](../../e2e/listing.spec.ts#L10)
