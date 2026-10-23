---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T07:01:17.782Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 2.1: Add Products to the Cart'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 2-1-add-products-to-the-cart
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-11
---

# Story 2.1: Add Products to the Cart

## Intent

**Problem:** Shoppers can browse and read Product Details, but nothing can be collected. There is no Cart, no Redux store, and no header count.

**Approach:**
- **Store:** `src/app/store.ts` with exactly two slices, `cart` and `notices` (AD-2). A single `noticeListener` is registered in `src/app/noticeListener.ts` (AD-16).
- **Cart slice:** `features/cart/model/`. `itemAdded(toCartItemSnapshot(product))` adds 1 Quantity, clamped to Stock, and overwrites snapshot fields (AD-3, AD-13). Reducers are pure.
- **Addability:** `selectAddability(productId, currentStock)` is the only source of the Add to Cart enabled state and reason (FR11).
- **Add to Cart:** `AddToCartButton` in `features/cart/ui/`, filled into the `ProductCard` and `ProductDetailsView` action slots by the pages (AD-1 composition).
- **Header:** `CartIndicator` in `RootLayout` shows the Item Count and links to `/cart`.
- **Notices:** one `aria-live="polite"` region mounted right after `<main>`. Notices come only from the listener.

## Boundaries & Constraints

**Always:**
- `catalog` and `cart` never import each other. Pages compose `AddToCartButton` into the catalog `action` slot.
- Test titles start with the FR id (for example `FR10 ...`).
- Reducers never dispatch, read the clock or use randomness. Notice ids come from a counter in the `notices` slice.
- Money is integer cents. Totals are pure functions in `features/cart/model/totals.ts` and are never stored.

**Ask First:** Any change to the catalog fetch strategy or to `productApi.ts`.

**Never:**
- Persist the Cart (Story 2.4) or reconcile it with the catalog (Story 2.5).
- Add Cart quantity controls or the Cart page (Stories 2.2 and 2.3).
- Add a second global state mechanism.

## Interpretation Choices

- **Maximum notice:** an add that leaves Quantity equal to Stock shows the persistent "Only N available. Your cart has the maximum." Notice. An add that is refused because Quantity is already at Stock shows the same Notice. Otherwise "Added to cart" auto-dismisses after 5 s.
- **Shared Button contract:** there is no shared `Button` component yet. The button follows the disabled contract from the story (`aria-disabled`, stays focusable, early return on click) inline in `AddToCartButton`.
- **Pause on hover or focus:** the 5 s timer restarts from zero when the pointer or focus leaves the Notice.

## Code Map

- `src/app/store.ts`: `configureStore` with `cart`, `notices`, and the listener middleware.
- `src/app/noticeListener.ts`: `createListenerMiddleware`, `startListening({ actionCreator: itemAdded })`.
- `src/app/RootLayout.tsx`: header `CartIndicator`, `NoticeRegion` after `<main>`.
- `src/app/main.tsx`: `<Provider store={store}>`.
- `src/shared/model/cartItem.ts`: `CartItem`, `CartItemSnapshot`, `toCartItemSnapshot`.
- `src/shared/ui/notice/`: `noticesSlice.ts`, `NoticeRegion.tsx`.
- `src/features/cart/model/`: `cartSlice.ts`, `addability.ts`, `totals.ts`.
- `src/features/cart/ui/`: `AddToCartButton.tsx`, `InCartLine.tsx`, `CartIndicator.tsx`.
- `src/features/cart/index.ts`: public API.
- `src/features/catalog/ui/ProductGrid.tsx`, `HomeFeaturedProducts.tsx`: accept `renderAction` (already used by `ProductGrid`).
- `src/pages/HomePage.tsx`, `ProductListingPage.tsx`, `ProductDetailsPage.tsx`: fill action slots by composition.

## Tasks & Acceptance

- [x] Store with `cart` and `notices` slices; listener middleware registered; Provider in `main.tsx` (FR10)
- [x] `itemAdded` adds a new item at quantity 1, and increments an existing one capped at Stock, overwriting the snapshot fields; never a duplicate; never out of 1..Stock (FR10, NFR5)
- [x] `selectAddability` returns Out of stock or the max-in-cart reason; `canAdd` only when both are false (FR11)
- [x] `AddToCartButton` adds 1, stays on the page, shows "Added ✓" for 1.5 s, and is disabled with the reason as its label when not addable (FR10, FR11)
- [x] Product Details shows "In your cart: N" with a "View cart" link once the Product is in the Cart (FR10)
- [x] Header `CartIndicator` shows the count, muted at 0, teal from 1, pops for 200 ms unless reduced motion, accessible name "Cart, N items", links to `/cart` (FR18)
- [x] `noticeListener` raises "Added to cart" (5 s auto-dismiss) or the persistent maximum Notice (FR13)
- [x] Notice region after `<main>`: `aria-live="polite"`, bottom-centre below `md`, top-right from `md`, up to 3 stacked, newest first, "+N more" below `md`, dismiss named "Dismiss notice", focus moves on dismiss (UX-DR18)
- [ ] `npm run quality` passes. Not fully green: tsc, vitest (315 tests, coverage run) and `vite build` pass. ESLint and Prettier fail only on `tools/atlassian-service.mjs`, which this story did not touch.

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added tests for the cart model, listener, notices, add button, indicator and notice region. Updated three page tests that expected an empty action slot and a unique "Out of stock" label, since Story 2.1 fills both.
