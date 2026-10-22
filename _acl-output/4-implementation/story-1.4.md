---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T17:19:17.503Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 1.4: Search, Filter and Sort Products'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-21'
story_key: 1-4-search-filter-and-sort-products
review_loop_iteration: 0
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/4-implementation/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The listing shows every Product, with no way to search, filter by Category or sort, so Shoppers can't narrow down or share a view (FR2–FR6).

**Approach:**
- **Criteria in the URL:** `useListingCriteria()` gains `q`, `category` and `sort`, plus pure listing functions (AD-6, AD-7).
- **Categories:** a `getCategories()` adapter call with `categoriesQueryOptions()`, and MSW fixtures for it.
- **Controls:** Search Box, Category and Sort selects, Filter Chips, an announced result count, and an empty-results state.
- **Sort options as data:** a table, so Epic 4 can add "sort by rating" by adding one row.

## Boundaries & Constraints

**Always:**
- Criteria live only in the URL. Changing any criterion other than `page` resets `page`.
- Search uses history `replace`.
- Focus stays on the control used.
- No catalog function filters on stock (AD-9).
- `useQuery` is called only through `queries.ts`.
- Tokens only; 44 px targets; native `<select>` elements with visible labels.

**Ask First:** Server-side search, or any change to the AD-6 strategy. Adding sort options beyond the three in FR4.

**Never:**
- Sort by rating (Epic 4).
- Product Details (1.5) or Home (1.6) content.
- Persisting criteria anywhere except the URL.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Search | Type "lip" | After 300 ms, `?q=lip` (replace); case-insensitive title/description match | N/A |
| Search on Enter | Type "lip", press Enter | `q` is applied at once | N/A |
| Clear search | × in the Search Box | `q` is removed; `category` and `sort` are kept; focus returns to the input | N/A |
| Category | Select "Fragrances" | `?category=fragrances`, page reset, immediate | N/A |
| Sort | "Price: low to high" | `?sort=price-asc`; the whole filtered set is sorted | N/A |
| Combined | `?q=e&category=groceries&sort=price-desc&page=2` | Only Products matching all criteria, sorted; reproduced on reload | N/A |
| Invalid values | `?sort=cheap&category=Bad Slug!` | Defaults (relevance, all categories), no error | N/A |
| Chips | Active `q` and `category` | Chips with × named "Remove filter: {value}", plus "Clear filters" | N/A |
| Count announced | A criterion changes | Polite live count ("3 products"); focus unchanged | N/A |
| No match | `?q=zzz` | `h2` "No products match", a sentence naming the criteria, primary "Clear filters" | N/A |
| Categories fail | Categories request errors | The select's only option is "Categories unavailable", with a "Retry" text button beside it; search and sort still work | Retry refetches |

</frozen-after-approval>

## Code Map

- `src/features/catalog/model/useListingCriteria.ts` -- Story 1.3: `parsePage`, `{ page, rawPage, setPage(next, {replace}) }` → add `q`, `category`, `sort` and setters. The page normalisation in `ProductListingPage` relies on `rawPage`.
- `src/pages/ProductListingPage.tsx` -- count `<p ref tabIndex=-1>` (pagination focus target), `AsyncState`, `paginate(...)`. Filtering goes before `paginate`.
- `src/shared/api/{dto,productApi,queries}.ts` -- follow the existing patterns (zod-only `dto.ts`, `requestJson` with signal and timeout, `queryOptions` factories).
- `src/mocks/{handlers,scenarios}.ts` -- add `/products/categories` before any future `/products/:id`.
- `src/features/catalog/ui/ProductCard.tsx` -- the caption uses `categoryLabel(slug)` → accept a `categoryName` prop, keeping the slug label as the fallback.
- DummyJSON: `GET /products/categories` → `[{ slug, name, url }]`.

## Tasks & Acceptance

**Execution:**
- [x] `src/shared/{model/product.ts,api/dto.ts,api/productApi.ts,api/queries.ts}` -- `Category { slug, name }`, the categories DTO, `getCategories()`, `categoriesKeys` and `categoriesQueryOptions()` (10 min) -- AD-5
- [x] `src/mocks/{fixtures/categories.ts,handlers.ts,scenarios.ts}` -- categories derived from the product fixtures; `categoriesError` scenario -- AD-10
- [x] `src/features/catalog/model/{criteria.ts,listing.ts,useListingCriteria.ts}` -- `SORT_OPTIONS` table, parsers, `matchesSearch`, `applyCriteria` (search → category → stable sort) -- AD-6, AD-7
- [x] `src/features/catalog/api/useCategories.ts`
- [x] `src/features/catalog/ui/{SearchBox,ListingControls,FilterChips,NoResults}.tsx` -- UX-DR11, 12, 13; FR6
- [x] `src/features/catalog/ui/{ProductCard,ProductGrid}.tsx` -- `categoryName` from the categories query
- [x] `src/pages/ProductListingPage.tsx` -- compose the controls; the count is `aria-live="polite"`
- [x] Tests: pure functions, the criteria hook, adapter and handler for categories, listing page (every matrix row), `e2e/listing.spec.ts` (URL reproduction, debounced search)

**Acceptance Criteria:**
- Given `npm run quality`, `npm run build` and `npm run test:e2e`, when they run, then all pass.

## Spec Change Log

