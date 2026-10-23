---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T14:19:50.350Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 3.4: See the Order Confirmation'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 3-4-see-the-order-confirmation
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-19
---

# Story 3.4: See the Order Confirmation

## Intent

**Problem:** `/order-confirmation` is an empty placeholder, and the checkout only remembers the Order number, not what was bought.

**Approach:**
- **Confirmation page:** shows "Order placed" in `display`, the Order Number in `mono` (wrapping at 320 px), the Order Total from `orderTotal(order.items)`, and a "Continue shopping" link to `/products`.
- **Remember the Order:** `lastOrder` keeps the whole placed Order, not only its number.
- **Guard:** `ConfirmationGuard` sends the Shopper to `/` when there is no `lastOrder` (FR29). Memory is lost on refresh, so a refresh also lands on Home.
- **New cart clears the order:** adding any Product clears `lastOrder` (AD-15). This closes the gap noted in Story 3.3, so Checkout works again for the next Cart.

## Boundaries & Constraints

**Always:**
- `lastOrder` is never cleared on unmount, so a StrictMode double-mount does not redirect away (AD-15).
- The header count shows 0 after placement, because the Cart is empty.
- Test titles start with the FR id.

**Ask First:** Any change to the confirmation copy or the redirect target.

**Never:**
- Persist `lastOrder` to storage (NFR6).
- Let `features/checkout` reach into `features/cart` internals (AD-1). Use the cart's public index.

## Interpretation Choices

- **Order Total on the page:** computed from the stored Order's items with `orderTotal`, not stored as a separate value (AD-3).
- **Refresh:** a refresh loses `lastOrder`, so the Shopper is sent Home. This is the FR29 rule. It means the confirmation cannot be revisited after a reload.
- **Clearing on add:** only `itemAdded` clears `lastOrder`. Quantity changes and removals do not, because they cannot happen without a Cart item already in place.

## Code Map

- `src/features/checkout/model/checkoutSlice.ts`: `lastOrder` holds the full Order; `itemAdded` clears it.
- `src/features/checkout/ui/ConfirmationGuard.tsx`: redirects to `/` when there is no order.
- `src/features/checkout/ui/OrderConfirmation.tsx`: the confirmation content.
- `src/pages/OrderConfirmationPage.tsx`: wraps the content in the guard and the page title.
- `src/features/checkout/index.ts`: exports the new public API.

## Tasks & Acceptance

- [x] FR28, UX-DR28: `/order-confirmation` shows "Order placed" in `display`, the Order Number in `mono` (wrapping at 320 px), the Order Total, and a "Continue shopping" link to `/products`
- [ ] FR28: the header count shows 0 after placement (not covered by a test in this story)
- [x] FR29: `ConfirmationGuard` redirects to `/` with no `lastOrder`, including after a refresh
- [x] AD-11: with a `lastOrder`, opening `/checkout` redirects to `/order-confirmation`
- [x] AD-15: adding any Product clears `lastOrder`, and `/checkout` works for the new Cart
- [ ] AD-15: `lastOrder` survives an unmount and remount of the confirmation page (not covered by a test in this story)
- [x] UJ-3: a component test runs Cart → Review → Shipping (with an invalid postal code, then fixed) → Summary → Confirm, and checks the Order Number, the Order Total, and that the Cart and storage are empty
- [x] tsc, Vitest and `vite build` pass

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added the Order Placed confirmation with Order Number, Order Total and Continue shopping, ConfirmationGuard (FR29), and lastOrder now keeps the whole Order and is cleared by itemAdded (AD-15). Tests: confirmation page, state rules, route redirect, and the UJ-3 journey. The 3.3 gap is closed. Known limit: a refresh clears the order and sends the Shopper Home, per FR29.
