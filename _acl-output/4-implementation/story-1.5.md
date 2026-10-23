---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T17:56:24.260Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 1.5: View Product Details'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-21'
story_key: 1-5-view-product-detailsx
review_loop_iteration: 0
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/4-implementation/epic-1-context.md'
jira_key: KAN-9
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/products/:productId` is a placeholder. A Shopper can't see everything about one Product (stock, rating, images, full description), so they can't decide whether to buy it (FR7–FR9).

**Approach:**
- **Data:** a `getProduct(id)` adapter call with `productQueryOptions(id)`. HTTP 404 and 400 map to `ApiError{kind:'not-found'}` (AD-5, AD-8).
- **Validation:** the `:productId` param is checked with zod before any request is made.
- **Page:** a two-column Details page with the Product Gallery and Stock Badge.
- **States:** loading skeleton, Alert with Retry, and "Product not found".
- **Back link:** "Back to products" returns to the listing URL the Shopper came from.

## Boundaries & Constraints

**Always:**
- Only `productApi.ts` fetches; `useQuery` is called only through `queries.ts`.
- Stock text comes only from `stockLabel()`; money only from `formatMoney()`.
- One `h1` per page. Tokens only; 44 px targets.
- Out-of-stock Products show normally, with the OOS image filter (AD-9).
- MSW builds the `/products/:id` response through the DTO schema.

**Ask First:** Seeding Details from the catalog cache; any change to AD-6.

**Never:**
- *Add to Cart* or the "In your cart" line (Epic 2): the action slot stays empty.
- Home content (1.6).
- Storing the return URL anywhere except the history entry's state.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Details | `/products/2` | Gallery; Category, `h1`, "Rated 3.3 out of 5" plus stars, `price-lg` price, Stock Badge, description, empty action slot; title "{title} · Simple Shopping Cart" | N/A |
| Layout | Below `md` / from `md` | Stacked / two columns, gallery on the left | N/A |
| Stock | 44 / 5 / 0 | "In stock" / "Only 5 left" / "Out of stock" pill | N/A |
| Gallery | Activate "Show image 2 of 5" | Main image alt "{title}, image 2 of 5"; thumbnail `aria-pressed="true"` with a teal border; focus stays on it | N/A |
| Back | Arrived from `/products?category=beauty&page=1` | "Back to products" returns to that URL | No listing origin → `/products` |
| Malformed id | `/products/abc`, `/products/-1`, `/products/1.5` | "Product not found" at once; no request | N/A |
| Unknown id | API 404 or 400 | `h1` "Product not found", "It may have been removed, or the link is wrong.", primary "Browse products"; no Retry | N/A |
| Loading / failure | Pending; network error or 5xx | Skeleton gallery and text bars (`aria-busy`); then Alert with Retry | Retry refetches |

</frozen-after-approval>

## Code Map

- `src/shared/api/{dto,productApi,queries}.ts` -- follow the patterns: `requestJson(path, signal)`, zod `safeParse` then `parseError`, `queryOptions` factories with a 10-minute policy. `isRetryable` already skips `not-found`.
- `src/shared/model/product.ts` -- `Product`; Details adds `images`.
- `src/mocks/{fixtures/products,handlers,scenarios}.ts` -- fixtures have only `thumbnail`. `listResponse` + `pick` honour `select`. The categories route must stay before `/products/:id`.
- `src/features/catalog/ui/ProductCard.tsx` -- title `Link`; the rating markup and OOS filter are the visual reference. `useCategories().categoryName(slug)` gives the Category name.
- `src/shared/ui/{AsyncState,StockBadge,Skeleton,Alert}.tsx` -- reuse. `AsyncState` shows an Alert for any error, so the page must branch on `not-found` first.
- `src/app/useRouteFocus.ts` -- `focusPageHeading` runs on a path change. While Details loads there is no `h1` yet, so focus lands on `main`. Move it to `shared/lib` so pages can hand focus to the `h1` once it renders (pages can't import `app/`).
- `tooling/contract-live.ts` -- check the single-Product endpoint too.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/{model/product.ts,api/dto.ts,api/productApi.ts,api/queries.ts}` -- `ProductDetails` (`Product` + `images`), `PRODUCT_SELECT` derived from `CATALOG_SELECT`, `getProduct(id)` (404/400 → `not-found`; wrong id → parse), `productKeys`, `productQueryOptions(id)` -- AD-5, AD-8
- [x] `src/mocks/{fixtures/products.ts,handlers.ts,scenarios.ts}` -- fixture images (id 2 has 5); a `/products/:id` handler (unknown → 404, non-numeric → 400); product error scenarios -- AD-10
- [x] `src/shared/lib/focusPageHeading.ts` -- move the function from `app/` and add a hand-off hook for a late `h1` -- AD-11
- [x] `src/features/catalog/model/{productId,listingReturn}.ts` -- zod id parser; the card link stores its listing URL in history state; the reader accepts only `/products` URLs
- [x] `src/features/catalog/ui/{ProductGallery,ProductRating,ProductDetailsView,ProductDetailsSkeleton,ProductNotFound}.tsx` and the `ProductCard` link state -- UX-DR7, 15, 26
- [x] `src/pages/ProductDetailsPage.tsx` -- parse, then branch: not found / `AsyncState`
- [x] `tooling/contract-live.ts` -- check one Product against the details schema
- [x] Tests: adapter, query options, id parser, return reader, page (every matrix row), `e2e/details.spec.ts` (direct URL, both layouts, Back with criteria, gallery focus)

