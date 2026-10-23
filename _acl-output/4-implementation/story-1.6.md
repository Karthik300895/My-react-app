---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T06:21:35.012Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 1.6: Discover Products from Home'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
review_loop_iteration: 0
story_key: 1-6-discover-products-from-home
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/4-implementation/epic-1-context.md'
jira_key: KAN-10
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/` is a placeholder with no content. Shoppers who land on Home can't discover Products or navigate to Categories without already knowing the URL (FR31).

**Approach:**
- **Hero:** a `display`-sized `h1` with marketing copy and a "Shop all products" `<Link to="/products">`.
- **Category shortcuts:** a row of pill links from `useCategories()`, each linking to `/products?category={slug}`; error → inline Alert with Retry; loading → skeleton pills.
- **Top rated:** 8 highest-rated Products (ties broken by id asc) via `catalogQueryOptions()` (AD-6); loading → 8 skeleton cards; error → Alert with Retry. Hero is never affected by either failure.

## Boundaries & Constraints

**Always:**
- Home reads `catalogQueryOptions()` — the same cache as the listing (AD-6). No second fetch.
- Only `productApi.ts` fetches; query option factories from `queries.ts`.
- `topRated()` is a pure function in `features/catalog/model/`; sort by `rating` desc, ties by `id` asc.
- One `h1` per page (the hero headline). "Top rated" and "Browse categories" are `h2` headings.
- ProductCard action slots stay empty until Epic 2.

**Ask First:** Any change to `catalogQueryOptions` or the catalog fetch strategy (AD-6).

**Never:**
- Add to Cart or cart-related UI (Epic 2).
- A second `getCatalog()` call or a separate endpoint.
- Storing the top-rated sort logic outside `features/catalog/model/topRated.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Happy path | `/`; catalog + categories loaded | Hero with h1 and "Shop all products" link; category pill links; "Top rated" h2; 8 product cards; tab title "Home · Simple Shopping Cart" | N/A |
| Catalog loading | Catalog pending | Hero visible; featured region `aria-busy`; 8 skeleton cards | N/A |
| Catalog error | Network / 5xx | Hero visible; Alert "We couldn't load products…" with Retry in featured region | Retry refetches |
| Categories loading | Categories pending | Skeleton pill row; featured products unaffected | N/A |
| Categories error | Network / 5xx | Shortcuts replaced by inline Alert with Retry; featured products still visible | Retry refetches |
| Fewer than 8 | Catalog has < 8 products | All available products shown; no empty slots | N/A |
| Tie-breaking | Two products share top rating | Lower id ranks first | N/A |

</frozen-after-approval>

## Code Map

- `src/features/catalog/model/topRated.ts` -- new: `topRated(products: Product[], limit: number): Product[]`; sort by `rating` desc then `id` asc; pure function.
- `src/features/catalog/ui/HomeHero.tsx` -- new: static `<section>` with `text-display` `h1` and "Shop all products" `<Link to="/products">`.
- `src/features/catalog/ui/HomeCategoryShortcuts.tsx` -- new: calls `useCategories().query`; pill `<Link>` per category to `/products?category={slug}`; inline skeleton and Alert on error.
- `src/features/catalog/ui/HomeFeaturedProducts.tsx` -- new: calls `useCatalog()` and `useCategories().categoryName`; wraps in `AsyncState` with `<ProductGridSkeleton>` skeleton and `<ProductGrid products={topRated(data, 8)}>`.
- `src/pages/HomePage.tsx` -- replace placeholder; compose `HomeHero`, category section (`h2` + `HomeCategoryShortcuts`), featured section (`h2` + `HomeFeaturedProducts`); `useDocumentTitle('Home')`.
- `src/features/catalog/index.ts` -- add exports: `topRated`, `HomeHero`, `HomeCategoryShortcuts`, `HomeFeaturedProducts`.
- `src/shared/ui/AsyncState.tsx` -- reuse as-is (read-only). Renders `<section aria-label={label} aria-busy={loading}>`.
- `src/features/catalog/ui/ProductGrid.tsx` -- reuse as-is. Props: `{ products: Product[]; categoryName?: (slug) => string }`.
- `src/features/catalog/ui/ProductGridSkeleton.tsx` -- reuse as-is. Always renders 8 skeleton cards.
- `src/shared/api/queries.ts` -- `catalogQueryOptions()` and `categoriesQueryOptions()` (read-only).
- `src/mocks/scenarios.ts` -- `scenarios.networkError`, `scenarios.serverError`, `scenarios.categoriesError` already exist.

## Tasks & Acceptance

**Execution:**
- [x] `src/features/catalog/model/topRated.ts` -- `topRated(products, limit)`: sort desc by `rating`, asc by `id` on ties; slice to `limit`
- [x] `src/features/catalog/ui/HomeHero.tsx` -- static hero section: `display`-sized `h1`, sub-copy `<p>`, "Shop all products" `<Link to="/products">`
- [x] `src/features/catalog/ui/HomeCategoryShortcuts.tsx` -- pill links from `useCategories().query`; skeleton pills while loading; `<Alert>` with Retry on error
- [x] `src/features/catalog/ui/HomeFeaturedProducts.tsx` -- `useCatalog()` + `useCategories().categoryName` + `<AsyncState>` + `topRated(products, 8)` + `<ProductGrid>`
- [x] `src/pages/HomePage.tsx` -- replace placeholder; compose three sections; `useDocumentTitle('Home')`
- [x] `src/features/catalog/index.ts` -- add exports for new model and UI
- [x] `src/features/catalog/model/topRated.test.ts` -- unit tests: sort order, tie-breaking by id, limit, fewer-than-limit, immutability
- [x] `src/pages/HomePage.test.tsx` -- test every I/O matrix row: happy path, catalog loading, catalog error + retry, categories error + retry
- [x] `e2e/home.spec.ts` -- FR31: hero + "Shop all products"; category shortcut navigates; 8 top-rated cards visible

**Acceptance Criteria:**
- Given `npm run quality`, `npm run build`, and `npm run test:e2e`, when they run, then all pass.

## Spec Change Log

## Design Notes

- **Two independent async regions:** hero renders unconditionally. `HomeCategoryShortcuts` and `HomeFeaturedProducts` own their own loading/error states so a category failure never hides products.
- **`topRated` is pure:** takes `Product[]`, returns a new array. No React, no selectors — testable in isolation.
- **Grid layout**: uses `GRID_CLASSES` (same as listing), so featured cards look identical to listing cards.

## Verification

**Commands:**
- `npm run quality` -- exit 0
- `npm run build` -- exit 0
- `npm run test:e2e` -- exit 0
