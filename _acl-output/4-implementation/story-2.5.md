---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T10:27:49.658Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 2.5: Reconcile the Cart with the Catalog'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 2-5-reconcile-the-cart-with-the-catalog
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
---

# Story 2.5: Reconcile the Cart with the Catalog

## Intent

**Problem:** A saved Cart can hold Products that have since been removed, sold out, or repriced. The Shopper finds out only at checkout.

**Approach:**
- **Pure reconcile:** `reconcile(items, catalog)` in `features/cart/model/reconcile.ts` returns the updated items and a list of changes (AD-14, FR21).
- **Trigger:** `useCartReconciliation()` is mounted once in `RootLayout`. It reads `catalogQueryOptions()` and runs once per successful `dataUpdatedAt`, only while the Cart is not empty. It dispatches one `cartReconciled({ items, changes })`.
- **Notices:** the `noticeListener` turns each change into a persistent warning Notice, using the exact UX-DR30 strings. More than two changes become one summary Notice with a "Show details" toggle.

## Boundaries & Constraints

**Always:**
- Reconciliation is pure. Snapshot fields follow AD-13.
- A failed or incomplete catalog changes nothing. Retrying is TanStack Query's normal refetch.
- `cart` reads the catalog through `shared/api` only. It does not import the `catalog` feature (AD-1, AD-5).
- Test titles start with the FR id.

**Ask First:** Any change to the catalog fetch strategy or the UX-DR30 wording.

**Never:**
- Reconcile on each render or from more than one place (AD-14).
- Dispatch `cartReconciled` without a successful catalog.

## Interpretation Choices

- **Removed versus out of stock:** a Product absent from the catalog is "no longer available". A Product with stock 0 is "now out of stock". Both are removed.
- **Capped quantity:** Quantity is capped at the new Stock. The Notice reports the new Stock as `n`.
- **Stock change without a cap:** if Stock falls but still covers the Quantity, nothing is reported. The spec lists only the four cases.
- **Summary threshold:** "more than 2 changes" means three or more. The summary Notice reads "{k} changes to your cart" and lists the individual messages in the details.
- **Warning rule:** each reconciliation Notice has a warning-coloured left border.
- **Initial run:** the hook runs once the catalog loads. A Cart restored at startup is reconciled then, so it is ready before `/cart` or `/checkout` is usually opened.

## Code Map

- `src/features/cart/model/reconcile.ts`: `reconcile(items, catalog)` and the `ReconcileChange` type.
- `src/features/cart/model/reconcileNotices.ts`: `noticesForReconciliation(changes)` with the exact strings.
- `src/features/cart/model/cartSlice.ts`: `cartReconciled` reducer.
- `src/features/cart/model/useCartReconciliation.ts`: the hook.
- `src/shared/ui/notice/noticesSlice.ts`: optional `variant` and `details` on a Notice.
- `src/shared/ui/notice/NoticeRegion.tsx`: warning rule, and the "Show details" toggle with a 40vh scroll.
- `src/app/noticeListener.ts`: handles `cartReconciled`.
- `src/app/RootLayout.tsx`: mounts `useCartReconciliation()`.

## Tasks & Acceptance

- [x] `reconcile` removes a Product absent from a complete catalog, removes a Product with stock 0, caps Quantity at the new Stock, and updates a changed price. Snapshot fields follow AD-13 (FR21)
- [x] `useCartReconciliation()` is mounted once in `RootLayout`, reads `catalogQueryOptions()`, runs once per successful `dataUpdatedAt`, and only while the Cart is not empty (FR21, AD-14). The once-per-`dataUpdatedAt` guard is a ref, and the run is not asserted by a test that counts dispatches.
- [x] A failed or incomplete catalog leaves the Cart unchanged (FR21, AD-8). The incomplete case is rejected by the existing adapter, so no data reaches the hook.
- [x] Each change raises a persistent warning Notice with the exact UX-DR30 strings
- [x] More than two changes raise one "{k} changes to your cart" Notice with a "Show details" toggle. The 40vh scroll is a class on the list; it is not measured in a browser.
- [x] Under the network-error scenario, the Cart is left untouched (UJ-4)
- [x] tsc, Vitest and `vite build` pass (370 tests, run serially)

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added the pure `reconcile`, the notice rules with the exact strings, the `cartReconciled` reducer and listener, the `useCartReconciliation` hook mounted in `RootLayout`, and the warning rule and details toggle in the notice region. Tests use the MSW catalog and network-error scenarios against the real store.
