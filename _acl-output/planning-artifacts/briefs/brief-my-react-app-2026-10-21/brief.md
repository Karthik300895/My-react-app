---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T09:55:55.323Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: "Product Brief: Simple Shopping Cart"
project_type: greenfield
created: "2026-10-21"
updated: "2026-10-21"
---

# Product Brief: Simple Shopping Cart

## Executive Summary

Simple Shopping Cart is a responsive web storefront. Shoppers can browse a product catalog, build a cart, and finish a simulated checkout that ends with an order confirmation. There are no accounts, no payment gateway and no stored orders. The scope stops at the moments every e-commerce product has to get right: finding a product, deciding to buy it, and checking out.

The product has two jobs. For shoppers, it is a fast, accessible and predictable buying flow. For the team, it is a **reference implementation of the ACL/BMAD delivery lifecycle**: every stage from this brief through PRD, architecture, UX, epics, stories, tests and deployment should be traceable in one small, finished codebase. The second job decides most priorities. The project succeeds if the documentation and the code agree and the architecture could support a real store, not if it sells anything.

The domain is deliberately familiar. Nobody has to learn a new business problem, so attention stays on delivery discipline: clean component boundaries, explicit state management, API integration with honest loading and error states, and test coverage.

## The Problem

**Developers and students learning the method:** most React tutorials stop at a to-do list or a single page. They rarely show how requirements turn into architecture, how architecture turns into stories, or how a real feature set (server data, client state, persistence, routing, forms) holds together. Learners copy patterns without seeing why those patterns exist. A complete small product with a full document trail is hard to find.

**Shoppers (the simulated end users):** the general shopping problems are well known. Carts lose their contents on refresh. Totals don't update. Out-of-stock items can be added anyway. Mobile layouts break. Loading and failure states leave users guessing. Each of these exists in V1 to show good handling, not to win a market.

## The Solution

A single-page web app with seven routes: Home, Product Listing, Product Details, Cart, Checkout, Order Confirmation and Not Found.

- **Find:** browse the catalog with keyword search, category filter and price sort. Every product shows its image, name, description, price and category.
- **Decide:** the product details page shows a large image, rating and stock availability. *Add to Cart* is disabled for unavailable products.
- **Manage cart:** add and remove items, increase or decrease quantity (never below 1), and clear the cart. Item count, subtotal and total recalculate immediately. The cart is saved to browser local storage and restored on refresh.
- **Check out:** review items, enter shipping details, review the order summary and confirm. Confirmation shows a success message and a mock order number, then clears the cart.
- **Be honest about state:** every remote call has explicit loading, empty and error states.

Product data is read-only and comes from a public mock API. Prices are static.

## What Makes This Different

This is not a commercial product, so it has no market moat. Its value as a learning artifact comes from three things:

1. **End-to-end traceability.** Each feature can be traced from brief to PRD requirement, architecture decision, story, code and test. Most sample apps have code with no reasoning behind it.
2. **Built to grow.** Folder structure, state boundaries and the API layer are designed so the listed future features (auth, payments, order history, admin) can be added without a rewrite.
3. **Small but finished.** The app has deliberately few features, and each one is built to production standard: accessibility, responsiveness, error handling, tests and linting.

## Who This Serves

| User | Need | Success looks like |
|---|---|---|
| **Learner developer / student** (primary) | A worked example of how a real React app is planned, structured and tested | Can explain *why* each architectural choice was made, and can add a feature by following the existing patterns |
| **Shopper** (simulated end user) | Find a product, buy it quickly, and not lose the cart | Finishes checkout on mobile or desktop without confusion |
| **Delivery reviewer / manager** | Evidence that the ACL phase gates produce consistent artifacts | Each phase document is approved, and the implementation matches it |

## Success Criteria

**Functional (all must pass for V1):** a user can browse, search, filter and sort products; view product details; add, update and remove cart items; complete a simulated checkout and get an order number; and refresh the page at any point without losing the cart.

**Quality targets** *[ASSUMPTION: the source states these qualitatively; numbers are proposed for PRD confirmation]*:
- Lighthouse Performance and Accessibility ≥ 90 on mobile.
- Meets WCAG 2.1 AA on all pages: keyboard navigable, labelled form controls, sufficient contrast.
- Usable from 360 px width up to desktop with no horizontal scroll.
- Automated tests cover the cart logic (totals, quantity rules, persistence) and the checkout flow. *[ASSUMPTION: coverage target for this logic is ≥ 80%]*
- Zero ESLint errors, with Prettier formatting enforced.

**Process:** every ACL phase artifact (brief → PRD → architecture → UX → epics → stories) is approved in sequence, and the shipped code traces back to them.

## Scope

**In V1:** product listing with search, category filter and price sort; product details with stock and rating; the cart with quantity rules, totals and local-storage persistence; simulated checkout with a shipping form, order summary, confirmation and mock order number; responsive layout; loading and error states; a Not Found page.

**Out of V1:** authentication and registration, payment gateway, order history and persistent orders, wishlist, reviews, coupons and discounts, inventory or product management, admin dashboard, shipping integration, notifications, internationalization.

**Constraints and assumptions:** the app is frontend only and assumes a network connection. The inventory is read-only and prices are static. Orders are never persisted beyond the confirmation screen.

## Open Questions

1. **Mock API choice.** The details page needs *stock availability*. DummyJSON returns `stock` and supports search, category and sort queries. Fake Store API has no stock field. *[ASSUMPTION: DummyJSON is preferred; the architecture phase confirms]*
2. **Search, filter and sort location.** Should these run on the server through API query parameters or on the client over a fetched list? This affects pagination and how the data layer is designed.
3. **Stock vs. cart quantity.** Should the cart cap quantity at the available stock, or only block items that are out of stock? The source only states the second rule.
4. **Shipping form validation.** Which fields are required, and what validation rules apply?
5. **Cart persistence on failure.** If a saved cart references a product the API no longer returns, or a price that has changed, what should the app do?

## Vision

If V1 succeeds, Simple Shopping Cart becomes the team's go-to teaching codebase for the ACL method. New engineers learn the lifecycle by reading its document trail and shipping one more feature through the full gate sequence. The future-enhancement backlog (authentication, wishlist, real payments, order history, admin dashboard, PWA, dark mode, i18n, recommendations) becomes a set of graded exercises. Each one tests whether the V1 architecture really allows extension without a rewrite.
