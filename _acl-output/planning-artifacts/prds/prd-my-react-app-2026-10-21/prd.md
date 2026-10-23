---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T15:07:23.312Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: "PRD: Simple Shopping Cart"
created: "2026-10-21"
updated: "2026-10-21"
confluence_page_id: 819217
---

# PRD: Simple Shopping Cart

## 0. Document Purpose

This PRD defines **what** Simple Shopping Cart V1 must do. It is written for the Manager who signs off on it and for the people who run the next phases: UX (`acl-ux`), architecture (`acl-architecture`), and epics and stories (`acl-create-epics-and-stories`). It builds on the approved [Product Brief](../../briefs/brief-my-react-app-2026-10-21/brief.md) and does not repeat it.

How to read it:

- Terms defined in the §3 Glossary are used with exactly that meaning everywhere else.
- Features are grouped in §4. Each functional requirement has a stable global ID (FR-1 to FR-35) and a list of testable consequences.
- Non-functional requirements that apply to the whole system are in §5.
- Inferred decisions are tagged inline as `[ASSUMPTION]` and listed together in §11.
- Technology choices (libraries, API endpoints, state tooling) are kept out of this PRD and are decided in the architecture spine.

## 1. Vision

Simple Shopping Cart is a responsive web storefront. A Shopper can find a Product, decide to buy it, and complete a simulated Checkout that ends with an Order Number. Payment, accounts and stored orders are out of scope by design. Every remaining step should feel immediate and dependable: totals update instantly, the Cart survives a page refresh, the app never lets you add something that isn't available, and loading and errors are always shown clearly.

The app is also the team's **reference implementation of the ACL delivery lifecycle**. Every behavior in this PRD should be traceable forward into an architecture decision, a story, code and a test. When a choice involves a trade-off, the version that teaches a durable pattern wins over the clever shortcut. **Of the product's two jobs, the reference-implementation job takes priority** (as the approved brief states). The Learner developer is the primary user, and the Shopper experience is the means of teaching. "ACL" here refers to the team's adaptation of the BMAD Method.

## 2. Target User

### 2.1 Jobs To Be Done

- **Shopper (functional):** "Help me find something specific quickly and buy it without fuss, on my phone or laptop."
- **Shopper (emotional):** "Don't make me lose work. If I refresh or come back later, my Cart should still be there."
- **Learner developer (functional):** "Show me how a real React app is planned, structured and tested, so I can copy the pattern rather than the code."
- **Learner developer (contextual):** "Let me add a feature by following the existing conventions and the document trail, without reverse-engineering intent."
- **Delivery reviewer (functional):** "Give me evidence that each approved phase document is reflected in what shipped."

### 2.2 Non-Users (V1)

- Store operators or admins. No product, inventory or order management.
- Returning customers who expect an account, saved addresses or order history.
- Anyone expecting to make a real purchase or payment.

### 2.3 Key User Journeys

*[ASSUMPTION: Fast path. These journeys were inferred from the brief and the context document, not narrated by the user. Please confirm or correct them.]*

- **UJ-1. Ananya finds a gift on her phone between meetings.**
  Ananya is a working professional with five minutes to spare. On her phone she opens the Home page and taps through to the Product Listing. She searches "watch", filters to the *mens-watches* Category, and sorts by price, low to high. She opens the second result, checks the rating and that it is *In Stock*, and taps *Add to Cart*. The header's Item Count goes from 0 to 1 straight away, and she closes the tab.
  **Edge case:** her search returns nothing. She sees a clear "no products match" state with a one-tap way to clear the filters.

- **UJ-2. Ananya comes back that evening and her Cart is still there.**
  She opens the site on the same phone browser. The Cart still holds the watch. She adds a second Product, increases the watch's Quantity to 2, then removes the second Product. The Cart Subtotal and Item Count update with each tap.
  **Edge case:** the minus button is disabled at a Quantity of 1, and the plus button is disabled at the Product's Stock.