1. **Finding:** `react-hooks/refs` (the React Compiler lint) rejects chip objects whose `onRemove` closures read the search-input ref during render. **Amended:** `FilterChip` is plain data (`key`, `label`, `value`), and `FilterChips` takes one `onRemove(key)` handler as a prop. **Avoids:** passing ref-reading closures through render-time function calls.
2. **Finding (e2e):** two criteria updates fired within the same few milliseconds (automation speed) can lose the first. React Router's functional `setSearchParams` reads the params from the last render, not from a pending navigation. **Amended:** the e2e test waits for each URL change, as a user would. **Known limit:** not reachable at human interaction speed; revisit only if a real flow chains updates synchronously.
3. **Review fixes (patch):**
   - **Pending search could overwrite a newer URL** (type, then Clear filters within 300 ms; it restored both `q` and the cleared category through a stale `setSearchParams` closure). Fixed: SearchBox tracks `urlKey` (the whole query string); any URL change cancels the pending search and re-syncs the text. Mutation-checked.
   - **Long queries:** `setQuery` stores the parsed `q` (100-char cap) and the input has `maxLength`, so the URL and the applied query can't diverge.
   - **`updateFilters`** skips `undefined` values.
   - **One slug rule for API and URL:** `CATEGORY_SLUG` lives in `dto.ts`; `getCategories` rejects duplicate slugs.
   - **Search is locale-independent** (`toLowerCase`).
   - **When Categories fail,** an active Category stays selected and applied (no misleading reset). `ListingControls` takes plain props.
   - **A sort-only change is announced:** a separate `role="status"` reads "Showing N products, sorted by …". The visible count stays the pagination focus target.
   - **Smaller fixes:** no "Clear filters" without filters (empty catalog); results memoised; clear-× focus via the ref; fixture throws a clear error for a missing Category name.
   - **Rejected:**
     - Normalising an unknown well-formed slug: Design Notes keep it, so a stale link explains itself.
     - Pushing history on Enter or clear: UX-DR11 asks for replace.
     - The duplicate "Clear filters" name: the AC requires both buttons.
4. **Known noise (e2e):** in full parallel runs, the dev server sometimes logs `Failed to update a ServiceWorker … Not found` (an MSW worker update racing a page or context close). It doesn't reproduce per spec file, never fails a test, and is development-only.

## Design Notes

- **Debounce lives in SearchBox local state.** The input value is local, and URL changes from outside (chips, Clear filters, Back) re-sync it. Only the committed `q` is in the URL.
- **After a chip or Clear filters removes itself, focus goes to the search input,** so it is never lost.
- **An unknown but well-formed category slug** (e.g. a stale link) is kept, which yields an empty result naming it. A malformed slug falls back to all categories.

## Verification

**Commands:**
- `npm run quality` -- exit 0
- `npm run build` -- exit 0
- `npm run test:e2e` -- exit 0

## Suggested Review Order

**Criteria and URL (AD-7)**

- Entry point: the sort table; Epic 4 adds "rating" as one row.
  [`criteria.ts:12`](../../src/features/catalog/model/criteria.ts#L12)

- Non-page changes reset the page; defaults leave the URL; `undefined` is ignored.
  [`useListingCriteria.ts:37`](../../src/features/catalog/model/useListingCriteria.ts#L37)

- Pure search, filter and stable sort over the whole catalog; never filters on stock.
  [`listing.ts:24`](../../src/features/catalog/model/listing.ts#L24)

**Search Box (UX-DR11)**

- Any URL change cancels a pending debounced search, so a newer URL is never overwritten.
  [`SearchBox.tsx:33`](../../src/features/catalog/ui/SearchBox.tsx#L33)

**Page composition (FR5, FR6, UX-DR13, UX-DR32)**

- Results are memoised from URL criteria; pagination follows the filtered set.
  [`ProductListingPage.tsx:41`](../../src/pages/ProductListingPage.tsx#L41)

- Chip removal keeps the other criteria and moves focus to search.
  [`ProductListingPage.tsx:90`](../../src/pages/ProductListingPage.tsx#L90)

- A status announcement that also names the sort.
  [`ProductListingPage.tsx:148`](../../src/pages/ProductListingPage.tsx#L148)

- An active Category is always shown in the select, even when it is unlisted or the list failed.
  [`ListingControls.tsx:43`](../../src/features/catalog/ui/ListingControls.tsx#L43)

- Chips are plain data with one remove handler (React Compiler refs rule).
  [`FilterChips.tsx:18`](../../src/features/catalog/ui/FilterChips.tsx#L18)

**Categories data (AD-5, AD-10)**

- Adapter rejects duplicate or malformed slugs.
  [`productApi.ts:76`](../../src/shared/api/productApi.ts#L76)

- One slug rule for API and URL.
  [`dto.ts:38`](../../src/shared/api/dto.ts#L38)

- Same cache policy as the catalog.
  [`queries.ts:28`](../../src/shared/api/queries.ts#L28)

- MSW categories handler, built through the schema.
  [`handlers.ts:62`](../../src/mocks/handlers.ts#L62)

**Tests (peripherals)**

- Pure-function tests: search, filter, stable sort, combinations, no-match copy.
  [`criteria.test.ts:85`](../../src/features/catalog/model/criteria.test.ts#L85)

- Page tests: every row of the I/O matrix.
  [`ProductListingPage.test.tsx:230`](../../src/pages/ProductListingPage.test.tsx#L230)

- Review hardening: status, re-sync on Back, pending-search cancel, failed and unlisted Categories.
  [`ProductListingPage.test.tsx:457`](../../src/pages/ProductListingPage.test.tsx#L457)

- Real-browser URL reproduction after a reload, controls, and the 320 px layout.
  [`listing.spec.ts:81`](../../e2e/listing.spec.ts#L81)
