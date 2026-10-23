---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-22T13:56:01.665Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 3.2: Enter Shipping Information'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-22'
story_key: 3-2-enter-shipping-information
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/planning-artifacts/epics.md'
  - '{project-root}/_acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md'
jira_key: KAN-17
---

# Story 3.2: Enter Shipping Information

## Intent

**Problem:** Step 2 is a placeholder, so the Shopper cannot give a shipping address before the order is reviewed.

**Approach:**
- **Schema:** `shippingSchema` (zod) in `features/checkout/model/` validates the nine fields (FR25).
- **One form:** a single react-hook-form instance is owned by `CheckoutPage` and spans every step (AD-2). Its values are copied to `checkout.shippingDraft` on each step change and when the page unmounts. The form starts from `shippingDraft`.
- **Shipping step:** a single-column form, with labels, `autocomplete` attributes, inline errors on blur, and a "Review order" action that validates before advancing to Summary.
- **Summary:** step 3 is a placeholder heading. Story 3.3 builds it.

## Boundaries & Constraints

**Always:**
- The form values live only in memory. They are never written to storage (NFR6, AD-4).
- Validation runs through the zod schema, not hand-written rules (AD-2, the Validation rule).
- Error text is written for the Shopper and names the fix.
- Test titles start with the FR id.

**Ask First:** Any change to the field list or the validation rules.

**Never:**
- Place an order or build the Summary (Story 3.3).
- Store the draft through the cart's persistence path.

## Interpretation Choices

- **Validation timing:** errors show on blur (react-hook-form `mode: 'onBlur'`). After a failed "Review order", fields re-validate as the Shopper edits.
- **Phone:** 7 to 15 digits. Spaces, hyphens, parentheses, dots and a leading "+" are allowed as formatting.
- **Postal code:** 3 to 10 letters or digits, with no spaces, so it matches the spec's "alphanumeric" rule.
- **Summary line:** "Fix N fields to continue" with N equal to the number of invalid fields, announced in a status region.
- **Focus on failure:** focus moves to the first invalid field in form order.

## Code Map

- `src/features/checkout/model/shippingSchema.ts`: zod schema, field order, and messages.
- `src/features/checkout/model/checkoutSlice.ts`: `shippingDraftSaved` action, and `ShippingDraft` typed from the schema.
- `src/features/checkout/ui/ShippingStep.tsx`: the form, with labels, autocomplete, errors, and the Review order action.
- `src/features/checkout/ui/CheckoutFlow.tsx`: takes the form and renders the shipping and summary steps.
- `src/pages/CheckoutPage.tsx`: owns the form, saves the draft on step change and unmount.
- `src/features/checkout/index.ts`: exports the new public API.

## Tasks & Acceptance

- [x] Step 2 shows a single-column form, within `max-w-[var(--spacing-form-max)]`, with full name, email, phone, address line 1, address line 2 (optional), city, state or region, postal code and country (FR25). The width is checked in the class list, not in a browser.
- [x] Each field has a visible `<label>`, required fields say "required" in text, and each field carries its `autocomplete` attribute (UX-DR17)
- [x] `shippingSchema` requires non-empty required fields, a well-formed email, 7 to 15 phone digits, and a 3 to 10 character alphanumeric postal code (FR25)
- [x] An invalid field shows its error below it, with an icon and fix-it text; the input has `aria-invalid="true"` and `aria-describedby` pointing at the error (FR25)
- [x] "Review order" with invalid fields keeps the step, shows "Fix N fields to continue", and moves focus to the first invalid field (FR25)
- [x] One react-hook-form instance owned by `CheckoutPage` spans all steps; values are copied to `checkout.shippingDraft` on step change and on unmount, and the form starts from `shippingDraft` (AD-2). The save effects depend on the stable `getValues`, not the form object.
- [x] Values persist within the session across steps and "Edit cart" and back, and are never written to `localStorage` (NFR6)
- [x] Valid input and "Review order" advance the step to Summary (a placeholder heading until Story 3.3)
- [x] tsc, Vitest and `vite build` pass (397 tests, run serially)

## Spec Change Log

- 2026-10-22: Story file created as the greenfield per-story gate, status In Review.
- 2026-10-22: Implemented. Added the zod shipping schema and field metadata, the shipping step with a react-hook-form instance owned by `CheckoutPage`, the draft save on step change and unmount, and the Summary placeholder. The schema is exported through the checkout public index so the page does not import a model file directly.
