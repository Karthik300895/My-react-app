---
title: 'Story 2.4: Keep the Cart Across Visits'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
status: 'In Review'
story_key: 2-4-keep-the-cart-across-visits
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
---

# Story 2.4: Keep the Cart Across Visits

## Intent

**Problem:** A refresh or a later visit empties the Cart, so a Shopper loses what they picked.

**Approach:** Persist only `cart.items`, under `localStorage["ssc.cart.v1"]`, as `{ version: 1, items }` (AD-4).
- **Storage boundary:** `shared/lib/storage.ts` is the only module that touches `localStorage`. Every call is wrapped so a throw becomes a no-op or `null`.
- **Envelope:** `features/cart/model/persistence.ts` owns the key, the zod schema, and the parse. Anything malformed, of an unknown version, or failing validation loads as an empty Cart.
- **Listener:** `src/app/cartPersistence.ts` writes after any action that changes `cart.items`.
- **Preload:** the app store is created from the parsed stored items. The stored value is read synchronously at import, so there is no extra render delay.

## Boundaries & Constraints

**Always:**
- Only `cart.items` is written. `notices` and `checkout` are never written, and no Shipping Information is stored (NFR6).
- Reads and writes go through `shared/lib/storage.ts` (AD-4).
- Storage errors never reach the UI. The Cart keeps working for the session.
- Test titles start with the FR id.

**Ask First:** Any change to the envelope shape or key, since it would break stored Carts. Bumping `version` is the planned route.

**Never:**
- Sync between tabs (V1). The last write wins, and a test documents this.
- Reconcile the Cart with the catalog (Story 2.5).

## Interpretation Choices

- **Preload point:** the app's singleton `store` is created with the parsed Cart. `makeStore()` stays empty so tests are isolated.
- **Validation rules:** each item needs a positive integer `productId`, a non-empty `title`, a `thumbnail` string, non-negative integer `unitPriceCents` and `stock`, and an integer `quantity` from 1 to `stock`. `productId`s must be unique. Any failure loads an empty Cart.
- **Blocked storage:** `readStorage` returns `null` and `writeStorage` does nothing when storage throws.

## Code Map

- `src/shared/lib/storage.ts`: `readStorage(key)`, `writeStorage(key, value)`, both guarded.
- `src/features/cart/model/persistence.ts`: `CART_STORAGE_KEY`, the zod envelope, `loadCart()`, `saveCart(items)`.
- `src/app/cartPersistence.ts`: `cartPersistenceMiddleware` with a listener that writes when `cart.items` changes.
- `src/app/store.ts`: `makeStore(items?)`, the listener middleware registered, and `store = makeStore(loadCart())`.
- `src/features/cart/index.ts`: exports `loadCart` and `saveCart`.

## Tasks & Acceptance

- [x] After any action that changes `cart.items`, `localStorage["ssc.cart.v1"]` holds `{ version: 1, items }` (FR19)
- [x] Only `cart.items` is written: no `notices`, no `checkout`, and no Shipping Information keys (NFR6)
- [x] `shared/lib/storage.ts` is the only module that touches `localStorage` (AD-4). It is the only file that calls `window.localStorage`; this was checked by reading the source, not by a test.
- [x] A valid stored Cart preloads the store after zod validation, with the same items and Quantities (FR20). Totals are pure functions of the items, so they match; no separate total assertion was added.
- [x] Malformed JSON, an unknown `version`, or failed validation loads an empty Cart with no crash or error page (FR22)
- [x] `localStorage` throwing on read or write leaves the Cart working for the session (FR22)
- [x] Two tabs: the last write wins, and V1 does not sync between tabs (documented in a test)
- [x] tsc, Vitest and `vite build` pass (352 tests, run serially)

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added the guarded storage module, the zod envelope and parse, the persistence listener, and the preloaded app store. Tests cover the envelope, every FR22 failure path, blocked storage, and the two-tab behaviour.