- **UJ-3. Ananya checks out.**
  From the Cart she taps *Checkout* and reviews the Cart Items. She enters her Shipping Information; inline validation flags a malformed postal code before she continues. She reviews the Order Summary (items, Quantities, Order Total, shipping address) and taps *Confirm Purchase*. The Order Confirmation page shows a success message and an Order Number such as `SSC-20261021-4F7K2Q`. The header's Item Count drops to 0.
  **Edge case:** she refreshes the confirmation page. The order was never stored, so she is sent to Home rather than shown a broken page.

- **UJ-4. Ananya hits a flaky network.**
  The Product Listing request fails. Instead of a blank screen she sees an error message with a *Retry* button, and it works on the second try. Later, a Product she saved in her Cart yesterday is no longer returned by the catalog. When the Cart loads, it removes that item and tells her why.

- **UJ-5. Ravi, a junior developer, ships his first feature on the codebase.**
  Ravi is three weeks into the team. He is asked to add "sort by rating". He reads FR-4 in this PRD, follows it to the architecture decision on where sorting happens, finds the story and its tests, and extends the existing sort control and its test without touching the Cart code. His pull request passes lint, type checks and tests on the first push.

## 3. Glossary

- **Catalog** — The full read-only set of Products provided by the Product API.
- **Product** — An item for sale. It has an id, title, description, price, Category, rating, Stock, a primary image, and optionally more images.
- **Category** — A named grouping of Products. Each Product belongs to exactly one Category.
- **Stock** — The number of units of a Product that are available, as reported by the Product API.
- **Available / Unavailable** — A Product is *Available* when its Stock is greater than 0, and *Unavailable* otherwise.
- **Product Listing** — The page that shows Product Cards with search, Category filter and price sort.
- **Product Card** — The compact view of one Product in the Product Listing: image, title, short description, price, Category and an *Add to Cart* action.
- **Product Details** — The page that shows everything about a single Product.
- **Cart** — The Shopper's collection of Cart Items. There is one Cart per browser, and it is kept in Local Storage.
- **Cart Item** — One Product in the Cart together with its Quantity. A Product appears in the Cart at most once.
- **Quantity** — The number of units of a Product in a Cart Item. It is an integer from 1 to the Product's Stock.
- **Line Total** — A Cart Item's price multiplied by its Quantity. The price is the Product's current Catalog price once the Cart has been reconciled (FR-21). Before that, it is the price stored when the item was added.
- **Cart Page** — The page where the Shopper reviews and changes Cart Items.
- **Header Cart Indicator** — The header element that shows the Item Count and links to the Cart Page.
- **Notice** — A non-blocking message to the Shopper that is announced to assistive technology and can be dismissed. Used whenever the app changes the Cart on the Shopper's behalf.
- **Item Count** — The sum of the Quantities of all Cart Items.
- **Cart Subtotal** — The sum of all Line Totals.
- **Order Total** — The amount the Shopper "pays". In V1 it equals the Cart Subtotal (no tax and free shipping). *[ASSUMPTION]*
- **Checkout** — The simulated purchase flow: review the Cart, enter Shipping Information, review the Order Summary, then confirm.
- **Shipping Information** — The delivery details the Shopper enters during Checkout.
- **Order Summary** — A read-only review of the Cart Items, Order Total and Shipping Information, shown before the Shopper confirms.
- **Order** — The result of a confirmed Checkout. It exists only in memory, only long enough to show the Order Confirmation.
- **Order Number** — A mock identifier generated for each Order.
- **Order Confirmation** — The page shown after a successful Checkout.
- **Local Storage** — The browser's per-origin persistent key-value store.
- **Product API** — The external mock service that provides the Catalog (DummyJSON; see the architecture spine).
- **Shopper** — Anyone using the storefront. There are no accounts.

## 4. Features

### 4.1 Product Listing

