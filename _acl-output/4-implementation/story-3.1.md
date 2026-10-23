---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T13:46:15.611Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 3.1: Start Checkout and Review Items'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 3-1-start-checkout-and-review-items
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-16
---

# Story 3.1: Start Checkout and Review Items

## Intent

**Problem:** The Cart has no way forward. `/checkout` is a placeholder, so the Shopper cannot check the order before entering details.

**Approach:**
- **Checkout slice:** `features/checkout/model/` holds `{ step, shippingDraft, lastOrder, issuedOrderNumbers }` (AD-2). It is never persisted (AD-4).
- **Guard:** `CheckoutGuard` wraps `/checkout`. An empty Cart with no `lastOrder` redirects to `/cart` with a reason. The Cart page raises the Notice in an effect (AD-11).
- **Review step:** lists the Cart's items read-only, with Quantity and Line Total, plus the Order Total and an "Edit cart" link. "Continue to shipping" moves to step 2.
- **Progress and panel:** an ordered progress list. A sticky Order Total panel from `lg`, and a disclosure below `lg`.
- **Focus:** on each step change, focus moves to that step's `h2`.

## Boundaries & Constraints

**Always:**
- The step lives only in `checkout.step`, never in the URL (AD-11).
- The checkout slice is never written to storage. A test checks this.
- `checkout` may import from `cart` only through `features/cart` (AD-1).
- The guard redirects with `<Navigate replace state={{ reason }}>`. The page raises the Notice in an effect, not during render.
- Test titles start with the FR id.

**Ask First:** Any change to the Review content, or to the redirect reason.

**Never:**
- Build the Shipping form or Summary step here (Stories 3.2 and 3.3).
- Place an order (AD-15 belongs to Story 3.3).

## Interpretation Choices

- **Shipping step in this story:** "Continue to shipping" moves to step 2. Step 2 is a placeholder `h2` only, which Story 3.2 replaces.
- **Progress for later steps:** completed steps are buttons that return to that step. Steps not yet reached are plain text. Only Review can be current in this story.
- **Focus on mount:** the route-level rule focuses the page `h1`. The step `h2` takes focus only when the step changes, not on the first render.
- **Disclosure label:** "Show items" reveals the item rows below `lg`. The label itself does not change.

## Code Map

- `src/features/checkout/model/checkoutSlice.ts`: state, `checkoutStarted`, `stepChanged`.
- `src/features/checkout/ui/CheckoutGuard.tsx`: redirect logic.
- `src/features/checkout/ui/CheckoutProgress.tsx`: ordered list with `aria-current`.
- `src/features/checkout/ui/ReviewStep.tsx`: read-only items, Order Total, Edit cart, Continue.
- `src/features/checkout/ui/OrderTotalPanel.tsx`: sticky panel from `lg`, disclosure below.
- `src/features/checkout/ui/CheckoutFlow.tsx`: composes the steps and moves focus on change.
- `src/features/checkout/index.ts`: public API.
- `src/app/store.ts`: registers the `checkout` reducer.
- `src/pages/CheckoutPage.tsx`: guard, start, and flow.
- `src/pages/CartPage.tsx`: raises the empty-cart Notice from a redirect reason.

## Tasks & Acceptance

- [x] The `checkout` slice holds `{ step, shippingDraft, lastOrder, issuedOrderNumbers }` and is not persisted, which a test asserts against `localStorage` after checkout actions (AD-4, NFR6)
- [x] `CheckoutGuard` redirects an empty Cart to `/cart` with `replace` and a reason, and the Cart page raises "Your cart is empty, so there's nothing to check out yet." in an effect (FR23)
- [x] With items in the Cart, Checkout opens at step 1, Review, regardless of an earlier step (UX-DR27)
- [x] The progress reads "Review · Shipping · Summary" as an ordered list, with `aria-current="step"` on Review (UX-DR16)
- [x] Review lists each item read-only with Quantity and Line Total, the Order Total, and an "Edit cart" link to `/cart` (FR24)
- [x] "Continue to shipping" moves to step 2 (a placeholder heading until Story 3.2)
- [x] Each step change moves focus to that step's `h2`; the step is never in the URL
- [x] From `lg`, a sticky panel shows the items and the Order Total, with no Checkout button; below `lg`, "Order total $X" and a "Show items" disclosure with `aria-expanded` (UX-DR10). The sticky and column classes are not measured in a browser.
- [x] With the catalog unavailable, Checkout still works from the Cart's snapshot prices (UX-DR27). The page does not call the catalog; the test covers the snapshot prices only.
- [x] tsc, Vitest and `vite build` pass (383 tests, run serially)

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added the checkout slice (never persisted), the guard, the progress list, the Review step, the order-total panel, and the empty-cart redirect Notice. The shipping step is a placeholder heading until Story 3.2.
