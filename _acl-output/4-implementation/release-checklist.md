---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-23T04:51:10.622Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Release Checklist: Architecture Decisions and Markdown Studio Regression'
tier: Tier 2 (Greenfield per-story gate)
type: review
created: '2026-10-23'
story_key: 4-4-review-release-traceability
---

# Release Checklist: Architecture Decisions and Markdown Studio Regression

Written for the release reviewer (Story 4.4). Each row gives the enforcement point in code and the test or lint rule that checks it. "Not automated" means no test checks the rule.

## Part 1: AD-1 to AD-16

| AD | Decision | Enforcement point (code) | Test or lint rule | Status |
|---|---|---|---|---|
| AD-1 | One-way dependencies, feature public APIs | Each feature's `index.ts`, e.g. `src/features/cart/index.ts`, `src/features/checkout/index.ts` | `tooling/eslint-boundaries.test.ts`; ESLint `no-restricted-imports` | Enforced |
| AD-2 | One owner per kind of state | `src/app/store.ts`, `src/features/checkout/model/checkoutSlice.ts`, `src/pages/CheckoutPage.tsx` (one form) | `checkoutSlice.test.ts`, `CheckoutShipping.test.tsx` | Enforced |
| AD-3 | Cart changed only by its slice; pure reducers | `src/features/cart/model/cartSlice.ts`, `totals.ts` | `src/features/cart/model/cartSlice.test.ts`, `totals.test.ts` | Enforced |
| AD-4 | Only Cart items persisted, versioned envelope | `src/features/cart/model/persistence.ts`, `src/app/cartPersistence.ts`, `src/shared/lib/storage.ts` | `persistence.test.ts`, `cartPersistence.test.ts`, `checkoutPersistence.test.ts`, `shippingPersistence.test.ts`, `orderPlacement.test.ts` | Enforced |
| AD-5 | One Product API adapter, shared query options | `src/shared/api/productApi.ts`, `src/features/catalog/api/*.ts` | `src/shared/api/productApi.test.ts`, `queries.test.ts` | Enforced |
| AD-6 | Whole catalog fetched once; listing done in the browser | `src/features/catalog/model/listing.ts`, `criteria.ts` (`SORT_OPTIONS`), `paginate.ts` | `listing.test.ts`, `criteria.test.ts` (FR-4 rating sort) | Enforced |
| AD-7 | URL is the only store of listing criteria | `src/features/catalog/model/criteria.ts` (`parseSort`, `parseCategory`), `useListingCriteria.ts`, `listingReturn.ts` | `criteria.test.ts`, `listing.test.ts` | Enforced |
| AD-8 | Typed API errors; one loading and error pattern | `src/shared/api/ApiError.ts`, `src/shared/ui/AsyncState.tsx`, `src/shared/ui/Alert.tsx` | `productApi.test.ts`, `queries.test.ts`, page tests | Enforced |
| AD-9 | Out-of-stock Products shown, never hidden | `src/shared/model/availability.ts`, `src/features/catalog/model/listing.ts` | `availability.test.ts`; `e2e/listing.spec.ts` (out-of-stock test, currently failing, see Part 3) | Partial: the e2e check fails |
| AD-10 | Contract-checked mock of the Product API; no MSW in builds | `src/mocks/*`, `src/app/enableMocking.ts`, `tooling/check-build.ts`, `tooling/mswArtifacts.ts` | `tooling/mswArtifacts.test.ts`; `npm run check:build` | Partial: the build check currently fails (Part 3) |
| AD-11 | One route table, data mode; guards as components | `src/app/router.tsx`, `src/features/checkout/ui/CheckoutGuard.tsx`, `ConfirmationGuard.tsx` | `src/app/router.test.tsx`, `CheckoutSummary.test.tsx`, `OrderConfirmationPage.test.tsx` | Enforced |
| AD-12 | Shop is a separate deployment from Markdown Studio | `public/markdown.html`, `public/markdown/**`, `api/*.js`, `netlify.toml`, `vercel.json` | Not automated. Manual checks in Part 2 | Partial: see Part 2 |
| AD-13 | Stock checked at add time, one decision point | `src/features/cart/model/addability.ts`, `cartSlice.ts` (`itemAdded` clamp) | `addability.test.ts`, `cartSlice.test.ts` | Enforced |
| AD-14 | Cart reconciliation has one owner and one trigger | `src/features/cart/model/useCartReconciliation.ts`, `src/app/RootLayout.tsx`, `reconcile.ts` | `src/app/cartReconciliation.test.tsx`, `reconcile.test.ts` | Enforced |
| AD-15 | Placing an Order is one shared event | `src/shared/model/events.ts` (`orderPlaced`), `src/features/checkout/model/placeOrder.ts`, `orderNumber.ts`; `cartCleared` only in `ClearCartDialog.tsx` | `src/features/cart/ui/ClearCartDialog.test.tsx` (source scan), `orderPlacement.test.ts`, `placeOrder.test.ts`, `orderNumber.test.ts` | Enforced |
| AD-16 | All Notices come from one listener | `src/app/noticeListener.ts`, `src/shared/ui/notice/noticesSlice.ts`, `NoticeRegion.tsx` | `src/app/noticeListener.test.ts`, `NoticeRegion.test.tsx` | Enforced |

No AD has no enforcement. AD-12 has no automated rule, so it is checked by hand in Part 2.

## Part 2: AD-12 regression check (Markdown Studio)

| Check | Result | Note |
|---|---|---|
| `/markdown.html` responds in dev | Passed (HTTP 200) | Checked 23 October 2026 with `vite` on port 5199, then stopped |
| `/api/list-markdown-files`, `/api/list-agents`, `/api/save-markdown` respond in dev | Passed (HTTP 200) | Same run |
| `netlify.toml`, `vercel.json` unchanged | Hash matches manifest | `_acl/_config/files-manifest.csv` |
| `api/*.js` unchanged | Hash matches manifest (3 files) | Same manifest |
| `public/markdown/**` unchanged | **Not confirmed**: `public/markdown/js/dashboard.js` differs from the manifest hash | See Part 3 |
| `public/markdown.html` unchanged | **Not confirmed**: differs from the manifest hash | See Part 3 |

## Part 3: Open findings for the Manager

1. **Protected files differ from the manifest (AD-12).** `public/markdown.html` (last modified 22 October 2026, 15:46) and `public/markdown/js/dashboard.js` (19:09) do not match `_acl/_config/files-manifest.csv`. The cause is not established. A Prettier `--write` run during Story 3.3 is one possibility, and I did not verify it. The ACL template copies (`ACL-ADLC-V1/src/public/markdown/`) have different hashes too, so they don't settle it either. A clean copy of each file is needed to restore or to accept the change.
2. **AD-10 build check fails.** `npm run build` fails because `public/markdown.html` contains the text "mockServiceWorker" in its own documentation. This is a false positive, but it blocks the quality and lighthouse CI jobs. It needs a decision on the scanner or the file.
3. **AD-9 e2e check fails.** `e2e/listing.spec.ts` "an out-of-stock Product is shown with its badge and filtered image" fails on desktop and mobile. The fixture (product 7, stock 0) is correct. The cause is not yet found.
4. **Traceability gap (NFR10).** Story 1.1 in `epics.md` names no FR or NFR, so `npm run trace` fails on it. The epics are an approved document, so this needs the Manager to decide.

## Part 4: Trace matrix result

`npm run trace` prints the FR-1 to FR-35 matrix, and every FR has at least one test file. FR-10 to FR-29 each have a unit, component or app test under `src/`. The run fails on the Story 1.1 gap in Part 3, item 4.
