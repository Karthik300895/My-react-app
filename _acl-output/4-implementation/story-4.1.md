---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T14:43:21.793Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 4.1: Verify the Core Journeys End to End'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 4-1-verify-the-core-journeys-end-to-end
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-20
---

# Story 4.1: Verify the Core Journeys End to End

## Intent

**Problem:** The four Shopper journeys are only covered by component tests. Nothing runs them in a real browser, at the reference widths, with accessibility checks.

**Approach:**
- **Journey specs:** `e2e/uj-1-find-and-add.spec.ts`, `uj-2-cart-persists.spec.ts`, `uj-3-checkout.spec.ts`, `uj-4-resilience.spec.ts`, run against the dev server with MSW (AD-10).
- **Accessibility:** `e2e/a11y.spec.ts` runs `@axe-core/playwright` on each page at 320, 390 and 1280 px, and fails on any critical or serious violation.
- **Keyboard checkout:** a variant of UJ-3 that completes checkout with Tab, Enter and Space only.
- **No live API:** the specs never reach DummyJSON. Failures are simulated by routing requests in Playwright.

## Boundaries & Constraints

**Always:**
- Specs use the existing MSW fixtures. Nothing calls `https://dummyjson.com`.
- Selectors use role, label or visible text, not CSS class names.
- Test titles start with the FR or UJ id.

**Ask First:** Any change to a journey's steps, or to the axe rule set.

**Never:**
- Weaken an axe check to make a page pass. Report the violation instead.
- Change app code to suit a spec. Specs adapt to the app, or the mismatch is reported.

## Interpretation Choices

- **Network failure:** done with `page.route` on `https://dummyjson.com/**`, because MSW's `server.use` is not available in the browser.
- **Axe scope:** the Home, Listing, Details, Cart, the three Checkout steps, Confirmation and Not Found pages. The Notice and Clear-cart dialog states are checked where the journey opens them.
- **Keyboard variant:** the journey's form is completed with the keyboard. The page scope is the checkout steps that Story 3.x built.

## Code Map

- `e2e/uj-1-find-and-add.spec.ts`: Home → Listing → Details → Add to Cart → header count 1.
- `e2e/uj-2-cart-persists.spec.ts`: add → reload → Cart intact → increase, remove → totals.
- `e2e/uj-3-checkout.spec.ts`: Cart → Review → Shipping (invalid postal code, then fixed) → Summary → Confirm → header 0 → reload goes Home.
- `e2e/uj-4-resilience.spec.ts`: listing network error → Retry; the removed-product Notice; a network error keeps the Cart.
- `e2e/a11y.spec.ts`: axe on each page at three widths.

## Tasks & Acceptance

- [x] `uj-1` passes at 320, 390 and 1280 px
- [x] `uj-2` passes at 320, 390 and 1280 px
- [x] `uj-3` passes, including the invalid postal code fix, and the header count is 0 after Confirm
- [x] `uj-3` keyboard variant completes checkout using Tab, Enter and Space only
- [x] `uj-4` passes: Retry after a listing error succeeds, and a network error never empties the Cart
- [x] `a11y` reports zero critical or serious violations on each listed page at each width
- [x] No spec calls the live DummyJSON API
- [x] The results of `npm run test:e2e` are reported as they are, with any failures named

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Journey specs UJ-1, UJ-2, UJ-3 (with keyboard variant), UJ-4 and the axe spec added. Fixes: the UJ-4 retry is scoped to the Products region (categories also fail), and the service worker is blocked in UJ-4 so the aborted and empty responses reach the network layer. Playwright result: 98 passed, 2 failed. The 2 failures are listing.spec.ts "an out-of-stock Product is shown with its badge" on desktop and mobile. That spec predates this story and is not changed by it; its cause is not yet found.
