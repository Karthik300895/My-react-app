---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T07:13:36.905Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 2.2: Manage Quantities on the Cart Page'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 2-2-manage-quantities-on-the-cart-page
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-12
---

# Story 2.2: Manage Quantities on the Cart Page

## Intent

**Problem:** `/cart` is a placeholder. Shoppers who added Products cannot review them, change quantities, or remove items, and the Cart has no totals.

**Approach:**
- **Reducers:** `quantityIncremented`, `quantityDecremented`, `itemRemoved` in the `cart` slice (AD-3). Clamps are silent: quantity stays within 1..Stock.
- **Totals:** `lineTotal`, `itemCount`, `subtotal`, `orderTotal` as pure functions in `features/cart/model/totals.ts`. `orderTotal` equals `subtotal` for now. Nothing is stored.
- **Cart page:** lines (`CartLine`), a Quantity Stepper, Remove, a Cart Summary, and an empty state, all in `features/cart/ui/`. The page in `pages/CartPage.tsx` composes them.
- **Live totals:** a single `aria-live="polite"` region wraps the totals.

## Boundaries & Constraints

**Always:**
- Totals are never stored in state (AD-3).
- Money goes through `formatMoney()` and integer cents.
- Stepper reasons are visible text, linked by `aria-describedby`, never tooltips.
- Disabled controls follow the shared disabled contract from Story 2.1 (`aria-disabled`, still focusable, early return on click).
- Test titles start with the FR id.

**Ask First:** Any change to the Notice behaviour from Story 2.1.

**Never:**
- Persist the Cart (Story 2.4) or reconcile it with the catalog (Story 2.5).
- Build Checkout or Clear Cart (Stories 2.3 and Epic 3). The *Checkout* link points to `/checkout`, which is a placeholder for now.

## Interpretation Choices

- **Decrease at 1:** the Stepper stays focusable with `aria-disabled`, and "Minimum 1" is visible text.
- **Increase at Stock:** the Stepper stays focusable with `aria-disabled`, and "Only N available" is visible text, N being the Cart Line's `stock`.
- **Focus after Remove:** the next line's Remove button, or the previous one if the removed line was last. If the Cart is now empty, focus moves to the empty-state `h2`.
- **Remove button name:** visible text "Remove", with the title in screen-reader text, so the accessible name is "Remove {title}".

## Code Map

- `src/features/cart/model/cartSlice.ts`: new reducers.
- `src/features/cart/model/totals.ts`: `orderTotal`.
- `src/features/cart/ui/`: `CartLine.tsx`, `QuantityStepper.tsx`, `CartSummary.tsx`, `EmptyCart.tsx`, `CartContents.tsx`.
- `src/features/cart/index.ts`: export `CartContents`.
- `src/pages/CartPage.tsx`: heading, document title, `CartContents`.

## Tasks & Acceptance

- [x] Each Cart Line shows a thumbnail (64 px, 96 px from `sm`), the title linking to Product Details, the unit price, the Quantity Stepper, the Line Total and a Remove button (FR12, UX-DR9)
- [x] The Cart Summary shows Item Count, Cart Subtotal, "Shipping: Free", Order Total and a full-width *Checkout* link to `/checkout`; sticky on the right from `lg`, stacked below (UX-DR10)
- [x] `lineTotal`, `itemCount`, `subtotal` and `orderTotal` are pure, in integer cents; `orderTotal` equals `subtotal`; 3 × $19.99 shows as "$59.97" (FR16)
- [x] Increase and decrease change Quantity by 1; totals and header count update together; totals sit in an `aria-live="polite"` region (FR12)
- [x] Decrease disabled at 1 with visible "Minimum 1"; increase disabled at Stock with visible "Only N available" linked by `aria-describedby` (FR13)
- [x] Remove deletes the line immediately with no confirmation; totals update; focus moves to the next Remove, or the previous one (FR14)
- [x] Empty Cart shows `h2` "Your cart is empty.", the body "Find something you like in the shop.", and a "Start shopping" button to `/products`; no Checkout offered; focus moves to the `h2` after the last item is removed (FR17)
- [ ] Lines stack below `sm`; no horizontal scroll at 320 px; 44 px touch targets. Not verified in a browser: the classes are in place, but the layout was not measured.
- [x] tsc, Vitest and `vite build` pass (329 tests, run serially; see the change log)

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added reducers for increment, decrement and remove, `orderTotal`, the cart UI and the Cart page, and tests for each. Remove buttons carry an explicit `aria-label` so the name reads "Remove {title}". Two route and lint tests are timing-sensitive under parallel load: they fail in the parallel run and pass serially (329 of 329).
