---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T15:07:13.012Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
name: 'Simple Shopping Cart'
created: '2026-10-21'
updated: '2026-10-21'
sources:
  - _acl-output/planning-artifacts/prds/prd-my-react-app-2026-10-21/prd.md
  - _acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md
  - _acl-output/planning-artifacts/briefs/brief-my-react-app-2026-10-21/brief.md
confluence_page_id: 1081345
---

# Simple Shopping Cart — Experience Spine

## Foundation

- **Form factor and stack:** a single responsive web surface (React SPA). It is mobile-first, from **320 px** upward (WCAG reflow; stricter than the PRD's 360 px), and equally usable on desktop. Breakpoint names (`sm` 640, `md` 768, `lg` 1024) are Tailwind v4 defaults, as defined in `DESIGN.md`.
- **UI system:** there is no third-party UI library. The design comes from Tailwind v4 tokens declared in `DESIGN.md`, implemented as in-house `shared/ui` components (architecture AD-1).
- **Relationship to other documents:**
  - `DESIGN.md` owns how things look; this spine owns how they behave.
  - The PRD's Glossary terms are used verbatim (Product, Cart Item, Item Count, Cart Subtotal, Order Total, Notice and so on).
  - Requirement IDs (FR-n) and journey IDs (UJ-n) refer to the PRD.
  - Architecture AD-n rules are binding where this spine touches state or routing.

## Information Architecture

| Surface | Route | Reached from | Purpose |
|---|---|---|---|
| Home | `/` | Wordmark, Order Confirmation, Not Found | Hero, Category shortcuts, 8 highest-rated featured Products (FR-31) |
| Product Listing | `/products` | Header "Shop", Home, empty Cart, Not Found | Browse, search, filter and sort (FR-1 to FR-6) |
| Product Details | `/products/:productId` | Product Card, Home featured Products | Decide and add to Cart (FR-7 to FR-9) |
| Cart | `/cart` | Header Cart Indicator, Checkout "Edit cart" | Manage Cart Items (FR-12 to FR-17) |
| Checkout | `/checkout` | Cart "Checkout" | Review → Shipping → Summary → Confirm (FR-23 to FR-27) |
| Order Confirmation | `/order-confirmation` | Checkout confirm only | Success and the Order Number (FR-28, FR-29) |
| Not Found | `*` | Any unknown URL | Recovery links (FR-32) |

**Global chrome:**
- **Header**, on every page: wordmark (→ Home), "Shop" (→ Product Listing), Header Cart Indicator (→ Cart). On mobile the header stays visible at the top of the page; there is no hamburger, because there are only two links.
- **Footer**: a one-line note, "Demo store · No real orders or payments", plus a link to the Product Listing.

**Product Listing layout:**
- A **controls bar** sits above the grid: search box (left, full width on mobile), a Category select, a Sort select, and a result count ("42 products").
- On mobile, the Category and Sort selects sit side by side on a second row.
- Active criteria appear as removable chips under the bar, with a "Clear filters" ghost link.

**Product Details layout:**
- On `md+` there are two columns. The gallery is on the left: a main image plus a row of thumbnails. On the right: Category, `h1` title, rating, `price-lg`, Stock Badge, description, *Add to Cart* (with the current in-cart quantity if any), and a "Back to products" link that returns to the previous listing URL with its criteria intact.
- On mobile the layout stacks.

**Checkout presentation** (this was left to UX in the architecture's Deferred list):
- A single `/checkout` route with the Checkout Progress indicator. **One step is shown at a time**:
  1. **Review**: read-only Cart Items, plus "Edit cart".
  2. **Shipping**: the Shipping Information form.
  3. **Summary**: Order Summary, plus *Confirm purchase*.
- From `lg`, a sticky **Order Total Panel** (items, Order Total) sits to the right on every step. Below `lg`, it is replaced by the Order Total Disclosure above the step. ("Order Summary" refers only to step 3, as in the PRD Glossary.)
- **Step rules:**
  - Changing step moves focus to that step's `h2`.
  - Entering `/checkout` (including returning from "Edit cart" or via browser Forward) always starts at step 1, Review. The Shipping Information fields are pre-filled from the saved draft (AD-2).
  - Once an Order exists, CheckoutGuard redirects `/checkout` to `/order-confirmation` (AD-11). That page keeps showing the last Order until the Shopper adds an item (AD-15).
- Back and Next buttons sit at the bottom of each step. The current step lives in state, not the URL (AD-11). The browser Back button leaves Checkout.

## Voice and Tone

Plain, warm and brief. The store talks like a helpful shop assistant, not a marketing banner. Numbers are always concrete.

| Do | Don't |
|---|---|
| "Added to cart" | "Awesome! Item successfully added to your shopping cart! 🎉" |
| "Only 3 left" | "Hurry! Almost gone!" |
| "Out of stock" | "Sold out!!" / "Unavailable :(" |
| "No products match “watch” in Beauty." + "Clear filters" | "Oops! Nothing here." |
| "We couldn't load products. Check your connection and try again." + "Retry" | "Error 503: Service Unavailable" |
| "Your cart is empty." + "Start shopping" | "You have 0 items." |
| Cart-change Notices: see *Cart reconciled* in State Patterns for the fixed strings | "Cart updated." |
| "Order placed" / "Your order number is SSC-20261021-4F7K2Q" | "Transaction complete" |
| "This is a demo store. No payment is taken." (Checkout Summary) | Any wording that implies a real charge |

Button labels are verbs: *Add to Cart*, *Checkout*, *Continue to shipping*, *Review order*, *Confirm purchase*, *Continue shopping*. Field errors say what to do: "Enter a valid email, like name@example.com".

## Component Patterns

Behavioural rules only; visual specs are in `DESIGN.md.Components`.

| Component | Used on | Behavioural rules |
|---|---|---|
| Product Card | Listing, Home | There is one link per card (the title), stretched over the image with a pseudo-element, so the card is a single tab stop plus its button. *Add to Cart* adds 1 (FR-10) and stays on the page. The button label briefly becomes "Added ✓" (1.5 s), then reverts. The Notice listener (AD-16) also raises "Added to cart". If the add was capped at Stock, the Notice instead reads "Only N available. Your cart has the maximum." (FR-13), and it is persistent. The disabled state and its reason come from `selectAddability` (AD-13). The disabled label *is* the reason: "Out of stock", or "Maximum available quantity in cart" when the cart quantity is at the stock limit (FR-11). An out-of-stock card is still a link to Product Details. |
| Add to Cart (Product Details) | Product Details | Same behaviour as on the card. If the product is already in the Cart, the line below the button reads "In your cart: 2", with a "View cart" link. At the stock limit, the button is disabled, with the visible reason "Maximum available quantity in cart" (FR-11). |
| Search box | Listing | Debounced at 300 ms; Enter runs immediately. A clear (×) button appears when there is text. It updates `q` in the URL (AD-7) with `replace`, so typing doesn't flood browser history. |
| Category select / Sort select | Listing | A native `<select>`. A change applies immediately and resets to page 1. Category options come from the API. "All categories" is first. Sort options: "Relevance", "Price: low to high", "Price: high to low". |
| Filter Chip | Listing | Each active criterion is a chip whose × button is named "Remove filter: {value}". "Clear filters" removes all of them. |
| Pagination | Listing | Previous · page numbers (current ±1, first, last) · Next. Wrapped in `<nav aria-label="Pagination">`. The current page has `aria-current="page"`. Changing page scrolls to the top of the grid and moves focus to the result count, which is announced once (no separate live-region announcement for pagination). Hidden when there is only 1 page. |
| Quantity Stepper | Cart | − / + are named "Decrease quantity of {title}" / "Increase quantity of {title}". Each changes the quantity by 1, applied instantly, and totals update in the same frame. The value is announced through the Cart totals live region. − is disabled at 1 and + at stock. The reason ("Minimum 1" / "Only N available") is visible text under the line, linked with `aria-describedby`. No tooltips. The value is not typeable in V1. *[ASSUMPTION]* |
| Remove | Cart line | A ghost button "Remove", with no confirmation (FR-14). Focus moves to the next line's Remove button, or to the previous one if it was last. If the Cart becomes empty, focus moves to the empty state's `h2`. |
| Clear cart (Danger Ghost Button + Dialog) | Cart | A `<button>` that opens a native `<dialog>` via `showModal()`, with `aria-labelledby` set to the dialog's title "Remove all 4 items from your cart?". [Cancel] has `autofocus`; [Clear cart] is the other action. Esc or Cancel closes the dialog and focus returns to the trigger. Confirming clears the Cart and focus moves to the empty state's `h2`. Focus is restored in code, not left to the browser. |
| Cart Summary | Cart | Item Count, Cart Subtotal, "Shipping: Free", Order Total, and *Checkout* (shown only when the Cart is not empty). Sticky on the right from `lg`; below `lg`, stacked under the Cart Lines. |
| Order Total Panel / Order Total Disclosure | Checkout | The same rows as the Cart Summary, without the *Checkout* button. From `lg`, a sticky panel on the right. Below `lg`, the Disclosure above the step: a `<button aria-expanded>`, collapsed by default, that reveals the item rows. |
| Checkout Progress | Checkout | An ordered list with `aria-current="step"` on the current step. Completed steps are buttons that go back to that step; upcoming steps are plain text. |
| Product Gallery | Product Details | Thumbnails are buttons named "Show image 2 of 5" with `aria-pressed` for the selected one. Activating one swaps the main image, whose alt is "{title}, image 2 of 5". Focus stays on the thumbnail. |
| Button (shared contract) | Global | `shared/ui/Button` handles disabling: it sets `aria-disabled="true"`, keeps the button focusable, early-returns in the click handler, and blocks form submit. The visible reason is linked with `aria-describedby`. *Confirm purchase* is also guarded by the `placeOrder` thunk status, so it can never submit twice. |
| Header Cart Indicator | Global | The count updates instantly and gets a 200 ms scale "pop" on change (none under reduced motion). Accessible name: "Cart, 3 items". |
| Shipping form (Form Field) | Checkout step 2 | A single column, with autocomplete attributes on every field (`name`, `email`, `tel`, `address-line1`, and so on). Fields are validated on blur and on Continue. On failure, focus moves to the first invalid field and a summary line reads "Fix 2 fields to continue". Values persist across steps (AD-2). |
| Notice | Global | Raised only through the store (AD-16). Shown bottom-centre below `md` and top-right from `md`. Up to 3 stacked, newest on top. Below `md`, only the newest is expanded and older ones collapse into "+2 more". **Only "Added to cart" auto-dismisses** (after 5 s, paused on hover or focus); its information is also shown by the button state and the header count. **Every other Notice is persistent**: cart changes, the stock cap, and redirect reasons. The live region is mounted empty when the app starts and is placed right after `<main>` in the DOM. Each Notice has a dismiss × named "Dismiss notice". After dismissing, focus moves to the next Notice, or back to `<main>` if none is left. Load errors are never Notices; they are inline Alerts (AD-8). |
| AsyncState (Skeleton + Alert) | Every data region | Skeleton → content, or → an inline Alert (`role="alert"`) with *Retry* (AD-8). Pressing *Retry* moves focus to the region container (`tabindex="-1"`, `aria-busy="true"` while loading), so focus is never dropped. Each region fails independently. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Loading | Listing / Home | 8 skeleton cards (image block, 2 text bars, a button bar) in the real grid. The result count reads "Loading products…". |
| Loading | Product Details | Skeleton gallery plus text bars in the two-column layout. |
| Loading | Category select | Disabled select reading "Loading categories…". |
| Category load error | Listing / Home | The Listing's Category select shows a single option, "Categories unavailable", with an inline "Retry" text button beside it; search and sort still work. On Home, the Category shortcuts row is replaced by a one-line inline Alert with *Retry*. |
| Catalog unavailable during Cart / Checkout | Cart, Checkout | Nothing blocks. Reconciliation simply hasn't run (AD-14), so the Cart uses its stored snapshot prices, and the Shopper can still check out (no payment is taken). |
| Empty results | Listing | Centred `h2` "No products match", a sentence naming the criteria, and a primary "Clear filters" button (FR-6). |
| Empty cart | Cart | `h2` "Your cart is empty.", body "Find something you like in the shop.", and a primary "Start shopping" button → Product Listing (FR-17). |
| Load error | Any data region | An inline Alert in place of the region: "We couldn't load products. Check your connection and try again." [Retry]. The rest of the page stays usable. |
| Product not found | Product Details | `h1` "Product not found", body "It may have been removed, or the link is wrong.", and a primary "Browse products" button (FR-9). No Retry. |
| Out of stock | Card / Product Details | As in `DESIGN.md` (desaturated image, badge, disabled "Out of stock" action). It is never hidden or filtered (AD-9). |
| Low stock | Card / Product Details | "Only N left" badge (stock 1–5). No other urgency cues. |
| At stock limit | Product Details / Cart | *Add to Cart* is disabled with the reason "Maximum available quantity in cart"; + is disabled with the visible reason "Only N available". |
| Page module loading | Any route change | The Route Progress Bar shows while the previous page stays visible. If the module fails to load, the global error page appears (FR-35). |
| Cart reconciled | Global | Persistent Notices (FR-21), with these fixed strings:<br>• Not found: "“{title}” is no longer available and was removed from your cart."<br>• Now out of stock: "“{title}” is now out of stock and was removed from your cart."<br>• Quantity capped: "Only {n} of “{title}” left, so your quantity is now {n}."<br>• Price changed: "The price of “{title}” changed from {old} to {new}."<br>One Notice per change, unless a single reconciliation produces **more than 2 changes**: then one Notice reads "{k} changes to your cart", with an expandable list of the strings above. |
| Checkout with empty cart | `/checkout` | Redirects to the Cart with the Notice "Your cart is empty, so there's nothing to check out yet." (FR-23). |
| Confirmation without an order | `/order-confirmation` | Silently redirects to Home (FR-29). |
| Confirming | Checkout Summary | *Confirm purchase* is disabled with a spinner and the label "Placing order…", which prevents double-submits (FR-27). |
| Unexpected error | App | Full-page fallback: `h1` "Something went wrong", body "Your cart is safe.", and [Reload] [Go to Home] (FR-35). |
| Not found route | `*` | `display` "Page not found", plus links to Home and Shop (FR-32). |

## Interaction Primitives

- **Pointer and touch first, keyboard complete.** Every action is reachable by Tab, Enter and Space. There are no custom keyboard shortcuts in V1.
- **Instant feedback.** Every change to the Cart updates the totals and the Header Cart Indicator in the same frame. There are no loading spinners for cart actions, because they are local.
- **Navigation:**
  - A **route change** means a change of URL path. It moves focus to the page's `h1` and updates the document title ("Cart · Simple Shopping Cart").
  - A change of **query string only** (search, Category, sort, page) is not a route change. Focus stays on the control the Shopper used, except for pagination, which moves focus to the result count, and the new count is announced.
  - Scroll returns to the top on a new page and is restored on browser Back to the Product Listing.
- **Motion:** only the 200 ms indicator pop, the 2 px card hover lift, notices sliding in (150 ms) and the skeleton shimmer. All of it is disabled under `prefers-reduced-motion`.
- **Banned:** infinite scroll, autoplaying carousels, add-to-cart modals or drawers that block the page, countdown timers or fake urgency, hover-only affordances, more than one modal open at once, and colour-only status.

## Accessibility Floor

WCAG 2.1 AA across every surface (NFR-2). Visual contrast is owned by `DESIGN.md` (all text tokens ≥ 4.5:1 and the focus ring ≥ 3:1).

- **Landmarks:**
  - One `<header>`, one `<main id="main">` and one `<footer>`.
  - A "Skip to content" link is the first focusable element.
  - Each page has exactly one `h1`.
- **Focus:**
  - A visible 2 px `{colors.focus-ring}` outline with a 2 px offset on every interactive element. Focus outlines are never removed.
  - Route changes move focus to the `h1` (AD-11).
  - Removing a Cart Item moves focus as described in Component Patterns.
- **Live announcements:**
  - The Notice region is `aria-live="polite"`.
  - The listing's result count is announced after each change in search, Category or sort ("12 products"). For a pagination change, it is announced only once, through the focus move.
  - Cart totals are inside an `aria-live="polite"` region on the Cart page.
- **Disabled controls** use `aria-disabled` plus visible reason text. Disabled buttons remain focusable, so screen readers can reach the reason.
- **Images:** product images use the Product title as alt text, gallery thumbnails are buttons named "Show image 2 of 5" (see Component Patterns), and decorative icons are `aria-hidden`.
- **Ratings** are read as "Rated 4.5 out of 5".
- **Forms:**
  - Every input has a `<label>`.
  - Required fields are marked with text ("required"), not only an asterisk.
  - Errors are linked with `aria-describedby` and `aria-invalid`.
- **The Clear-cart dialog** uses native `<dialog>` with `showModal()`, which traps focus and closes on Esc. Focus is restored as described in Component Patterns: to the trigger on cancel, and to the empty state's `h2` on confirm.
- **Reflow:** usable at 320 px width and at 400% zoom. The Order Number may wrap.
- **Testing:** axe runs on every page in end-to-end tests, at 320 px, 390 px and 1280 px widths. Zero critical violations are allowed.

## Responsive & Platform

| Breakpoint | Behaviour |
|---|---|
| below `sm` (320–639px) | 2-column product grid. Search on its own row, with the Category and Sort selects side by side below it. Product Details stacked. Cart lines stacked (image, then title, then stepper and Line Total). Checkout uses the Order Total Disclosure. Cart Summary sits under the lines. Notices bottom-centre, collapsed beyond the newest. |
| from `sm` to below `lg` (640–1023px) | 3-column grid. Controls on one row. Product Details in two columns from `md`. Cart Summary under the lines, and Checkout still uses the Disclosure. Notices: bottom-centre below `md`, top-right from `md`. |
| from `lg` (≥ 1024px) | 4-column grid. The Cart and Checkout summary panels are sticky on the right. Notices top-right. |

Supported browsers: the latest two versions of Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome (NFR-4). There is no native app and no PWA in V1.

## Inspiration & Anti-patterns

- **Borrowed from good modern stores:** a quiet, white product tile with the image doing the selling; an always-visible cart count; a checkout that shows one step at a time with the total always in view.
- **Rejected: fake scarcity and pressure tactics.** "Only N left" appears only from real stock data. There are no timers and no "12 people are viewing this". This is a teaching codebase and should model honest patterns.
- **Rejected: hiding out-of-stock items.** It is the user's direction, and it is honest: the catalogue shows its real state.
- **Rejected: cart drawer or modal on add.** It interrupts browsing. Feedback is the button state plus the header count.
- **Rejected: infinite scroll.** Pagination keeps the URL shareable (FR-5) and keyboard-friendly.

## Key Flows

The flows mirror PRD UJ-1 to UJ-4. The protagonist is **Ananya**, a working professional shopping on her phone.

### Flow 1 — Ananya finds a gift between meetings (UJ-1)

1. She opens Home on her phone and taps the "Men's Watches" Category shortcut, which goes to the Product Listing with `category=mens-watches`.
2. She types "steel" in search. After a 300 ms pause, the grid updates and the chip row shows "steel" and "Men's Watches". The result count announces "4 products".
3. She sorts by "Price: low to high". The grid reorders and the page resets to 1.
4. She taps the second card. Product Details shows the rating and the "In stock" badge.
5. **Climax:** she taps *Add to Cart*. The button flips to "Added ✓", the header count pops from 0 to 1, and a Notice says "Added to cart". She hasn't left the page, and she knows it worked.

Failure: her search matches nothing → "No products match “steel” in Men's Watches." with *Clear filters*.

### Flow 2 — The Cart remembers (UJ-2)

1. That evening she reopens the site. The header already shows 1.
2. She adds a second Product from the listing, then opens the Cart.
3. She taps + on the watch, and the Line Total and Cart Subtotal update instantly. She removes the second Product, and focus lands on the remaining line.
4. **Climax:** the Cart shows exactly what she meant to buy, totals correct, with nothing lost between sessions.

Edge: − is disabled at 1, and + is disabled at stock with "Only 3 available".

### Flow 3 — Ananya checks out (UJ-3)

1. On the Cart page she taps *Checkout*. Step 1, Review, lists her items, and the sidebar or disclosure shows the Order Total.
2. She taps *Continue to shipping*. The browser autofills most fields. She mistypes the postal code; on blur she sees "Enter a postal code of 3–10 letters or numbers", fixes it, and taps *Review order*.
3. The Summary shows items, the Order Total, her address, and "This is a demo store. No payment is taken."
4. She taps *Confirm purchase*. The button reads "Placing order…".
5. **Climax:** the Order Confirmation shows "Order placed" in `display`, her Order Number in `mono`, the Order Total, and *Continue shopping*. The header count reads 0.

Edge: she refreshes the confirmation page and lands on Home, because there is no stored order to show.

### Flow 4 — A flaky network and a stale Cart (UJ-4)

1. On the train, the Product Listing request fails. An inline Alert says "We couldn't load products…" with *Retry*, while the header and footer keep working.
2. She taps *Retry* and the grid loads.
3. **Climax:** a Product she saved yesterday is no longer returned by the catalog. A persistent Notice says "“Classic Watch” is no longer available and was removed from your cart." She understands exactly what changed and why, and nothing vanished silently.