**Acceptance Criteria:**
- Given `npm run quality`, `npm run build` and `npm run test:e2e`, when they run, then all pass.

## Spec Change Log

1. **Finding (lint):** the page test imported `app/RootLayout`, which AD-1 forbids below `app/`. **Amended:** the route-focus hand-off test lives in `src/app/router.test.tsx` and runs against the real route table; the page test uses a plain `<main>` layout. The `/products/1` route-table row now expects the Product title.
2. **Review fixes (patch):**
   - **Gallery robustness:**
     - Duplicate image URLs are de-duplicated, because they key the thumbnails.
     - The selected index is clamped when a refetch returns fewer images.
     - An empty `images` falls back to the thumbnail (now tested).
     - The fixture throws on an unexpected thumbnail name.
   - **Back to products:**
     - A plain click goes back only when this isn't the session's first entry (`location.key !== 'default'`); otherwise it follows the stored listing URL.
     - `/products/` (trailing slash) is stored as `/products`.
     - Modified clicks and the `href` are tested.
   - **Focus tests:**
     - A direct load of Details or Not Found leaves focus on `body`.
     - Navigating in-app to an unknown id hands focus to "Product not found".
   - **Smaller fixes:** `contract:live` reports a non-JSON or wrong-id Product as a contract failure (exit 1); a stale comment in `handlers.ts` is fixed; the e2e two-column check is tighter.
   - Each new test was mutation-checked.
   - **Rejected:**
     - 400 → `not-found` for a valid id: the frozen matrix and AD-8 require it.
     - The partial schema for `select` mocks: same pattern as the catalog list.
     - Loading text inside `aria-busy`: same as the listing.
     - Category-name fallback while Categories load or fail: by design.
     - Back link placement: EXPERIENCE.md puts it in the right column.
3. **Deferred (not recorded in `deferred-work.md`, which is Approved and not edited by the agent):**
   - **Retry that returns 404:** if a Retry after a network or 5xx failure comes back 404, the focused region unmounts and focus drops to `body`.
   - **Product removed while cached:** a cached Product that is later removed keeps showing until the 10-minute cache expires (a refetch error keeps the last good data, as `AsyncState` does everywhere).

## Design Notes

- **Back to products:** a real `Link` to the stored listing URL, so it also works with middle-click. When the entry has a listing origin, a plain click goes back in history instead (`navigate(-1)`), which also restores the scroll position.
- **Gallery:** with one image there is no thumbnail row, and the main image alt is just the title. The selected image resets when the Product changes (keyed by id).
- **Not found vs. load errors:** the page branches on `isNotFound` only while there is no data. A 404 or 400 shows Not Found; every other error goes through `AsyncState`'s Alert with Retry.
- **Rating:** visible text "Rated 4.9 out of 5" (`toFixed(1)`, as on the card) plus 5 `aria-hidden` stars, rounded to the nearest whole star.