**Description:** The Product Listing is the main way Shoppers browse. It shows Product Cards in a responsive grid. A search box, a Category filter and a price sort can be combined freely, and the results update without a full page reload. The current search, Category and sort are reflected in the URL, so a filtered view can be bookmarked, shared or restored with the browser's Back button. Realizes UJ-1 and UJ-4.

#### FR-1: View Product Listing

A Shopper can view the Catalog as a grid of Product Cards. Realizes UJ-1.

**Consequences (testable):**
- Each Product Card shows the image, title, a truncated description, the price formatted as currency, the Category and an *Add to Cart* action.
- Every product image has meaningful alt text derived from the Product title.
- Selecting a Product Card's image or title opens that Product's Product Details.
- The listing is paginated with a page size of 20. *[ASSUMPTION: page size and the choice of pagination over infinite scroll]*

#### FR-2: Search Products

A Shopper can filter the Product Listing by a free-text keyword. Realizes UJ-1.

**Consequences (testable):**
- Matching is case-insensitive against the Product title and description.
- Search runs at most once per 300 ms pause in typing (debounced). Pressing Enter runs it immediately.
- Clearing the search box restores the unfiltered listing, with any Category filter and sort still applied.

#### FR-3: Filter by Category

A Shopper can limit the Product Listing to one Category. Realizes UJ-1.

**Consequences (testable):**
- The list of Categories comes from the Product API, not from a hard-coded list.
- An "All categories" option removes the filter.
- Only one Category can be selected at a time. *[ASSUMPTION]*

#### FR-4: Sort by Price

A Shopper can sort the Product Listing by price, ascending or descending. Realizes UJ-1 and UJ-5.

**Consequences (testable):**
- The options are *Relevance / default*, *Price: low to high* and *Price: high to low*.
- The sort applies across the whole result set, not just the current page.

#### FR-5: Combine and Preserve Listing Criteria

Search, Category filter and sort can be used together, and the URL reflects them. Realizes UJ-1.

**Consequences (testable):**
- Any combination of search + Category + sort returns only the Products that match every active criterion, in the chosen order.
- Reloading the page or opening the URL in a new tab reproduces the same criteria and results.
- Changing any criterion resets pagination to page 1.

#### FR-6: Empty Results State

When the criteria match no Products, the Shopper sees an explicit empty state. Realizes UJ-1.

**Consequences (testable):**
- The empty state names the active criteria and offers a single *Clear filters* action.

### 4.2 Product Details

**Description:** Product Details gives the Shopper what they need to decide: a large image, the full description, price, rating and Stock, plus *Add to Cart*. It can be reached from a Product Card or by direct URL. Realizes UJ-1.

#### FR-7: View Product Details

A Shopper can view a single Product at its own URL. Realizes UJ-1.

**Consequences (testable):**
- The page shows a large image, title, full description, price, Category, rating (numeric value, plus a visual indicator with an accessible text equivalent) and Stock availability.
- The page works when opened directly by URL, not only when reached from the listing.
- The browser tab title includes the Product title.

#### FR-8: Show Stock Availability

A Shopper can see whether a Product is Available. Realizes UJ-1.

**Consequences (testable):**
- An Available Product shows "In stock". When Stock is between 1 and 5, it shows "Only N left". *[ASSUMPTION: low-stock threshold of 5]*
- An Unavailable Product shows "Out of stock".
- Availability is shown in text, not by color alone.

#### FR-9: Product Not Found

If a Product id does not exist, the Shopper sees a Product-specific not-found state, not a crash or an empty layout.

**Consequences (testable):**
- An unknown or malformed Product id shows "Product not found" with a link back to the Product Listing.

### 4.3 Cart

**Description:** The Cart holds what the Shopper intends to buy. It can be changed from Product Cards, Product Details and the Cart page. Every change updates the Line Totals, Item Count and Cart Subtotal at once, with no manual refresh and no network round-trip. A Cart indicator in the header shows the Item Count on every page. Realizes UJ-1 and UJ-2.

