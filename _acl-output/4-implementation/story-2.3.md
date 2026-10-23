---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T07:20:16.093Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 2.3: Clear the Cart'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 2-3-clear-the-cart
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-13
---

# Story 2.3: Clear the Cart

## Intent

**Problem:** A Shopper who wants to start over must remove each line by hand. There is no way to empty the Cart in one action.

**Approach:**
- **Reducer:** `cartCleared` empties `cart.items` (AD-3). It is reserved for this Shopper action (AD-15).
- **Trigger:** a Danger Ghost "Clear cart" button on the Cart page, shown only when the Cart has items.
- **Dialog:** a native `<dialog>` opened with `showModal()`, labelled by its title "Remove all N items from your cart?". [Cancel] has `autofocus`.
- **Focus:** Esc or Cancel closes the dialog and returns focus to the trigger. Confirming empties the Cart and moves focus to the empty-state `h2`.

## Boundaries & Constraints

**Always:**
- `cartCleared` is dispatched only from the Clear cart dialog. A test checks this.
- Test titles start with the FR id.
- The header count and the empty state follow from the cart state. Nothing else is updated by hand.

**Ask First:** Any change to the Remove flow from Story 2.2.

**Never:**
- Persist the Cart (Story 2.4).
- Dispatch `cartCleared` from anywhere but this dialog, including `placeOrder` (AD-15 uses `orderPlaced` instead).

## Interpretation Choices

- **Title pluralisation:** "Remove all 1 item from your cart?" for one item, "items" otherwise. N counts units (sum of quantities), matching the header's "Cart, N items".
- **Dialog content:** the title and the two buttons only. The spec gives no body text, so none is added.
- **Trigger focus on close:** closing with Esc or Cancel refocuses the "Clear cart" trigger. Confirming does not, because the trigger is gone once the Cart is empty.

## Code Map

- `src/features/cart/model/cartSlice.ts`: `cartCleared` reducer.
- `src/features/cart/ui/ClearCartDialog.tsx`: trigger button and native dialog.
- `src/features/cart/ui/CartContents.tsx`: renders the trigger, and moves focus to the empty heading after a clear.
- `src/features/cart/index.ts`: unchanged. `cartCleared` is deliberately not exported, so only the feature's own dialog can import it.

## Tasks & Acceptance

- [x] "Clear cart" is a Danger Ghost `<button>` on `/cart` when the Cart has items (FR15)
- [x] Activating it opens a native `<dialog>` via `showModal()`, labelled by its title "Remove all N items from your cart?" through `aria-labelledby` (UX-DR21)
- [x] [Cancel] has `autofocus`; [Clear cart] is the other action (UX-DR21)
- [x] Esc or Cancel closes the dialog, leaves the Cart unchanged, and returns focus to the trigger (FR15). Esc is verified by closing the dialog directly, since jsdom does not send key events; the native Esc path is not checked in a browser.
- [x] [Clear cart] dispatches `cartCleared`; the Cart empties, and focus moves to the empty-state `h2` (FR15, FR17). The header count reaching 0 follows from the cart state; it is not asserted by a dedicated test.
- [x] A test verifies that `cartCleared(` is called only from `ClearCartDialog.tsx` (AD-15)
- [x] tsc, Vitest and `vite build` pass (335 tests, run serially)

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added the `cartCleared` reducer, `ClearCartDialog` (native dialog, Cancel focused on open, focus restored on close), and tests including the AD-15 source scan. `ClearCartDialog` uses an explicit focus call and sets `autofocus` on Cancel, because React's `autoFocus` prop fires before a closed dialog opens.