## Verification

**Commands:**
- `npm run quality` -- exit 0
- `npm run build` -- exit 0
- `npm run test:e2e` -- exit 0

## Suggested Review Order

**Page flow and error routing (FR7, FR9, AD-8)**

- Entry point: a malformed id renders Not Found without mounting the query at all.
  [`ProductDetailsPage.tsx:22`](../../src/pages/ProductDetailsPage.tsx#L22)

- Not-found wins over `AsyncState` only while there is no data; other errors get Retry.
  [`ProductDetailsPage.tsx:35`](../../src/pages/ProductDetailsPage.tsx#L35)

- Canonical positive integer ids only ("07", "1.5" and "-1" are malformed).
  [`productId.ts:7`](../../src/features/catalog/model/productId.ts#L7)

**Data (AD-5)**

- 404 and 400 become `not-found`, which the query client never retries.
  [`productApi.ts:105`](../../src/shared/api/productApi.ts#L105)

- Rejects a record for another id; returns domain cents plus images.
  [`productApi.ts:91`](../../src/shared/api/productApi.ts#L91)

- The details field list is derived from the single catalog list.
  [`dto.ts:31`](../../src/shared/api/dto.ts#L31)

- Per-id key with the catalog's cache policy.
  [`queries.ts:43`](../../src/shared/api/queries.ts#L43)

**Back to products (FR7)**

- The listing URL rides in the card link's history state, never in app state.
  [`ProductCard.tsx:57`](../../src/features/catalog/ui/ProductCard.tsx#L57)

- History state is untrusted: only `/products` URLs are accepted.
  [`listingReturn.ts:19`](../../src/features/catalog/model/listingReturn.ts#L19)

- A plain click goes back (keeps scroll); first entry or modified click follows the link.
  [`BackToProducts.tsx:24`](../../src/features/catalog/ui/BackToProducts.tsx#L24)

**Focus (AD-11)**

- Hands focus from `main` to a late h1; never on a direct load.
  [`focusPageHeading.ts:19`](../../src/shared/lib/focusPageHeading.ts#L19)

**Details UI (UX-DR7, UX-DR15, UX-DR26)**

- Thumbnails are pressed toggle buttons; the index is clamped after a refetch.
  [`ProductGallery.tsx:20`](../../src/features/catalog/ui/ProductGallery.tsx#L20)

- Unique image URLs, a thumbnail fallback, and an empty action slot for Epic 2.
  [`ProductDetailsView.tsx:28`](../../src/features/catalog/ui/ProductDetailsView.tsx#L28)

- Visible rating text; stars are decorative.
  [`ProductRating.tsx:14`](../../src/features/catalog/ui/ProductRating.tsx#L14)

**Mocks and contract (AD-10)**

- DummyJSON-style single-Product handler: 400 for non-numeric, 404 for unknown.
  [`handlers.ts:65`](../../src/mocks/handlers.ts#L65)

- Fixture images follow DummyJSON's naming; id 2 has 5, id 3 has 1.
  [`products.ts:305`](../../src/mocks/fixtures/products.ts#L305)

- The manual live check now covers one Product's details record.
  [`contract-live.ts:58`](../../tooling/contract-live.ts#L58)

**Tests (peripherals)**

- Page tests: every matrix row, including the gallery and Back with criteria.
  [`ProductDetailsPage.test.tsx:73`](../../src/pages/ProductDetailsPage.test.tsx#L73)

- Back: href, modified click, POP vs. first-entry PUSH.
  [`ProductDetailsPage.test.tsx:185`](../../src/pages/ProductDetailsPage.test.tsx#L185)

- Route-table focus: direct loads leave focus alone; navigations hand it to the h1.
  [`router.test.tsx:166`](../../src/app/router.test.tsx#L166)

- Adapter: select list, 404/400, 5xx, network, wrong id.
  [`productApi.test.ts:187`](../../src/shared/api/productApi.test.ts#L187)

- Id parser and return-URL reader edge cases.
  [`details.test.ts:5`](../../src/features/catalog/model/details.test.ts#L5)

- Real browser: direct URL, both layouts, keyboard gallery, Back with criteria.
  [`details.spec.ts:69`](../../e2e/details.spec.ts#L69)