#### FR-10: Add Product to Cart

A Shopper can add an Available Product to the Cart from a Product Card or from Product Details. Realizes UJ-1.

**Consequences (testable):**
- Adding a Product that is not yet in the Cart creates a Cart Item with Quantity 1.
- Adding a Product that is already in the Cart increases that Cart Item's Quantity by 1, up to the Stock limit (FR-13).
- The Shopper gets non-blocking feedback (for example, a toast or the header count changing) that is announced to screen readers through a live region.

#### FR-11: Prevent Adding Unavailable Products

A Shopper cannot add an Unavailable Product to the Cart.

**Consequences (testable):**
- For an Unavailable Product, *Add to Cart* is disabled on both the Product Card and Product Details, and the reason ("Out of stock") is shown.
- If the Product is already in the Cart at its Stock limit, *Add to Cart* is disabled with the reason "Maximum available quantity in cart". *[ASSUMPTION]*

#### FR-12: Change Quantity

A Shopper can increase or decrease a Cart Item's Quantity from the Cart page. Realizes UJ-2.

**Consequences (testable):**
- The decrease control is disabled when Quantity is 1. Quantity can never go below 1.
- Each change updates the Line Total, Item Count and Cart Subtotal immediately.

#### FR-13: Cap Quantity at Stock

A Cart Item's Quantity cannot exceed the Product's Stock. *[ASSUMPTION: brief open question 3, answered with the default]*

**Consequences (testable):**
- The increase control is disabled when Quantity equals Stock.
- Any path that would push the Quantity above Stock, including repeated *Add to Cart*, caps it at Stock and tells the Shopper.

#### FR-14: Remove Cart Item

A Shopper can remove a Cart Item. Realizes UJ-2.

**Consequences (testable):**
- Removal happens immediately, with no confirmation dialog, and the totals update.
- After removal, keyboard focus moves to a sensible next element instead of being lost.

#### FR-15: Clear Cart

A Shopper can remove all Cart Items at once.

**Consequences (testable):**
- *Clear cart* asks for confirmation before acting. *[ASSUMPTION]*
- After clearing, the Cart shows the empty state (FR-17).

#### FR-16: Cart Totals

The Cart page shows the Line Total for each Cart Item, the Item Count, the Cart Subtotal and the Order Total.

**Consequences (testable):**
- All amounts are shown in USD to 2 decimal places. *[ASSUMPTION: currency]*
- Calculations avoid floating-point display errors. For example, 3 × $19.99 always displays as $59.97.
- The Order Total equals the Cart Subtotal (see the Glossary).

#### FR-17: Empty Cart State

A Shopper with no Cart Items sees an empty state instead of an empty table.

**Consequences (testable):**
- The empty state includes a call to action that leads to the Product Listing.
- The *Checkout* action is not offered when the Cart is empty.

#### FR-18: Header Cart Indicator

Every page shows the current Item Count in the header, linked to the Cart page. Realizes UJ-1 and UJ-2.

**Consequences (testable):**
- The indicator updates within the same interaction as any Cart change.
- Its accessible name includes the count, for example "Cart, 3 items".

### 4.4 Cart Persistence

**Description:** The Cart survives page refreshes, closed tabs and browser restarts on the same device and browser. It does not sync across devices. Persistence is invisible unless something goes wrong. Realizes UJ-2 and UJ-4.

#### FR-19: Persist Cart

The Cart is saved to Local Storage whenever it changes.

**Consequences (testable):**
- After any add, quantity change, remove or clear, Local Storage holds the updated Cart.
- Only what is needed to rebuild the Cart is stored: Product id, Quantity, and a snapshot of the price, title and image for display. Shipping Information is never written to Local Storage.

#### FR-20: Restore Cart

When the app loads, the Cart is restored from Local Storage. Realizes UJ-2.

