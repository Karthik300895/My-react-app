---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T15:33:36.259Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: "Epics: Simple Shopping Cart"
created: "2026-10-21"
updated: "2026-10-21"
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _acl-output/planning-artifacts/prds/prd-my-react-app-2026-10-21/prd.md
  - _acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md
  - _acl-output/planning-artifacts/ux-designs/ux-my-react-app-2026-10-21/DESIGN.md
  - _acl-output/planning-artifacts/ux-designs/ux-my-react-app-2026-10-21/EXPERIENCE.md
  - _acl-output/planning-artifacts/briefs/brief-my-react-app-2026-10-21/brief.md
---

# Simple Shopping Cart - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Simple Shopping Cart, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Product Listing**
- FR1: Shopper views the Catalog as a grid of Product Cards. Each card shows the image (with alt text from the title), title, truncated description, price, Category and *Add to Cart*. The image and title open Product Details. The listing is paginated at 20 per page.
- FR2: Shopper searches by keyword. The match is case-insensitive on title and description, debounced at 300 ms, and Enter searches immediately. Clearing the search keeps the Category and sort.
- FR3: Shopper filters by one Category. The Categories come from the Product API, and "All categories" removes the filter.
- FR4: Shopper sorts by Relevance, Price: low to high, or Price: high to low. The sort applies to the whole result set.
- FR5: Search, Category and sort combine, and only Products matching all of them show. The URL reflects the criteria, so a reload or a new tab reproduces the same results. Changing a criterion resets to page 1.
- FR6: Empty results show an explicit state that names the criteria, with *Clear filters*.

**Product Details**
- FR7: Product Details lives at its own URL and works when opened directly. It shows a large image, title, full description, price, Category, rating (numeric, plus a visual with a text equivalent) and Stock. The tab title includes the Product title.
- FR8: Stock availability is shown as text: "In stock", "Only N left" (stock 1–5), or "Out of stock". It is never shown by colour alone.
- FR9: An unknown or malformed Product id shows "Product not found", with a link back to the listing.

**Cart**
- FR10: Shopper adds an Available Product from a Product Card or Product Details. The first add creates a Quantity of 1; each later add adds 1, up to Stock. There is non-blocking feedback that screen readers announce.
- FR11: Unavailable Products cannot be added. *Add to Cart* is disabled and the reason is shown ("Out of stock", or "Maximum available quantity in cart" at the stock limit).
- FR12: Shopper increases or decreases Quantity on the Cart page. Decrease is disabled at 1, and totals update immediately.
- FR13: Quantity is capped at Stock. Increase is disabled at Stock; any path that would exceed Stock caps it and tells the Shopper.
- FR14: Shopper removes a Cart Item immediately, with no confirmation. Totals update and focus moves somewhere sensible.
- FR15: Shopper clears the Cart, after confirming. The empty state follows.
- FR16: The Cart shows Line Totals, Item Count, Cart Subtotal and Order Total, in USD to 2 decimal places, with no floating-point display errors. Order Total = Cart Subtotal.
- FR17: An empty Cart shows an empty state with a call to action to the listing. *Checkout* is not offered.
- FR18: The Header Cart Indicator on every page shows the Item Count, links to the Cart, updates in the same interaction, and has an accessible name that includes the count.

**Cart Persistence**
- FR19: The Cart is saved to Local Storage on every change: Product id, Quantity, and a snapshot of price, title and image. Shipping Information is never stored.
- FR20: The Cart is restored on load, matching its state before the refresh except where reconciliation changes it (with a Notice). Restoring doesn't block the first render.
- FR21: A restored Cart is reconciled with the Catalog. An item is removed only when the API confirms not-found (never on a network or server failure). Unavailable items are removed, Quantity above Stock is capped, and changed prices are updated, each with a Notice. This happens no later than opening the Cart or Checkout.
- FR22: The app tolerates corrupt or blocked storage. Malformed data means an empty Cart with no crash; blocked storage means a session-only Cart. Stored data carries a schema version.

**Checkout**
- FR23: Checkout requires at least one Cart Item. Otherwise the Shopper is redirected to the Cart with an explanation.
- FR24: Shopper reviews the Cart Items, Quantities, Line Totals and Order Total read-only, with *Edit cart*.
- FR25: Shopper enters Shipping Information. Required fields are full name, email, phone, address line 1, city, state/region, postal code and country; address line 2 is optional. Validation runs on blur and on Continue, errors are linked to their fields, and the first invalid field gets focus. Email must be well formed, phone must have 7–15 digits, and the postal code must be 3–10 alphanumeric characters. Entries persist between steps.
- FR26: Shopper reviews the Order Summary (items, Quantities, Line Totals, Order Total, Shipping Information) and can go back to edit.
- FR27: Shopper confirms. The button is disabled while processing (no double submit). An Order Number is generated, the Cart is cleared (including storage), and the Shopper goes to the Order Confirmation.
- FR28: The Order Confirmation shows a success message, an Order Number in the format `SSC-YYYYMMDD-XXXXXX` (unique within the session), the Order Total and *Continue shopping*. The header shows 0.
- FR29: Opening or refreshing the Order Confirmation with no Order in memory redirects to Home.

**App Shell, Navigation and Home**
- FR30: Routes: Home, Product Listing, Product Details, Cart, Checkout, Order Confirmation and Not Found. Each has a stable, readable URL, and browser Back and Forward behave as the Shopper expects.
- FR31: Home has a hero, links to Categories, and featured Products (the 8 highest rated), each linking to its Product Details.
- FR32: Unknown URLs show a Not Found page with links to Home and the listing.

**Loading and Error States**
- FR33: Every Product API region (listing, details, Home featured, Category list) shows a skeleton loading state and is announced to assistive technology (`aria-busy`).
- FR34: Product API failures show a friendly message with *Retry*, which retries without a page reload. A failure in one region doesn't take down the page.
- FR35: An unexpected render error shows a fallback page with *Reload* and *Go to Home*. The Cart is untouched.

### NonFunctional Requirements

- NFR1 (Performance): Lighthouse Performance ≥ 90 (mobile) on Home, Listing and Details. LCP ≤ 2.5 s and CLS ≤ 0.1 on a mid-range mobile profile. Images below the fold load lazily.
- NFR2 (Accessibility): WCAG 2.1 AA on all pages. The full Checkout can be completed by keyboard. Lighthouse Accessibility ≥ 90, with 0 critical axe violations.
- NFR3 (Responsiveness): 360–1440 px+ with no horizontal scroll (UX tightens the minimum to 320 px). Touch targets are at least 44 × 44 px.
- NFR4 (Browser support): the latest two major versions of Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome.
- NFR5 (Reliability): no action can produce an invalid Cart (Quantity < 1, Quantity > Stock, or duplicate items).
- NFR6 (Privacy): Shipping Information is held in memory only. No analytics or third-party tracking.
- NFR7 (Code quality): zero type errors, zero lint errors, and enforced formatting. CI blocks merges that fail.
- NFR8 (Testability): ≥ 80% statement and branch coverage for the Cart and Checkout logic. Every FR in Cart, Persistence and Checkout (FR10–FR29) has at least one automated test.
- NFR9 (Extensibility): deferred features are added through documented extension points, and the Product API can be swapped by changing only the data layer. A worked example is required (sort by rating).
- NFR10 (Traceability): every FR maps to at least one story and every story to at least one FR. Commits and PRs reference story IDs, and a release review confirms the code matches the approved documents.
- NFR11 (Architecture quality): reusable, documented components, a folder structure organised by feature, and recorded decision rationale.

### Additional Requirements

From the architecture spine (binding):

