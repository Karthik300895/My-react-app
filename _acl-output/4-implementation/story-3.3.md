---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T14:13:39.334Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 3.3: Review and Confirm the Order'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 3-3-review-and-confirm-the-order
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-18
---

# Story 3.3: Review and Confirm the Order

## Intent

**Problem:** Step 3 is a placeholder, so the Shopper cannot review the order or place it.

**Approach:**
- **Summary step:** lists the Cart Items with quantities and line totals, the Order Total, and the Shipping Information, with the demo note. "Back" returns to Shipping, and "Edit cart" returns to the Cart.
- **Order number:** `createOrderNumber(now, random, issued)` builds `SSC-YYYYMMDD-XXXXXX` from an injected clock and randomness, and never returns an issued number (AD-15, FR28).
- **Placement:** the `placeOrder` thunk guards against repeats, builds the Order, and dispatches `orderPlaced` from `shared/model/events.ts` (AD-15).
- **Reducers:** `cart` empties through `orderPlaced`, and `checkout` records `lastOrder` and the issued number. The existing `CheckoutGuard` then sends the Shopper to `/order-confirmation` with `replace`.

## Boundaries & Constraints

**Always:**
- The order is built from the Cart's snapshot at the moment of placement (AD-13 snapshots).
- `cartCleared` is never dispatched on placement (AD-15). Only `orderPlaced` clears the Cart.
- Shared event and order types live in `shared/`, so features never import each other's internals (AD-1).
- Test titles start with the FR id.

**Ask First:** Any change to the order number format, or to what an Order records.

**Never:**
- Take payment, or show any payment field.
- Dispatch `cartCleared` from the placement path.

## Interpretation Choices

- **Placement is asynchronous:** there is no order service in the demo, so the thunk waits one macrotask before completing. That gives the Shopper a real "Placing order…" state, and the guard refuses a second placement while the first is running.
- **Repeat guard:** a second `placeOrder` while one is running does nothing. A `placeOrder` with an empty Cart does nothing either.
- **Order number randomness:** 6 characters drawn from `A–Z` and `0–9`. A collision with an issued number redraws, with a limit of 100 attempts that throws.
- **Shipping record:** the Order stores the shipping values as entered, with no trimming beyond what the schema applies.
- **Confirm action:** a single "Confirm purchase" button, disabled and labelled "Placing order…" while the order is being placed.

## Code Map

- `src/shared/model/order.ts`: `Order`, `OrderShipping` types.
- `src/shared/model/events.ts`: `orderPlaced` action.
- `src/features/checkout/model/orderNumber.ts`: `createOrderNumber`.
- `src/features/checkout/model/placeOrder.ts`: the `placeOrder` thunk.
- `src/features/checkout/model/checkoutSlice.ts`: `placing` status, `orderPlacing`, and `orderPlaced` handling.
- `src/features/cart/model/cartSlice.ts`: `orderPlaced` empties items.
- `src/features/checkout/ui/SummaryStep.tsx`: the summary and "Confirm purchase".
- `src/features/checkout/ui/CheckoutFlow.tsx`: renders `SummaryStep` in place of the placeholder.
- `src/features/checkout/index.ts`: exports the new public API.

## Tasks & Acceptance

- [x] FR26: step 3 shows Cart Items with quantities and line totals, the Order Total, and the Shipping Information, with the note "This is a demo store. No payment is taken."
- [x] FR26: the Shopper can go back to Shipping (Back or the progress step) and to the Cart ("Edit cart")
- [x] AD-15, FR28: `createOrderNumber` returns `SSC-YYYYMMDD-XXXXXX` with the local date and 6 uppercase alphanumerics, from injected clock and randomness, and never returns an issued number
- [x] FR27: "Confirm purchase" shows "Placing order…" with a spinner at once, and repeated clicks or Enter presses create exactly one Order
- [x] FR27: the thunk builds `Order { number, createdAt, items, shipping }` and dispatches `orderPlaced(order)` from `shared/model/events.ts`
- [x] FR27: `orderPlaced` empties `cart.items`, which the persistence listener writes to storage
- [x] FR28: `checkout` sets `lastOrder` and records the number in `issuedOrderNumbers`
- [x] AD-15: `cartCleared` is not dispatched on placement
- [x] The Shopper goes to `/order-confirmation` with `replace`, without a bounce to `/cart` in between (tested)
- [x] tsc, lint, Vitest and `vite build` pass

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added the Summary step, `createOrderNumber`, the `placeOrder` thunk with its repeat guard, the `orderPlaced` shared event, and the cart and checkout reducers that handle it. Known gap for Story 3.4: `lastOrder` stays set after a placement, so a later visit to Checkout redirects to the confirmation page until a new-order path clears it.