**Consequences (testable):**
- After a page refresh, the Cart Items, Quantities and totals match what they were before the refresh, unless reconciliation (FR-21) changes them. Any such change comes with a Notice.
- Restoring the Cart does not block the first render of the page.

#### FR-21: Reconcile Restored Cart with Catalog

When a restored Cart Item no longer matches the Catalog, the Cart corrects itself and tells the Shopper. Realizes UJ-4. *[ASSUMPTION: brief open question 5, answered with the default]*

**Consequences (testable):**
- A Cart Item is removed only when the Product API **confirms** that its Product does not exist (a not-found response). The Shopper sees a Notice naming the item.
- If the Product API request fails (a network error or a server error), Cart Items are left unchanged and reconciliation is retried later. A failed request never removes items from the Cart.
- A Cart Item whose Product is now Unavailable is removed, with a notice.
- A Cart Item whose Quantity is now above Stock is capped at Stock, with a notice.
- A Cart Item whose price has changed uses the current price, with a Notice.
- Reconciliation happens no later than when the Cart page or Checkout is opened. *[ASSUMPTION: timing]*

#### FR-22: Tolerate Corrupt or Unavailable Storage

The app works even when Local Storage is unreadable, malformed or blocked.

**Consequences (testable):**
- Malformed stored data is discarded and the Cart starts empty, with no crash and no error page.
- If Local Storage is blocked (for example, in some private-browsing modes), the Cart still works for the session and the rest of the app is unaffected.
- Stored data has a schema version, so future formats can be migrated or discarded safely.

### 4.5 Checkout

**Description:** Checkout is a simulated, linear flow: **Review Cart → Shipping Information → Order Summary → Confirm**. It is presented as one page with steps or as separate pages (the UX phase decides). No payment is taken and nothing is sent to a server. Realizes UJ-3.

#### FR-23: Checkout Entry Guard

Checkout is available only when the Cart has at least one Cart Item.

**Consequences (testable):**
- Opening the Checkout URL with an empty Cart redirects to the Cart page and explains why.

#### FR-24: Review Cart Items

The Shopper sees the Cart Items, Quantities, Line Totals and Order Total before entering details. Realizes UJ-3.

**Consequences (testable):**
- Each item is read-only here, with an *Edit cart* link back to the Cart page.

#### FR-25: Enter Shipping Information

The Shopper can enter Shipping Information, which is validated before they can continue. Realizes UJ-3. *[ASSUMPTION: brief open question 4, answered with the default fields]*

**Consequences (testable):**
- Required fields: full name, email, phone, address line 1, city, state/region, postal code, country. Address line 2 is optional.
- Validation runs when a field loses focus and when the Shopper tries to continue. Each error is shown next to its field, linked to that field for assistive technology, and the first invalid field receives focus.
- Email must be well-formed, phone must contain 7–15 digits, and postal code must be 3–10 alphanumeric characters. *[ASSUMPTION: format rules are generic and not country-specific]*
- What the Shopper has entered is kept when they move back and forth between Checkout steps within the session.

#### FR-26: Review Order Summary

The Shopper sees an Order Summary before confirming. Realizes UJ-3.

**Consequences (testable):**
- The summary shows the Cart Items, Quantities, Line Totals, Order Total and Shipping Information.
- The Shopper can go back to edit the Shipping Information or the Cart.

#### FR-27: Confirm Purchase

The Shopper can confirm the Order. Realizes UJ-3.

**Consequences (testable):**
- *Confirm Purchase* is disabled while the confirmation is being processed, so it cannot be submitted twice.
- On confirmation, an Order Number is generated, the Cart is cleared (including in Local Storage), and the Shopper is taken to the Order Confirmation.

#### FR-28: Order Confirmation

The Shopper sees a success message with their Order Number. Realizes UJ-3.