- **Starter / setup (Epic 1, Story 1):** extend the existing Vite 8 + React 19 + TS 6.0.3 scaffold rather than a new starter. Install the pinned stack: react-router 8.5.0 (imported from `react-router` and `react-router/dom`, not `react-router-dom`), @reduxjs/toolkit 2.13.0 with react-redux 9.3.0, @tanstack/react-query 5.104.5, tailwindcss 4.3.3 with @tailwindcss/vite, react-hook-form 7.90.0, @hookform/resolvers 6.0.0, zod 4.6.7, Vitest 5.0.5 with jsdom 30.1.3, Testing Library, msw 3.0.3, @playwright/test 1.64.1 with @axe-core/playwright, and Prettier 3.9.10. Set Node ≥ 22.22.2 in `engines` and `.nvmrc`. Hold TypeScript at 6.0.3.
- **Structure (AD-1):** `src/{app,pages,features/{catalog,cart,checkout},shared/{api,model,ui,lib},mocks}`, plus `e2e/`. One-way imports, enforced by ESLint `no-restricted-imports`. The only cross-feature import is checkout → cart, and features expose public `index.ts` APIs.
- **State (AD-2, AD-3, AD-4):** API data lives only in TanStack Query. A single Redux store holds the `cart`, `checkout` and `notices` slices. `CartItem` is a snapshot built via `toCartItemSnapshot`. Cart reducers are pure and enforce 1 ≤ Quantity ≤ Stock. Totals are pure functions, and money is integer cents. A listener persists only `cart.items` to `localStorage["ssc.cart.v1"]` (versioned envelope, zod-validated preload).
- **Data access (AD-5, AD-6, AD-8):** a single adapter `shared/api/productApi.ts` with DTO zod schemas and the shared `queries.ts` (query keys and queryOptions). Fetch the full catalog once (`limit=0`, rejected if incomplete), then search, filter, sort and paginate client-side with pure functions; `gcTime` ≥ `staleTime` (10 min). Errors are typed as `ApiError` (network/http/not-found/parse). The route param is zod-validated.
- **URL criteria (AD-7):** `useListingCriteria()` over `useSearchParams` handles `q`, `category` (slug), `sort` and `page`.
- **Stock and reconciliation (AD-13, AD-14):** `selectAddability` is the single can-add decision. `useCartReconciliation` is mounted once in RootLayout and runs per catalog `dataUpdatedAt`.
- **Order (AD-15):** the `placeOrder` thunk, `createOrderNumber(now, random, issued)`, and a shared `orderPlaced` event. `lastOrder` is cleared only by `itemAdded`.
- **Notices (AD-16):** a single `noticeListener` in `app/`. Redirect reasons travel through `<Navigate state>`.
- **Routing (AD-11):** a single `createBrowserRouter` table with lazy page modules. Guards are components (CheckoutGuard, ConfirmationGuard). Checkout step state lives in the slice. Focus moves to `h1` on route change.
- **Out-of-stock (AD-9):** never filtered. `isAvailable()` and `stockLabel()` are the single source.
- **Mocks (AD-10):** MSW handlers only for `https://dummyjson.com/*` (bypass anything else), honouring limit, skip and select, built from the DTO schemas. Fixtures include products with stock 0 and with low stock, plus 404, network-error and incomplete-catalog scenarios. Tests always use MSW; dev uses it opt-in via `VITE_API_MOCK=true`. The worker never ships in `dist/` (checked by a build check). `npm run contract:live` runs a manual live-API check.
- **Coexistence and deployment (AD-12):** the shop deploys as a separate static site on its own origin. Never edit `netlify.toml`, `vercel.json`, `api/` or `public/markdown*`. The `acl-markdown-saver` plugin in `vite.config.ts` stays untouched (append only). No third-party scripts.
- **Quality gates:** `npm run quality` runs tsc, eslint, `prettier --check` and `vitest run --coverage` (80% for cart and checkout). `npm run test:e2e` runs Playwright and axe. A GitHub Actions workflow runs quality → e2e → Lighthouse budget (≥ 90 Performance and Accessibility). Lint and format ignore `_acl-output/`, `_acl/`, `public/markdown*`, `api/` and `dist/`.
- **Traceability conventions:** test titles start with the FR id, e2e specs are named by journey (`uj-N-*.spec.ts`), and code at enforcement points carries an AD id comment.
- **Deferred (not in stories unless revisited):** the deployment host choice, git and CI hosting setup (the repo isn't under git yet), the Lighthouse CI tool choice, and image optimisation beyond lazy loading and sizes.

### UX Design Requirements

**Design tokens and foundation**
- UX-DR1: Implement every DESIGN.md token in the Tailwind v4 `@theme` block (`src/index.css`): the 21 colour tokens (including `border-strong` `#8A8580`), the typography roles (display, h1–h3, body, body-sm, label, caption, price, price-lg, mono; system font stack; tabular numerals for prices), radii (sm 4 / md 8 / lg 12 / full), named spacing (gutters 16/24/32, grid gaps 16/24, section 48, content-max 1280, form-max 560, touch-target 44), and the implementation tokens (`--shadow-card-hover`, `--shadow-float`, `--overlay-opacity`, `--oos-image-filter`, `--motion-fast/pop/shimmer`). No hard-coded hex values or spacing in components.
- UX-DR2: Breakpoints use the Tailwind defaults (`sm` 640 / `md` 768 / `lg` 1024). The layout supports a minimum of 320 px with 400% zoom reflow. Content is centred to 1280 px.
- UX-DR3: Global chrome. The Header has a wordmark (cart glyph + "Simple Shopping Cart"), a "Shop" link, and the Header Cart Indicator; on mobile it stays visible at the top of the page, with no hamburger. The footer says "Demo store · No real orders or payments" and links to Shop. A "Skip to content" link comes first, with one `<header>`, `<main id="main">` and `<footer>`.

**Shared components (visual spec in DESIGN.md + behaviour in EXPERIENCE.md)**
- UX-DR4: Button, in primary, secondary, ghost and disabled variants. It follows a shared disabled contract: `aria-disabled`, stays focusable, early-return handlers, blocks submit, and the reason is visible and linked with `aria-describedby`. Styling uses the `aria-disabled:` variant. Minimum height 44 px.
- UX-DR5: Product Card. A single stretched title link; image 1:1 `object-contain`, lazy-loaded. Category caption, `h3` title clamped to 2 lines on an inner span, description clamped to 2 lines, rating, and price. A full-width *Add to Cart* that shows "Added ✓" for 1.5 s. The "Only N left" badge appears for stock 1–5. Hover lift and shadow only on pointer devices. Focus rings are never clipped.
- UX-DR6: Out-of-stock Product Card. The image uses `--oos-image-filter`, a centred "Out of stock" inverted badge, and a disabled action labelled "Out of stock". The title and price stay at full contrast, and the card still links to Product Details.
- UX-DR7: Stock Badge in its in-stock, low-stock and out-of-stock variants (pill, caption text).
- UX-DR8: Quantity Stepper. 44 px −/+ buttons named "Decrease/Increase quantity of {title}", with a tabular value that isn't typeable. The disabled reason ("Minimum 1" / "Only N available") is visible text below. No tooltips.
- UX-DR9: Cart Line. A thumbnail (64 px, or 96 px from `sm`), a title link, the unit price, the stepper, the Line Total and a Remove ghost button. Focus moves after removal (to the next or previous line, or to the empty-state `h2`).
- UX-DR10: Cart Summary (Cart page, with *Checkout*) and Order Total Panel / Disclosure (Checkout, without *Checkout*). Sticky from `lg`. Below `lg`, the Cart Summary sits under the lines and Checkout uses a `<button aria-expanded>` disclosure.
- UX-DR11: Search Box. An input with an icon and a clear × (44 px). It updates `q` with history `replace`.
- UX-DR12: Select (Category, Sort) as a native `<select>` with a visible label. Sort options are "Relevance", "Price: low to high" and "Price: high to low".
- UX-DR13: Filter Chip. `primary-subtle` with × named "Remove filter: {value}", plus a "Clear filters" ghost.
- UX-DR14: Pagination in `<nav aria-label="Pagination">` with `aria-current="page"` and 44 px squares. Text labels for Previous and Next from `sm`. Focus moves to the result count, announced once. Hidden when there is only 1 page.
- UX-DR15: Product Gallery. A main 1:1 image plus 64 px thumbnail buttons, "Show image 2 of 5" with `aria-pressed`. Focus stays on the thumbnail.
- UX-DR16: Checkout Progress. An ordered list (Review · Shipping · Summary) with `aria-current="step"`. Completed steps are buttons that go back; upcoming steps are text.
- UX-DR17: Form Field. Label above, help text, an error below with an icon, `aria-invalid` and `aria-describedby`, and required fields marked in text. The Shipping form uses autocomplete attributes on every field, shows a "Fix N fields to continue" summary, and focuses the first invalid field.
- UX-DR18: Notice region. Dark toasts with a dismiss × ("Dismiss notice"), placed bottom-centre below `md` and top-right from `md`, up to 3 stacked. Below `md`, older ones collapse into "+N more". Only "Added to cart" auto-dismisses (5 s, paused on hover or focus); all others are persistent with a warning rule. More than 2 reconciliation changes collapse into "{k} changes to your cart" with an expandable list. The live region is mounted empty right after `<main>`. The focus ring on a Notice is surface-coloured, and focus moves after dismiss.
- UX-DR19: Alert (inline error) with `role="alert"`, a message and *Retry*. AsyncState moves focus to the region container (`tabindex=-1`, `aria-busy`) on Retry.
- UX-DR20: Skeleton. Content-shaped blocks with a 1.5 s shimmer (none under reduced motion): 8 cards for the grid, and a gallery-and-text layout for Details.
- UX-DR21: Clear-cart Dialog. A native `<dialog>` opened with `showModal()`, `aria-labelledby`, and Cancel with `autofocus`. Cancel returns focus to the trigger; confirming moves focus to the empty-state `h2`. The trigger is a Danger Ghost Button.
- UX-DR22: Route Progress Bar (2 px teal) while lazy page modules load. A Spinner appears only inside *Confirm purchase* ("Placing order…").
- UX-DR23: Inline links inside text are always underlined (WCAG 1.4.1).

**Pages and layouts**
- UX-DR24: Home has a hero (`display`), Category shortcuts, and 8 highest-rated featured Products. If the Category list fails, an inline Alert with Retry appears.
- UX-DR25: Product Listing has a controls bar (search; Category and Sort selects; result count), chips and a grid with 2 columns below `sm`, 3 from `sm` and 4 from `lg`. If categories fail, the select shows "Categories unavailable" with an inline Retry.
- UX-DR26: Product Details has two columns from `md`: gallery, Category, `h1`, rating ("Rated 4.5 out of 5"), `price-lg`, Stock Badge, description, *Add to Cart*, "In your cart: N" with View cart, and "Back to products" restoring the listing URL.
- UX-DR27: Checkout is a single `/checkout` route showing one step at a time, with the step held in state. Changing step moves focus to the step's `h2`. Entering always starts at Review, with the draft prefilled. The Summary shows "This is a demo store. No payment is taken." If the catalog is unavailable, Checkout proceeds with the snapshot prices.
- UX-DR28: Order Confirmation shows "Order placed" (`display`), the Order Number (`mono`, may wrap), the Order Total and *Continue shopping*.
- UX-DR29: Not Found ("Page not found", links to Home and Shop) and the global error page ("Something went wrong", "Your cart is safe.", Reload, Go to Home).

**Copy, motion and accessibility**
- UX-DR30: Microcopy uses the EXPERIENCE.md Voice and Tone table and these fixed strings:
  - "Added to cart"
  - "Only N available. Your cart has the maximum."
  - Empty Cart and empty results texts
  - Load-error text
  - Redirect: "Your cart is empty, so there's nothing to check out yet."
  - Reconciliation strings for not-found, out-of-stock, quantity-capped and price-changed

  Button labels are verbs, and field errors say how to fix the problem.
- UX-DR31: Motion is limited to: the indicator pop (200 ms), card lift, Notice slide (150 ms) and shimmer, all off under `prefers-reduced-motion`. Banned: infinite scroll, autoplay carousels, add-to-cart modals, fake urgency, hover-only affordances, nested modals, and colour-only status.
- UX-DR32: Accessibility floor:
  - The document title updates per route ("Cart · Simple Shopping Cart").
  - A query-only change keeps focus on the control used.
  - Result counts are announced, and the Cart totals sit in a live region.
  - Ratings and images have text equivalents.
  - The focus ring is 2 px with a 2 px offset.
  - axe runs at 320, 390 and 1280 px widths with zero critical violations.

### FR Coverage Map

| FR | Epic | Summary |
|---|---|---|
| FR1 | Epic 1 | Product Listing grid of Product Cards, paginated |
| FR2 | Epic 1 | Keyword search |
| FR3 | Epic 1 | Category filter |
| FR4 | Epic 1 | Price sort (extended with sort by rating in Epic 4) |
| FR5 | Epic 1 | Combined criteria, kept in the URL |
| FR6 | Epic 1 | Empty results state |
| FR7 | Epic 1 | Product Details page |
| FR8 | Epic 1 | Stock availability text |
| FR9 | Epic 1 | Product not found |
| FR10 | Epic 2 | Add Product to Cart |
| FR11 | Epic 2 | Block unavailable Products and show the reason |
| FR12 | Epic 2 | Change Quantity |
| FR13 | Epic 2 | Cap Quantity at Stock |
| FR14 | Epic 2 | Remove Cart Item |
| FR15 | Epic 2 | Clear Cart with confirmation |
| FR16 | Epic 2 | Cart totals in cents and USD |
| FR17 | Epic 2 | Empty Cart state |
| FR18 | Epic 2 | Header Cart Indicator |
| FR19 | Epic 2 | Persist Cart to Local Storage |
| FR20 | Epic 2 | Restore Cart on load |
| FR21 | Epic 2 | Reconcile restored Cart with the Catalog |
| FR22 | Epic 2 | Tolerate corrupt or blocked storage |
| FR23 | Epic 3 | Checkout entry guard |
| FR24 | Epic 3 | Review Cart Items |
| FR25 | Epic 3 | Shipping Information form and validation |
| FR26 | Epic 3 | Order Summary |
| FR27 | Epic 3 | Confirm purchase (no double submit) |
| FR28 | Epic 3 | Order Confirmation and Order Number |
| FR29 | Epic 3 | Confirmation without an Order redirects Home |
| FR30 | Epic 1 | Routes and navigation |
| FR31 | Epic 1 | Home page |
| FR32 | Epic 1 | Not Found page |
| FR33 | Epic 1 | Loading states |
| FR34 | Epic 1 | Error states with Retry |
| FR35 | Epic 1 | Unexpected error boundary |

All 35 FRs are mapped exactly once. NFR1, NFR2, NFR8, NFR9 and NFR10 get cross-cutting verification in Epic 4. Each epic also meets NFR7 and NFR8 for its own code.

## Epic List

### Epic 1: Browse the Store
A Shopper can open the store on any device and browse it: the Home page and its featured Products; search, Category filter, price sort and pagination, with the criteria kept in the URL; and Product Details with stock, rating and gallery. Out-of-stock items are shown and look deliberate. Loading, error, Not Found and crash states always offer a way back. Story 1.1 sets up the project on the existing scaffold.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR30, FR31, FR32, FR33, FR34, FR35
**UX-DRs:** UX-DR1, 2, 3, 5, 6, 7, 11, 12, 13, 14, 15, 19, 20, 22, 23, 24, 25, 26, 29, 31, 32
**Notes:** This epic lays down the design tokens, page frame, router, query layer and MSW mocks. The Product Card's action slot exists but stays empty until Epic 2.

### Epic 2: Build a Cart That Remembers
A Shopper can add Products from cards or details, change quantities within stock, remove items or clear the Cart, and see correct totals and the header count everywhere. The Cart survives refreshes. When the catalog has changed, it corrects itself and tells the Shopper exactly what changed.
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22
**UX-DRs:** UX-DR4, 8, 9, 10 (Cart Summary), 18, 21, 30
**Notes:** This epic adds the Redux store, the `cart` and `notices` slices, persistence (AD-4), reconciliation (AD-14), the Notice listener (AD-16), and `selectAddability` (AD-13), which fills Epic 1's card slot.

### Epic 3: Check Out and Get an Order Number
A Shopper can go from the Cart through Review → Shipping → Summary, with validated, autofilled fields and the total always visible. They confirm safely and land on an Order Confirmation with their Order Number. Refreshing or returning to the confirmation behaves sensibly.
**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR29
**UX-DRs:** UX-DR10 (Order Total Panel), 16, 17, 27, 28
**Notes:** This epic adds the `checkout` slice, the `placeOrder` thunk, the `orderPlaced` event (AD-15), and CheckoutGuard and ConfirmationGuard (AD-11).

### Epic 4: Prove the Reference Implementation
A Learner (Ravi, UJ-5) can add a new feature by following the documents, and a reviewer can verify the release. This epic covers the "sort by rating" worked extension, end-to-end journeys UJ-1 to UJ-4 with axe at three widths, the Lighthouse budget in CI, the manual live-API contract check, and the traceability review (FR ↔ story ↔ test, and code against the documents).
**FRs covered:** none new; extends FR4. Verifies NFR1, NFR2, NFR8, NFR9 and NFR10, plus SM-2, SM-3 and SM-5.
**Notes:** Builds on Epics 1–3. Per-epic unit and component tests remain each epic's responsibility.

## Epic 1: Browse the Store

A Shopper can open the store on any device and browse it: the Home page and its featured Products; search, Category filter, price sort and pagination, with the criteria kept in the URL; and Product Details with stock, rating and gallery. Out-of-stock items are shown and look deliberate. Loading, error, Not Found and crash states always offer a way back.

### Story 1.1: Set Up the Store Foundation

As a Learner developer,
I want the shop's stack, folder layout, design tokens and quality gates set up on the existing scaffold,
So that every later story builds on enforced conventions without breaking Markdown Studio.

**Acceptance Criteria:**

**Given** the existing Vite 8 + React 19 + TypeScript 6.0.3 scaffold
**When** the foundation is installed
**Then** `package.json` pins the Stack versions from the architecture spine (react-router 8.5.0, @reduxjs/toolkit 2.13.0, react-redux 9.3.0, @tanstack/react-query 5.104.5, tailwindcss and @tailwindcss/vite 4.3.3, react-hook-form 7.90.0, @hookform/resolvers 6.0.0, zod 4.6.7, vitest 5.0.5, jsdom 30.1.3, the Testing Library packages, msw 3.0.3, @playwright/test 1.64.1, @axe-core/playwright 4.14.0 and prettier 3.9.10)
**And** `engines.node` and `.nvmrc` require Node 22.22.2
**And** `react-router-dom` is not a dependency.

**Given** the AD-1 layer diagram
**When** `src/` is scaffolded
**Then** `src/{app,pages,features/{catalog,cart,checkout},shared/{api,model,ui,lib},mocks}` and `e2e/` exist, and each feature has an `index.ts`
**And** ESLint `no-restricted-imports` fails the lint run for a deep import into a feature, any `catalog ↔ cart` import, and any import from `shared/` into `features/`, `pages/`, `app/` or `mocks/` (shown by a deliberately failing fixture in the lint test).

**Given** DESIGN.md
**When** `src/index.css` is written
**Then** an `@theme` block declares every colour, typography, radius, spacing and implementation token (UX-DR1) under its DESIGN.md name, and Tailwind's default breakpoints (`sm` 640, `md` 768, `lg` 1024) are used unchanged (UX-DR2)
**And** a test or lint check fails if a component under `src/` contains a hex colour literal.

**Given** Markdown Studio lives in the repo (AD-12)
**When** `vite.config.ts` is updated
**Then** the `acl-markdown-saver` plugin is byte-for-byte unchanged, with the React and Tailwind plugins appended
**And** `netlify.toml`, `vercel.json`, `api/`, `public/markdown.html` and `public/markdown/` are unchanged
**And** with `npm run dev`, `/markdown.html` and `/api/list-markdown-files` still respond as before.

**Given** the quality gates convention
**When** `npm run quality` runs
**Then** it executes `tsc -b`, `eslint .`, `prettier --check .` and `vitest run --coverage` and passes on the scaffold
**And** coverage thresholds of 80% (statements and branches) are configured for `src/features/cart/**` and `src/features/checkout/**`
**And** ESLint and Prettier ignore `_acl-output/`, `_acl/`, `public/markdown*`, `api/` and `dist/`
**And** `.github/workflows/quality.yml` runs `npm ci` then `npm run quality` on push and pull request.

**Given** MSW is set up for development only (AD-10)
**When** `VITE_API_MOCK=true npm run dev` runs
**Then** the MSW worker starts, with `onUnhandledRequest: 'bypass'`, and is not stored in `public/`
**And** `npm run build` followed by the build check fails if `dist/` contains `mockServiceWorker.js` or any `msw` code.

### Story 1.2: Navigate the Store Shell

As a Shopper,
I want a consistent header, footer and working navigation between all pages,
So that I always know where I am and can get back from a wrong turn.

**Acceptance Criteria:**

**Given** the app is open at any route
**When** the page renders
**Then** a "Skip to content" link is the first focusable element and targets `<main id="main">`
**And** a `<header>` shows the wordmark (cart glyph + "Simple Shopping Cart", linking to `/`) and a "Shop" link (to `/products`), with no hamburger at any width
**And** the header stays visible at the top of the page on mobile
**And** a `<footer>` reads "Demo store · No real orders or payments" with a link to Shop (UX-DR3)
**And** links inside running text (such as the footer link) are always underlined, not shown by colour alone (UX-DR23).

**Given** the route table in `src/app/router.tsx` (AD-11)
**When** the Shopper visits `/`, `/products`, `/products/1`, `/cart`, `/checkout` or `/order-confirmation`
**Then** each renders its lazy-loaded page module (a placeholder with a single `h1` is acceptable until its story lands), imported from `react-router` and `react-router/dom` only
**And** browser Back and Forward move between visited pages as expected (FR30).

**Given** a route change (a change of URL path)
**When** the new page renders
**Then** focus moves to its `h1` and the document title becomes "{Page} · Simple Shopping Cart"
**And** a change of query string only does not move focus (UX-DR32).

**Given** a lazy page module is loading
**When** navigation is in progress
**Then** the 2 px teal Route Progress Bar shows at the top of the viewport while the previous page stays visible (UX-DR22)
**And** if the module fails to load, the global error page is shown.

**Given** an unknown URL such as `/nope`
**When** it is opened
**Then** the Not Found page shows "Page not found" in `display` style, with links to Home and Shop (FR32, UX-DR29).

**Given** a component throws during render
**When** the root route's `errorElement` catches it
**Then** a fallback shows `h1` "Something went wrong", body "Your cart is safe." and [Reload] [Go to Home] buttons
**And** Local Storage is untouched (FR35).

**Given** viewport widths of 320 px, 768 px and 1280 px
**When** the shell renders
**Then** there is no horizontal scroll, gutters follow the 16/24/32 px tokens, and content is centred to 1280 px.

### Story 1.3: See the Product Grid

As a Shopper,
I want to see the store's products as a responsive grid of cards,
So that I can scan what's for sale, including what's currently out of stock.

**Acceptance Criteria:**

**Given** the Product API adapter `shared/api/productApi.ts` (AD-5)
**When** `getCatalog()` runs
**Then** it requests `GET /products?limit=0&select=CATALOG_SELECT`, parses the response with the zod DTO schemas in `shared/api/dto.ts`, and returns domain `Product[]` with prices in integer cents
**And** it throws `ApiError{kind:'parse'}` when `products.length !== total`, `ApiError{kind:'network'}` on fetch failure, and `ApiError{kind:'http', status}` on a 5xx response
**And** no other module calls `fetch`.

**Given** the shared query layer `shared/api/queries.ts`
**When** the Product Listing reads the catalog
**Then** it uses `catalogQueryOptions()` with `staleTime` 10 min and `gcTime` ≥ 10 min, keyed by `catalogKeys`.

**Given** the MSW fixtures in `src/mocks/` (AD-10)
**When** the test suite runs
**Then** handlers match only `https://dummyjson.com/*`, honour `limit`, `skip` and `select`, and build their responses through the DTO schemas
**And** a unit test validates every fixture against the DTO schemas
**And** the fixtures include at least 2 products with `stock: 0`, 1 with stock ≤ 5, and scenario handlers for network error and incomplete catalog
**And** `npm run contract:live` exists and checks the live API against the same schemas (it is run manually and is not part of CI).

**Given** the catalog has loaded
**When** the Shopper opens `/products`
**Then** Product Cards render in a grid of 2 columns below `sm`, 3 from `sm` and 4 from `lg` (UX-DR25)
**And** each card shows a 1:1 lazy image with alt text equal to the title, the Category caption, an `h3` title clamped to 2 lines (on an inner span), a 2-line description, the rating, and the price formatted by `formatMoney()` (FR1, UX-DR5)
**And** the card has one stretched link (the title) to `/products/{id}`, with an empty action slot below it
**And** the focus ring on the title link is fully visible, never clipped.

**Given** a Product with stock between 1 and 5
**When** its card renders
**Then** an "Only N left" low-stock badge shows over the image (FR8, UX-DR7).

**Given** a Product with stock 0
**When** its card renders
**Then** it is still shown in the grid (AD-9), its image uses `--oos-image-filter`, an "Out of stock" badge sits over the image, and the title and price stay at full contrast (UX-DR6)
**And** availability comes only from `isAvailable()` and `stockLabel()` in `shared/model`.

**Given** the catalog has more than 20 Products
**When** the listing renders
**Then** 20 cards show per page, with Pagination in `<nav aria-label="Pagination">` with `aria-current="page"` and 44 px controls (UX-DR14)
**And** the page number is stored in the URL as `page`
**And** changing page scrolls to the top of the grid and moves focus to the result count ("194 products"), which is announced once
**And** Pagination is hidden when there is only one page.

**Given** the catalog request is in flight
**When** the listing renders
**Then** 8 skeleton cards appear in the real grid, the region has `aria-busy="true"`, and the count reads "Loading products…" (FR33, UX-DR20).

**Given** the catalog request fails with a network or server error
**When** the listing renders
**Then** an inline Alert (`role="alert"`) reads "We couldn't load products. Check your connection and try again." with a *Retry* button (FR34, UX-DR19)
**And** *Retry* refetches without a page reload and moves focus to the region container (`tabindex="-1"`)
**And** the header and footer remain usable.

**Given** `prefers-reduced-motion: reduce`
**When** skeletons or card hovers render
**Then** the shimmer and the hover lift are disabled (UX-DR31).

### Story 1.4: Search, Filter and Sort Products

As a Shopper,
I want to search, filter by Category and sort by price, and have those choices kept in the URL,
So that I can quickly narrow down to what I want and share or bookmark the view.

**Acceptance Criteria:**

**Given** `useListingCriteria()` over `useSearchParams` (AD-7)
**When** the listing reads or writes criteria
**Then** only `q`, `category` (a slug), `sort` (`relevance` | `price-asc` | `price-desc`) and `page` are used
**And** invalid values fall back to their defaults without an error
**And** changing any criterion other than `page` resets `page` to 1 (FR5).

**Given** the pure listing functions in `features/catalog/model/` (AD-6)
**When** they are unit-tested without React
**Then** search matches title and description case-insensitively (FR2), the Category filter matches by slug (FR3), sorting applies to the whole filtered set (FR4), and any combination returns only Products matching every active criterion (FR5).

**Given** the Search Box (UX-DR11)
**When** the Shopper types
**Then** the search runs after a 300 ms pause, or at once on Enter, and updates `q` with history `replace`
**And** a clear × (44 px) appears when there is text, and clearing keeps the Category and sort.

**Given** the Category and Sort selects (UX-DR12)
**When** the listing loads
**Then** Category is a native `<select>` with a visible label, "All categories" first, and options from `categoriesQueryOptions()`
**And** Sort offers "Relevance", "Price: low to high" and "Price: high to low"
**And** a change applies immediately.

**Given** active criteria
**When** the listing renders
**Then** each criterion appears as a Filter Chip whose × is named "Remove filter: {value}", plus a "Clear filters" ghost button (UX-DR13)
**And** the result count is announced after each search, Category or sort change ("12 products"), while focus stays on the control used.

**Given** a URL such as `/products?q=steel&category=mens-watches&sort=price-asc`
**When** it is opened in a new tab or reloaded
**Then** the same criteria and results are reproduced (FR5).

**Given** criteria that match no Products
**When** the listing renders
**Then** an `h2` "No products match" appears with a sentence naming the criteria (for example "No products match “steel” in Men's Watches.") and a primary "Clear filters" button (FR6).

**Given** the Category list fails to load
**When** the listing renders
**Then** the select shows a single option "Categories unavailable" with an inline "Retry" text button beside it, while search and sort keep working.

### Story 1.5: View Product Details

As a Shopper,
I want a page with everything about one product,
So that I can decide whether to buy it.

**Acceptance Criteria:**

**Given** `/products/:productId` with a valid positive integer id (AD-8)
**When** the page loads via `productQueryOptions(id)`
**Then** from `md` it shows two columns: a Product Gallery on the left, and on the right the Category, an `h1` title, the rating ("Rated 4.5 out of 5" as text plus stars), the price in `price-lg`, a Stock Badge, the full description, and an empty action slot (FR7, UX-DR26)
**And** below `md` the layout stacks
**And** the document title is "{Product title} · Simple Shopping Cart"
**And** the page works when opened directly by URL.

**Given** the Stock Badge (FR8, UX-DR7)
**When** stock is above 5, between 1 and 5, or 0
**Then** it reads "In stock", "Only N left" or "Out of stock" respectively, as text in pill styling, never colour alone.

**Given** a Product with several images
**When** the Shopper activates a thumbnail named "Show image 2 of 5"
**Then** the main image swaps (alt "{title}, image 2 of 5"), the thumbnail gets `aria-pressed="true"` and a teal border, and focus stays on it (UX-DR15).

**Given** the Shopper arrived from a filtered listing
**When** they activate "Back to products"
**Then** they return to the previous listing URL with its criteria intact.

**Given** a malformed id (`/products/abc`, `/products/-1`)
**When** the page loads
**Then** "Product not found" shows immediately, with no network request made (FR9).

**Given** an id the API answers with 404 (or 400)
**When** the page loads
**Then** `h1` "Product not found", the body "It may have been removed, or the link is wrong." and a primary "Browse products" button show, with no Retry (FR9).

**Given** the request is pending or fails with a network or server error
**When** the page renders
**Then** a skeleton gallery and text bars show while loading (FR33), and an Alert with *Retry* shows on failure (FR34).

### Story 1.6: Discover Products from Home

As a Shopper,
I want a Home page that shows top products and Category shortcuts,
So that I can jump straight into shopping.

**Acceptance Criteria:**

**Given** the Shopper opens `/`
**When** the catalog and categories have loaded
**Then** a hero with a `display` headline and a "Shop all products" link to `/products` shows
**And** a row of Category shortcuts links to `/products?category={slug}`
**And** a "Top rated" section shows the 8 highest-rated Products as Product Cards (ties broken by id), each linking to its Product Details (FR31, UX-DR24)
**And** Home reads the same `catalogQueryOptions()` cache as the listing (AD-6), so moving between Home and the listing doesn't refetch within `staleTime`.

**Given** the catalog is loading or fails
**When** Home renders
**Then** the featured section shows 8 skeleton cards, or an Alert with *Retry*, without affecting the hero (FR33, FR34).

**Given** the Category list fails to load
**When** Home renders
**Then** the shortcuts row is replaced by a one-line inline Alert with *Retry*, and the featured Products still show.

## Epic 2: Build a Cart That Remembers

A Shopper can add Products from cards or details, change quantities within stock, remove items or clear the Cart, and see correct totals and the header count everywhere. The Cart survives refreshes. When the catalog has changed, it corrects itself and tells the Shopper exactly what changed.

### Story 2.1: Add Products to the Cart

As a Shopper,
I want to add a product to my cart from its card or its details page and see the cart count update,
So that I can collect what I want to buy without leaving the page.

**Acceptance Criteria:**

**Given** the single Redux Toolkit store in `src/app/store.ts` (AD-2)
**When** the app starts
**Then** it contains the `cart` slice (in `features/cart/model/`) and the `notices` slice (in `shared/ui/notice/`), and no other global state mechanism is introduced.

**Given** the `cart` slice (AD-3, AD-13)
**When** `itemAdded(toCartItemSnapshot(product))` is dispatched
**Then** a Product not yet in the Cart becomes a `CartItem { productId, quantity: 1, title, thumbnail, unitPriceCents, stock }`
**And** a Product already in the Cart gains 1 Quantity, capped at Stock, and its snapshot `stock`, `unitPriceCents`, `title` and `thumbnail` are overwritten from the payload
**And** a Product never appears twice, and Quantity never drops below 1 or rises above Stock (NFR5)
**And** reducers never dispatch, read the clock or use randomness (verified by unit tests titled with FR ids).

**Given** `selectAddability(productId, currentStock)`
**When** any *Add to Cart* control renders
**Then** its enabled state and reason come only from this selector: Out of stock → "Out of stock"; Cart Quantity equals Stock → "Maximum available quantity in cart" (FR11).

**Given** a Product Card or Product Details with an Available Product
**When** the page fills the action slot with `cart`'s `AddToCartButton` (composition, with no catalog ↔ cart import, per AD-1)
**Then** a full-width primary *Add to Cart* shows
**And** activating it adds 1 to the Cart, keeps the Shopper on the page, and changes the label to "Added ✓" for 1.5 s (FR10, UX-DR5)
**And** on Product Details, a line below the button reads "In your cart: N" with a "View cart" link once the Product is in the Cart.

**Given** an Unavailable Product, or a Cart Quantity at Stock
**When** the button renders
**Then** it uses the shared Button disabled contract: `aria-disabled="true"`, stays focusable, the click handler early-returns, and the visible label is the reason (UX-DR4, UX-DR6)
**And** activating it changes nothing in the Cart (FR11).

**Given** the Header Cart Indicator (FR18)
**When** the Cart changes
**Then** the count (the Item Count) updates in the same interaction, with a 200 ms pop that is disabled under reduced motion
**And** at 0 the pill shows "0" in the muted style, and from 1 it turns teal
**And** its accessible name is "Cart, N items", and it links to `/cart`.

**Given** the single `noticeListener` in `src/app/noticeListener.ts` (AD-16)
**When** `itemAdded` succeeds
**Then** a Notice "Added to cart" appears and auto-dismisses after 5 s (paused on hover or focus)
**And** when the add was capped at Stock, the Notice instead reads "Only N available. Your cart has the maximum." and is persistent (FR13)
**And** no component raises a toast directly.

**Given** the Notice region (UX-DR18)
**When** the app starts
**Then** an empty `aria-live="polite"` region is mounted right after `<main>`
**And** Notices show bottom-centre below `md` and top-right from `md`, up to 3 stacked (newest on top), with only the newest expanded below `md` ("+N more")
**And** each Notice has a dismiss × named "Dismiss notice". After dismissing, focus moves to the next Notice, or back to `<main>` if none is left
**And** the focus ring on a Notice uses `{colors.surface}`.

### Story 2.2: Manage Quantities on the Cart Page

As a Shopper,
I want to review my cart, change quantities and remove items with totals that update instantly,
So that the cart holds exactly what I mean to buy.

**Acceptance Criteria:**

**Given** a Cart with items
**When** the Shopper opens `/cart`
**Then** each Cart Line shows a thumbnail (64 px, or 96 px from `sm`), the title linking to Product Details, the unit price, a Quantity Stepper, the Line Total and a Remove ghost button (UX-DR9)
**And** the Cart Summary shows the Item Count, Cart Subtotal, "Shipping: Free", the Order Total and a full-width primary *Checkout* linking to `/checkout` (UX-DR10)
**And** the Summary is sticky on the right from `lg`, and stacked under the lines below `lg`.

**Given** the totals functions in `features/cart/model/totals.ts` (AD-3)
**When** they are unit-tested
**Then** `lineTotal`, `itemCount`, `subtotal` and `orderTotal` are pure functions over an item array, in integer cents, and `orderTotal` equals `subtotal`
**And** 3 × $19.99 displays as "$59.97" via `formatMoney()` (en-US, USD) (FR16)
**And** totals are never stored in state.

**Given** the Quantity Stepper (UX-DR8)
**When** the Shopper activates "Increase quantity of {title}" or "Decrease quantity of {title}"
**Then** the Quantity changes by 1, and the Line Total, Item Count, Cart Subtotal and header count update in the same frame (FR12)
**And** the totals sit in an `aria-live="polite"` region
**And** decrease is disabled at 1 with the visible reason "Minimum 1"
**And** increase is disabled at Stock with the visible reason "Only N available" (FR13)
**And** the reasons are visible text linked by `aria-describedby`, never tooltips.

**Given** a Cart Line
**When** the Shopper activates Remove
**Then** the item is removed immediately, with no confirmation, and the totals update (FR14)
**And** focus moves to the next line's Remove, or the previous one if it was the last line.

**Given** the Cart becomes empty, or the Shopper opens `/cart` with no items
**When** the page renders
**Then** `h2` "Your cart is empty.", the body "Find something you like in the shop." and a primary "Start shopping" button to `/products` show (FR17)
**And** no *Checkout* action is offered
**And** if the last item was just removed, focus moves to that `h2`.

**Given** viewport widths of 320 px and 1280 px
**When** the Cart page renders
**Then** lines stack (image, then title, then stepper and Line Total) below `sm`, with no horizontal scroll and 44 px touch targets.

### Story 2.3: Clear the Cart

As a Shopper,
I want to empty my whole cart in one action, with a confirmation,
So that I can start over without removing items one by one or losing them by accident.

**Acceptance Criteria:**

**Given** a Cart with items on `/cart`
**When** the Shopper activates the "Clear cart" Danger Ghost Button (a `<button>`)
**Then** a native `<dialog>` opens via `showModal()`, labelled by its title "Remove all N items from your cart?" (`aria-labelledby`)
**And** [Cancel] has `autofocus`, and [Clear cart] is the other action (UX-DR21).

**Given** the dialog is open
**When** the Shopper presses Esc or activates Cancel
**Then** the dialog closes, the Cart is unchanged, and focus returns to the "Clear cart" trigger (set in code).

**Given** the dialog is open
**When** the Shopper activates [Clear cart]
**Then** `cartCleared` is dispatched, the Cart becomes empty, the header shows 0, and the empty state renders (FR15, FR17)
**And** focus moves to the empty state's `h2`.

**Given** `cartCleared`
**When** it is used anywhere in the codebase
**Then** it is dispatched only by this Shopper action (AD-15 reserves it), which a test or lint check verifies.

### Story 2.4: Keep the Cart Across Visits

As a Shopper,
I want my cart to still be there after a refresh or when I come back later,
So that I never lose what I picked.

**Acceptance Criteria:**

**Given** the persistence listener (AD-4)
**When** any action changes `cart.items`
**Then** `localStorage["ssc.cart.v1"]` holds `{ version: 1, items: CartItem[] }` (FR19)
**And** only `cart.items` is written. The `checkout` and `notices` slices are never written, and nothing that looks like Shipping Information is ever stored (NFR6)
**And** `shared/lib/storage.ts` is the only module that touches `localStorage`.

**Given** a valid stored Cart
**When** the app loads (or the page refreshes)
**Then** the store is preloaded from it after zod validation, so the Cart Items, Quantities and totals match what they were before the refresh (FR20)
**And** restoring doesn't delay the first render.

**Given** the stored value is malformed, has an unknown `version`, or fails validation
**When** the app loads
**Then** the Cart starts empty, with no crash and no error page (FR22).

**Given** `localStorage` throws on read or write (blocked storage, for example in private browsing)
**When** the Shopper uses the Cart
**Then** the Cart still works for the session, and the rest of the app is unaffected (FR22).

**Given** two tabs are open
**When** both change the Cart
**Then** the last write wins, and V1 does not sync between tabs (documented in a test).

### Story 2.5: Reconcile the Cart with the Catalog

As a Shopper,
I want my saved cart to be checked against the current catalog and to be told exactly what changed,
So that I'm never surprised by vanished items or different prices.

**Acceptance Criteria:**

**Given** the pure `reconcile(items, catalog)` in `features/cart/model/` (AD-14)
**When** it is unit-tested
**Then** it returns updated items plus a list of changes:
- a Product absent from a **complete** catalog is removed as not-found
- a Product that is now Unavailable is removed as out-of-stock
- a Quantity above the new Stock is capped
- a changed price is updated

and the snapshot fields follow AD-13 (FR21).

**Given** `useCartReconciliation()`, exported by `cart`
**When** it is mounted once, in `RootLayout`
**Then** it reads the catalog through `catalogQueryOptions()` from `shared/api` (with no catalog feature import, per AD-1/AD-5)
**And** it runs once per successful catalog `dataUpdatedAt`, only while the Cart is not empty, and dispatches one `cartReconciled({ items, changes })`
**And** it has run by the time the Shopper opens `/cart` or `/checkout` (FR21).

**Given** the catalog query fails (network, http or parse error, including an incomplete catalog)
**When** reconciliation would run
**Then** the Cart is unchanged and no item is removed. The next successful refetch retries it (FR21, AD-8).

**Given** `cartReconciled` with changes
**When** the `noticeListener` handles it
**Then** each change raises a persistent Notice (with a warning rule) using exactly these strings (UX-DR30):
- "“{title}” is no longer available and was removed from your cart."
- "“{title}” is now out of stock and was removed from your cart."
- "Only {n} of “{title}” left, so your quantity is now {n}."
- "The price of “{title}” changed from {old} to {new}."

**And** if one reconciliation produces more than 2 changes, a single Notice "{k} changes to your cart" appears, with a "Show details" toggle listing those strings (scrolling above 40vh).

**Given** the MSW scenarios from Story 1.3
**When** a component test restores a Cart containing a Product that has since been removed, one now out of stock, and one with a changed price
**Then** the Cart and Notices match the rules above
**And** under the network-error scenario, the Cart is left untouched (UJ-4).

## Epic 3: Check Out and Get an Order Number

A Shopper can go from the Cart through Review → Shipping → Summary, with validated, autofilled fields and the total always visible. They confirm safely and land on an Order Confirmation with their Order Number. Refreshing or returning to the confirmation behaves sensibly.

### Story 3.1: Start Checkout and Review Items

As a Shopper,
I want to start checkout and see exactly what I'm buying with the total always in view,
So that I can check my order before entering any details.

**Acceptance Criteria:**

**Given** the `checkout` slice in `features/checkout/model/` (AD-2)
**When** the store is created
**Then** it holds `{ step: 'review' | 'shipping' | 'summary', shippingDraft, lastOrder, issuedOrderNumbers }`
**And** it is never persisted (AD-4), which a test asserts against `localStorage` after checkout actions.

**Given** `CheckoutGuard` wraps `/checkout` (AD-11)
**When** the Cart is empty and no `lastOrder` exists
**Then** the Shopper is redirected to `/cart` with `<Navigate replace state={{ reason }}>`
**And** the Cart page raises the persistent Notice "Your cart is empty, so there's nothing to check out yet." in an effect, not during render (FR23).

**Given** a Cart with items
**When** the Shopper activates *Checkout* on the Cart page
**Then** `/checkout` opens at step 1, Review, regardless of any earlier step (UX-DR27)
**And** the Checkout Progress shows "Review · Shipping · Summary" as an ordered list, with `aria-current="step"` on Review (UX-DR16).

**Given** the Review step
**When** it renders
**Then** it lists each Cart Item read-only with Quantity and Line Total, plus the Order Total, and an "Edit cart" link to `/cart` (FR24)
**And** *Continue to shipping* moves to step 2.

**Given** any Checkout step
**When** the step changes
**Then** focus moves to that step's `h2`, and the step lives only in `checkout.step`, never in the URL
**And** completed steps in the Checkout Progress are buttons that return to that step, while upcoming steps are plain text.

**Given** the Order Total Panel and Disclosure (UX-DR10)
**When** Checkout renders
**Then** from `lg`, a sticky panel on the right shows the items and the Order Total, with no *Checkout* button
**And** below `lg`, a disclosure above the step shows "Order total $X" with a `<button aria-expanded="false">` "Show items" that reveals the item rows.

**Given** the catalog is unavailable
**When** the Shopper is in Checkout
**Then** nothing blocks, and the Cart's snapshot prices are used (UX-DR27).

### Story 3.2: Enter Shipping Information

As a Shopper,
I want a shipping form that autofills, tells me clearly what to fix, and remembers what I typed,
So that I can enter my details quickly and only once.

**Acceptance Criteria:**

**Given** step 2, Shipping
**When** it renders
**Then** a single-column form within `{spacing.form-max}` shows full name, email, phone, address line 1, address line 2 (optional), city, state/region, postal code and country (FR25)
**And** each field has a visible `<label>`, required fields say "required" in text, and every field has the matching `autocomplete` attribute (`name`, `email`, `tel`, `address-line1`, `address-line2`, `address-level2`, `address-level1`, `postal-code`, `country-name`) (UX-DR17).

**Given** the zod `shippingSchema` in `features/checkout/model/`
**When** it is unit-tested
**Then** the required fields must be non-empty, the email must be well formed, the phone must contain 7–15 digits, and the postal code must be 3–10 alphanumeric characters (FR25).

**Given** the Shopper leaves a field (blur) with an invalid value
**When** validation runs
**Then** an error shows below the field in `{colors.danger}` with an icon and fix-it text (for example "Enter a valid email, like name@example.com"), and the input gets `aria-invalid="true"` and `aria-describedby` pointing at the error.

**Given** the Shopper activates *Review order* with invalid fields
**When** validation runs
**Then** the step does not advance, a summary line reads "Fix N fields to continue", and focus moves to the first invalid field.

**Given** one react-hook-form instance owned by `CheckoutPage` spans all steps (AD-2)
**When** the Shopper moves between steps, goes to "Edit cart" and back, or the page unmounts
**Then** the values are copied to `checkout.shippingDraft` and the form starts from it, so the entered values persist within the session
**And** the values exist only in memory (NFR6).

**Given** valid input
**When** the Shopper activates *Review order*
**Then** the step advances to Summary.

### Story 3.3: Review and Confirm the Order

As a Shopper,
I want a final summary and a single, safe confirm action,
So that I place exactly one order with the right details.

**Acceptance Criteria:**

**Given** step 3, Summary
**When** it renders
**Then** it shows the Order Summary: the Cart Items with Quantities and Line Totals, the Order Total, and the Shipping Information (FR26)
**And** it shows the note "This is a demo store. No payment is taken."
**And** the Shopper can go back to Shipping (via Back or the progress step) or to the Cart ("Edit cart").

**Given** `createOrderNumber(now, random, issued)` (AD-15)
**When** it is unit-tested with injected clock and randomness
**Then** it returns `SSC-YYYYMMDD-XXXXXX`, using the local date and 6 uppercase alphanumeric characters
**And** it never returns a number already in `issued` (FR28).

**Given** the Shopper activates *Confirm purchase*
**When** the `placeOrder` thunk runs
**Then** the button immediately shows a spinner and "Placing order…", and repeated clicks or Enter presses do nothing: the shared Button contract plus a thunk status guard mean exactly one Order is created (FR27)
**And** the thunk builds `Order { number, createdAt, items, shipping }` and dispatches `orderPlaced(order)` from `shared/model/events.ts`.

**Given** `orderPlaced`
**When** the reducers handle it
**Then** `cart` empties its items, which the persistence listener also writes to storage (FR27)
**And** `checkout` sets `lastOrder` and records the number in `issuedOrderNumbers`
**And** `cartCleared` is not dispatched
**And** the Shopper is navigated to `/order-confirmation` with `replace`, without being bounced to `/cart` in between, which a test verifies.

### Story 3.4: See the Order Confirmation

As a Shopper,
I want a clear confirmation with my order number,
So that I know the order went through and what it cost.

**Acceptance Criteria:**

**Given** an Order was just placed
**When** `/order-confirmation` renders
**Then** it shows "Order placed" in `display`, the Order Number in `mono` (allowed to wrap at 320 px), the Order Total computed by `orderTotal(order.items)`, and a *Continue shopping* button to `/products` (FR28, UX-DR28)
**And** the header count shows "0".

**Given** `ConfirmationGuard` (AD-11)
**When** `/order-confirmation` is opened or refreshed with no `lastOrder` in memory
**Then** the Shopper is silently redirected to `/` (FR29).

**Given** a `lastOrder` exists
**When** the Shopper opens `/checkout`
**Then** `CheckoutGuard` redirects to `/order-confirmation` (AD-11).

**Given** a `lastOrder` exists
**When** the Shopper adds any Product to the Cart (`itemAdded`)
**Then** `lastOrder` is cleared (AD-15), and `/checkout` works normally again for the new Cart
**And** `lastOrder` is never cleared on unmount, so a React StrictMode double-mount does not redirect away.

**Given** journey UJ-3
**When** a component-level test runs Cart → Review → Shipping (including one invalid postal code that gets fixed) → Summary → Confirm
**Then** the confirmation shows a valid Order Number and the correct Order Total, and the Cart and `localStorage` are empty.

## Epic 4: Prove the Reference Implementation

A Learner (Ravi, UJ-5) can add a new feature by following the documents, and a reviewer can verify the release: end-to-end journeys with accessibility checks, a performance and accessibility budget in CI, a worked extension, and a traceability review.

### Story 4.1: Verify the Core Journeys End to End

As a Delivery reviewer,
I want the four Shopper journeys automated end to end with accessibility checks on every page,
So that I can trust the core flows work on mobile and desktop before each release.

**Acceptance Criteria:**

**Given** Playwright runs against `vite preview` with the MSW fixtures (AD-10)
**When** `npm run test:e2e` runs
**Then** these specs pass at viewport widths of 320 px, 390 px and 1280 px (SM-2):
- `e2e/uj-1-find-and-add.spec.ts`: Home → Category → search → sort → Product Details → *Add to Cart* → header count 1
- `e2e/uj-2-cart-persists.spec.ts`: add → reload → Cart intact → increase, remove → totals correct
- `e2e/uj-3-checkout.spec.ts`: Cart → Review → Shipping (fix an invalid postal code) → Summary → Confirm → Order Number and header 0 → reload of the confirmation goes to Home
- `e2e/uj-4-resilience.spec.ts`: listing network error → Retry succeeds; a restored Cart with a removed Product shows the "no longer available" Notice; a network error never empties the Cart

**And** no test calls the live DummyJSON API.

**Given** `@axe-core/playwright`
**When** each page is visited in those specs (Home, Listing, Details, Cart, each Checkout step, Confirmation, Not Found), including with a Notice and the Clear-cart dialog open
**Then** there are zero critical or serious violations at every tested width (NFR2, UX-DR32).

**Given** keyboard-only use
**When** `uj-3-checkout.spec.ts` runs in a keyboard-only variant
**Then** the full checkout is completed with Tab, Enter and Space only, and focus is visible at every step (NFR2).

**Given** the CI workflow from Story 1.1
**When** a push or pull request runs
**Then** an `e2e` job runs after `quality` and blocks the merge on failure.

### Story 4.2: Enforce the Performance and Accessibility Budget

As a Delivery reviewer,
I want Lighthouse budgets checked automatically on the key pages,
So that performance and accessibility can't silently regress.

**Acceptance Criteria:**

**Given** the Lighthouse tool choice deferred by the architecture spine
**When** this story starts
**Then** a Lighthouse CI runner is chosen, its current version is verified on npm, it is pinned in `package.json`, and the choice is recorded in the architecture memlog.

**Given** a production build served by `vite preview` with MSW-backed data
**When** the Lighthouse job runs mobile emulation on Home, Product Listing and Product Details
**Then** Performance ≥ 90 and Accessibility ≥ 90 on each page (NFR1, NFR2, SM-4)
**And** LCP ≤ 2.5 s and CLS ≤ 0.1
**And** a run that misses any budget fails the job.

**Given** product images
**When** the pages render
**Then** images below the fold use `loading="lazy"`, every `<img>` has explicit `width` and `height` (no layout shift), and DummyJSON thumbnails are used in grids (NFR1).

**Given** the counter-metric SM-C3
**When** a budget fails
**Then** the fix must not remove images, skeletons or accessibility features, which reviewers check in the pull request.

**Given** the CI workflow
**When** the budget job runs
**Then** it runs after `e2e` and blocks the merge on failure.

### Story 4.3: Add "Sort by Rating" by Following the Documents

As a Learner developer (Ravi),
I want to add a "Rating: high to low" sort by following the PRD, architecture and existing patterns,
So that I prove the codebase can be extended without touching the Cart or Checkout.

**Acceptance Criteria:**

**Given** sort by rating is deferred in PRD §7.2
**When** the extension starts
**Then** it goes through the ACL gate sequence: a story or spec for it is approved before code (SM-5).

**Given** `useListingCriteria()` and the pure sort function (AD-6, AD-7)
**When** the extension is implemented
**Then** `sort` accepts `rating-desc`, and the Sort select gains the option "Rating: high to low"
**And** ties are ordered by price ascending, then id
**And** unit tests titled with `FR-4:` cover the new order and URL round-trip, and the existing sort tests still pass.

**Given** the AD-1 boundaries
**When** the change is reviewed
**Then** the diff touches only `features/catalog/**` (and its tests or e2e), and nothing under `features/cart/**`, `features/checkout/**` or `shared/api/**` (NFR9)
**And** the code cites AD-6 and AD-7 at the changed enforcement points.

**Given** UJ-5 and SM-5
**When** the extension is complete
**Then** the time taken from reading the documents to a merged change is recorded (target: under 1 working day)
**And** a short write-up of which documents and AD rules guided each change is added to the project README's "Extending the store" section.

### Story 4.4: Review Release Traceability

As a Delivery reviewer,
I want an automated FR ↔ story ↔ test check and a code-against-architecture review before release,
So that I have evidence the shipped code matches the approved documents.

**Acceptance Criteria:**

**Given** the traceability convention (unit and component test titles start with the FR id; e2e specs are named by journey)
**When** `npm run trace` runs
**Then** it prints a matrix of FR-1 to FR-35 → test files
**And** it fails if any FR has no test, or if any FR in FR-10 to FR-29 lacks an automated test (NFR8, NFR10, SM-3).

**Given** the epics document
**When** the trace check runs
**Then** it also verifies that every FR is covered by at least one story, and every story lists at least one FR or NFR (NFR10).

**Given** the architecture spine AD-1 to AD-16
**When** the release review is performed
**Then** a checklist records, for each AD, the enforcement point in code (file and the AD comment) and its test or lint rule, and flags any AD with no enforcement
**And** the checklist includes the Markdown Studio regression check (AD-12): `/markdown.html` and `/api/*` still work in dev, and the protected files are unchanged.

**Given** the counter-metric SM-C2
**When** coverage is reported
**Then** the 80% thresholds apply only to Cart and Checkout logic, with no added trivial tests for presentational components.

**Given** the repository is not yet under git (a deferred item)
**When** git is initialised
**Then** commits and pull requests reference story ids (for example `Story 2.3`), and the trace check includes them from then on.