**Consequences (testable):**
- The page shows a success message, the Order Number, the Order Total and a *Continue shopping* link.
- The Order Number format is `SSC-YYYYMMDD-XXXXXX`, where X is an uppercase alphanumeric character. It is unique within the session. *[ASSUMPTION: format]*
- The header Item Count shows 0.

#### FR-29: Confirmation Without an Order

Because Orders are not persisted, the Order Confirmation is only shown straight after a Checkout. Realizes UJ-3.

**Consequences (testable):**
- Opening or refreshing the Order Confirmation URL with no Order in memory redirects to Home. *[ASSUMPTION]*

### 4.6 App Shell, Navigation and Home

**Description:** A consistent header (brand, link to the Product Listing, header Cart indicator) and footer appear on every page. Navigation is client-side. Unknown routes show a Not Found page.

#### FR-30: Routes

The app provides these pages: Home, Product Listing, Product Details, Cart, Checkout, Order Confirmation and Not Found.

**Consequences (testable):**
- Each page has a stable, human-readable URL. The specific paths are decided in architecture.
- Browser Back and Forward behave as the Shopper expects across all pages.

#### FR-31: Home Page

The Home page introduces the store and routes the Shopper into the Catalog.

**Consequences (testable):**
- It shows a short hero message, links into the Categories, and a selection of featured Products (for example, the 8 highest rated). *[ASSUMPTION: Home content]*
- Every Product shown on Home links to its Product Details.

#### FR-32: Not Found Page

An unknown URL shows a Not Found page.

**Consequences (testable):**
- The Not Found page includes links to Home and to the Product Listing.

### 4.7 Loading and Error States

**Description:** Every request to the Product API has a visible loading state and a recoverable error state. Realizes UJ-4.

#### FR-33: Loading States

While Product API data is loading, the Shopper sees a loading indicator shaped like the content that is coming (a skeleton), not a blank area.

**Consequences (testable):**
- The Product Listing, Product Details, Home featured Products and the Category list each have a loading state.
- Loading states are announced to assistive technology (for example, with `aria-busy`).

#### FR-34: Error States with Retry

When a Product API request fails, the Shopper sees an error message and a *Retry* action.

**Consequences (testable):**
- Network failures and server errors (5xx) show a friendly message, not raw error text.
- *Retry* repeats the failed request without reloading the page.
- An error in one region (for example, the Category list) does not take down the rest of the page.

#### FR-35: Unexpected Error Boundary

An unexpected error while rendering shows a fallback page instead of a blank screen.

**Consequences (testable):**
- The fallback offers *Reload* and *Go to Home*, and the Cart in Local Storage is left untouched.

## 5. Cross-Cutting Non-Functional Requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-1 | Performance | Lighthouse Performance ≥ 90 on mobile emulation for Home, Product Listing and Product Details. Largest Contentful Paint (LCP) ≤ 2.5 s and Cumulative Layout Shift (CLS) ≤ 0.1 on a mid-range mobile profile. Images below the fold load lazily. *[ASSUMPTION: targets]* |
| NFR-2 | Accessibility | All pages meet WCAG 2.1 AA. The full Checkout flow can be completed by keyboard alone. Lighthouse Accessibility ≥ 90, and zero critical axe violations. *[ASSUMPTION: WCAG level]* |
| NFR-3 | Responsiveness | Layouts work from 360 px to 1440 px+ width with no horizontal scrolling. Touch targets are at least 44 × 44 px. |
| NFR-4 | Browser support | The latest two major versions of Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome. *[ASSUMPTION]* |
| NFR-5 | Reliability | No user action can leave the Cart in an invalid state, such as Quantity < 1, Quantity > Stock, or duplicate Cart Items. |
| NFR-6 | Privacy | Shipping Information stays in memory only and is never stored or sent anywhere. No analytics or third-party tracking in V1. |
| NFR-7 | Code quality | Type-checked with zero type errors, zero lint errors, and enforced formatting. A continuous-integration check blocks merges that fail these. |
| NFR-8 | Testability | Automated tests cover ≥ 80% of statements and branches in the Cart and Checkout logic. Every FR in §4.3–§4.5 has at least one automated test. *[ASSUMPTION: coverage target]* |
| NFR-9 | Maintainability / extensibility | Adding a deferred feature from §7.2 happens through documented extension points, not by restructuring existing features. The Product API can be swapped for a real backend by changing only the data-access layer. Architecture shows this with a worked example. |
| NFR-11 | Architecture quality | UI is built from reusable, documented components. The folder structure is organized by feature and scales without reshuffling. Every significant architecture decision is recorded with its rationale, so a Learner can explain *why* (supports the brief's learner success criterion). |
| NFR-10 | Traceability | Every FR maps to at least one story, and every story maps to at least one FR. Commits and pull requests reference story IDs. Each phase document is approved before the next phase starts, and a release review confirms that the code matches the approved documents. |

## 6. Non-Goals

- **Not a real store.** No payments, real orders or fulfilment, and no taxes or shipping-cost calculation.
- **No identity.** No sign-up, login, profiles or saved addresses.
- **No back office.** No admin dashboard, product or inventory management, or order history.
- **No engagement features.** No wishlist, reviews, coupons or discounts, recommendations, or notifications.
- **No cross-device Cart.** The Cart lives in one browser on one device.
- **No internationalization.** English only and a single currency.
- **No custom backend.** The Catalog comes from a public mock Product API. Building or hosting a backend is out of scope.

## 7. MVP Scope

### 7.1 In Scope

- Product Listing with search, Category filter, price sort, URL-preserved criteria and pagination (FR-1 to FR-6)
- Product Details with Stock and rating (FR-7 to FR-9)
- Cart with Quantity rules, totals and header indicator (FR-10 to FR-18)
- Cart persistence and reconciliation (FR-19 to FR-22)
- Simulated Checkout with validated Shipping Information and Order Confirmation (FR-23 to FR-29)
- App shell, Home, Not Found, and loading and error states (FR-30 to FR-35)
- The quality bar in §5

### 7.2 Out of Scope for MVP (deferred)

V2 candidates, listed in the brief's Vision: authentication and profiles, wishlist, product reviews, payment gateway integration, coupons, order history, admin dashboard, product recommendations, dark mode, internationalization, PWA/offline support, a real backend, push notifications, an analytics dashboard, and extra sort options (for example, by rating).

`[NOTE FOR PM]` Dark mode is cheap if design tokens are planned from the start. Consider asking architecture to build in theming support even though the dark theme itself is deferred.

## 8. Information Architecture

| Page | Purpose | Reached from |
|---|---|---|
| Home | Introduce the store; featured Products; Category links | Brand logo, Not Found, Order Confirmation |
| Product Listing | Browse, search, filter and sort | Header, Home, Empty Cart, Not Found |
| Product Details | Decide and add to Cart | Product Card, Home featured Products, direct URL |
| Cart | Manage Cart Items | Header Cart indicator, Checkout *Edit cart* |
| Checkout | Review → Shipping Information → Order Summary → Confirm | Cart *Checkout* |
| Order Confirmation | Show success and the Order Number | Checkout confirm only |
| Not Found | Recover from a bad URL | Any unknown route |

## 9. Success Metrics

**Primary**
- **SM-1: Acceptance pass rate.** 100% of FR consequences in §4 pass automated or scripted acceptance tests at release. Validates FR-1 to FR-35.
- **SM-2: Core flows complete end to end.** Automated end-to-end tests cover UJ-1 to UJ-4 (browse → add → refresh → checkout → confirmation) and pass on mobile and desktop viewports. Validates FR-5, FR-10, FR-20 and FR-27.
- **SM-3: Traceability coverage.** 100% of FRs are linked to stories, and 100% of stories are linked to FRs and tests (NFR-10).

**Secondary**
- **SM-4: Quality bar.** NFR-1 and NFR-2 Lighthouse targets are met on the release build.
- **SM-5: Extensibility proof.** A developer new to the codebase can add one deferred enhancement from §7.2 (for example, sort by rating) through the full ACL gate sequence, without changing Cart or Checkout code (UJ-5). Measured as a timed exercise. *[ASSUMPTION: target of under 1 working day]*

**Counter-metrics (do not optimize)**
- **SM-C1: Feature count.** Adding features outside §7.1 makes the reference implementation worse, not better. Counterbalances any pressure to "show more".
- **SM-C2: Global test-coverage percentage.** Do not chase 100% overall coverage with trivial tests of presentational components. Coverage targets apply to Cart and Checkout logic only. Counterbalances NFR-8.
- **SM-C3: Lighthouse score through feature removal.** Do not raise scores by dropping images, skeletons or accessibility features. Counterbalances SM-4.

## 10. Open Questions

1. **Combining search with a Category filter.** The candidate Product API cannot apply search and Category filter in a single request (its search and category endpoints are separate). Architecture must choose between filtering in the browser over the full Catalog and making several requests. Either way, FR-5 must hold. *Owner: Architect. Blocking for: architecture.*
2. **Out-of-stock test data.** The candidate Product API may contain few or no Unavailable Products. FR-11 and FR-21 need a way to produce one (a test fixture or a mock layer). *Owner: Architect. Blocking for: testing.*
3. **Checkout layout.** Is Checkout one page with steps or several pages? *Owner: UX. Not blocking for this PRD.*
4. **Visual identity.** Brand name, logo and color palette for "Simple Shopping Cart". *Owner: UX. Not blocking.*
5. **Deployment target.** Where the reference app is hosted (for example, a static host). This affects only the "Deployment" lifecycle stage. *Owner: Architect. Not blocking.*

## 11. Assumptions Index

- §2.3: The user journeys (UJ-1 to UJ-5) were inferred, not narrated by the user.
- Glossary: Order Total equals the Cart Subtotal; no tax, free shipping.
- FR-1: Page size of 20; pagination rather than infinite scroll.
- FR-3: Only one Category can be selected at a time.
- FR-8: Low-stock threshold of 5.
- FR-11: *Add to Cart* is disabled when the Cart Item is at its Stock limit.
- FR-13: Quantity is capped at Stock (brief open question 3).
- FR-15: Clearing the Cart asks for confirmation.
- FR-16: Currency is USD to 2 decimal places.
- FR-21: Restored Cart Items are reconciled against the Catalog (brief open question 5); reconciliation timing.
- FR-25: Shipping fields and generic validation rules (brief open question 4).
- FR-28: Order Number format.
- FR-29: The Order Confirmation redirects to Home when there is no Order in memory.
- FR-31: Content of the Home page.
- NFR-1, NFR-2, NFR-4, NFR-8: Specific numeric targets, WCAG level, browser matrix and coverage target.
- SM-5: Extensibility exercise target of under 1 working day.
- §3 Product API: DummyJSON as the Product API (brief open question 1). Brief open question 2 (search, filter and sort in the browser vs. via the API) is still open; see §10, question 1.

## Appendix A. Source Requirement Traceability

How each "system shall" statement in the original project context maps to this PRD.

| Source "system shall" | PRD |
|---|---|
| Display available products | FR-1 |
| Retrieve products from an API | FR-1, FR-7 |
| Allow searching products | FR-2 |
| Allow category filtering | FR-3 |
| Allow price sorting | FR-4 |
| Persist cart using local storage | FR-19 |
| Restore cart after refresh | FR-20 |
| Prevent quantity below one | FR-12 |
| Prevent adding unavailable products | FR-11 |
| Display loading states | FR-33 |
| Display error states | FR-34, FR-35 |
| Support responsive layouts | NFR-3 |
