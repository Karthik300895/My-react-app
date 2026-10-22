---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T16:03:19.118Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
---

# Epic 1 Context: Browse the Store

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

A Shopper can open the store on any device and browse it: Home with featured Products and Category shortcuts, a Product Listing with search, Category filter, price sort and pagination (criteria kept in the URL), and Product Details with stock, rating and gallery. Out-of-stock Products are shown deliberately, and loading, error, Not Found and crash states always offer a way back. The epic also sets up the foundation every later epic builds on: the pinned stack, folder layout and import rules, design tokens, page shell, router, query layer, MSW mocks and quality gates. Because the app is also a reference implementation for learners, consistent conventions and traceability matter as much as the features.

## Stories

- Story 1.1: Set Up the Store Foundation
- Story 1.2: Navigate the Store Shell
- Story 1.3: See the Product Grid
- Story 1.4: Search, Filter and Sort Products
- Story 1.5: View Product Details
- Story 1.6: Discover Products from Home

## Requirements & Constraints

- **Listing:** grid of Product Cards (image with title as alt text, Category, title, truncated description, price, action slot); image/title open Details; 20 per page.
- **Search:** case-insensitive on title and description, debounced 300 ms, Enter runs immediately; clearing keeps Category and sort.
- **Category filter:** one at a time, options from the API, "All categories" removes it. **Sort:** Relevance (API order), Price low→high, high→low, applied to the whole result set.
- **Combined criteria** match all active criteria, live in the URL (reload/new tab reproduces results), and any change other than page resets to page 1. Empty results name the criteria and offer *Clear filters*.
- **Details:** own URL, works when opened directly; large image, title, full description, price, Category, rating (numeric plus visual with text equivalent), stock; tab title includes Product title.
- **Stock text:** "In stock", "Only N left" (1–5), "Out of stock"; never colour alone. Out-of-stock Products are never hidden or filtered.
- **Not found:** malformed id shows "Product not found" with no request; API 404/400 shows the same, with "Browse products" and no Retry.
- **Routes:** `/`, `/products`, `/products/:productId`, `/cart`, `/checkout`, `/order-confirmation`, `*`; Back/Forward behave as expected.
- **Home:** hero, Category shortcuts, 8 highest-rated Products (ties by id).
- **Loading/errors:** every data region (listing, details, Home featured, Category list) has a skeleton with `aria-busy`; network/5xx failures show a friendly message with *Retry* (no page reload); one region failing never takes down the page. Render errors show a fallback with Reload and Go to Home, leaving the Cart in storage untouched.
- **Quality:** WCAG 2.1 AA, Lighthouse Performance and Accessibility ≥ 90 on mobile, LCP ≤ 2.5 s, CLS ≤ 0.1, lazy below-fold images, 320 px minimum with no horizontal scroll, 44 px touch targets, zero type/lint errors and enforced formatting. No analytics or third-party scripts.

## Technical Decisions

- **Stack (pinned):** extend the existing Vite 8 + React 19 + TypeScript 6.0.3 scaffold (hold TS at 6.0.3). react-router 8.5.0, imported only from `react-router` / `react-router/dom` (never `react-router-dom`); TanStack Query 5.104.5; Tailwind 4.3.3 via `@tailwindcss/vite`; zod 4.6.7; Vitest 5.0.5 + jsdom; Testing Library; msw 3.0.3; Playwright 1.64.1 + axe; Prettier 3.9.10. Node 22.22.2 in `engines` and `.nvmrc`. Install the rest of the stack (Redux Toolkit, react-hook-form) now as well.
- **Structure and imports:** `src/{app,pages,features/{catalog,cart,checkout},shared/{api,model,ui,lib},mocks}` plus `e2e/`. Imports go one way only: app → pages → features → shared. Features expose only `index.ts`; `catalog` and `cart` never import each other; `shared/` imports nothing above it. ESLint `no-restricted-imports` enforces this. Feature layout is `ui/`, `model/`, `api/`.
- **Data access:** `shared/api/productApi.ts` is the only module that calls `fetch`. It exposes `getCatalog()`, `getProduct(id)` and `getCategories()`, parses DTOs with zod in `shared/api/dto.ts`, maps them to domain types, and converts prices to integer cents. `CATALOG_SELECT` is the single field list. Query keys and option factories (`catalogQueryOptions`, `productQueryOptions`, `categoriesQueryOptions`) live in `shared/api/queries.ts`, and every `useQuery` uses them.
- **Catalog strategy:** fetch the whole catalog once (`limit=0`); `staleTime` 10 min, `gcTime` ≥ 10 min. Reject an incomplete catalog (`products.length !== total`) as a parse error. Search, filter (by slug), sort and pagination are pure functions in `features/catalog/model/`, unit-tested without React. Home and the listing share the same cache.
- **Errors:** only `ApiError { kind: 'network'|'http'|'not-found'|'parse', status? }`. The `:productId` param is zod-validated as a positive integer. Every query renders through `shared/ui/AsyncState`. Render errors go to the root route's `errorElement`.
- **URL criteria:** `useListingCriteria()` over `useSearchParams` is the only reader and writer of `q`, `category`, `sort` (`relevance|price-asc|price-desc`) and `page`. Invalid values fall back to defaults. Criteria are never mirrored in component or global state.
- **Availability:** `isAvailable()` and `stockLabel()` in `shared/model` are the only source of stock text and state. Money is formatted only by `formatMoney()` (en-US, USD).
- **Routing:** a single `createBrowserRouter` table in `src/app/router.tsx` with lazy page modules; navigation only via `Link`, `NavLink` and `useNavigate`.
- **Mocks:** MSW handlers match only `https://dummyjson.com/*` (`onUnhandledRequest: 'bypass'`), honour `limit`/`skip`/`select`, and build responses through the DTO schemas. Fixtures include ≥ 2 products with stock 0, ≥ 1 with low stock, and 404, network-error and incomplete-catalog scenarios. Tests always use MSW; in dev it runs only when `VITE_API_MOCK=true`. The worker is never in `public/`, and a build check fails if `dist/` contains MSW. `npm run contract:live` is a manual live-API check.
- **Coexistence with Markdown Studio:** never edit `netlify.toml`, `vercel.json`, `api/`, `public/markdown.html` or `public/markdown/`. Leave the `acl-markdown-saver` plugin in `vite.config.ts` byte-for-byte unchanged and only append plugins. Shop routes never use `/markdown*` or `/api/*`.
- **Quality gates:** `npm run quality` = `tsc -b` + `eslint .` + `prettier --check .` + `vitest run --coverage` (80% thresholds on cart/checkout). Lint and format ignore `_acl-output/`, `_acl/`, `public/markdown*`, `api/`, `dist/`. A GitHub Actions workflow runs quality on push and PR.
- **Conventions:** `PascalCase.tsx` components, `useX.ts` hooks, `camelCase.ts` logic; tests sit next to code; test titles start with the FR id; code at enforcement points cites the AD id in a comment.

## UX & Interaction Patterns

- **Tokens:** every DESIGN.md colour, typography, radius, spacing and implementation token goes in the `@theme` block of `src/index.css`. Components use no hex literals or one-off spacing (a check must enforce this). Use Tailwind's default breakpoints (`sm` 640, `md` 768, `lg` 1024). Content is centred to 1280 px, with 16/24/32 px gutters. System font stack, and tabular numerals for prices.
- **Shell:** "Skip to content" comes first, then `<header>` (wordmark linking to `/`, a "Shop" link, header visible on mobile, no hamburger), `<main id="main">`, and `<footer>` ("Demo store · No real orders or payments" with a Shop link). Links inside text are always underlined.
- **Route changes:** focus moves to the `h1`, and the title becomes "{Page} · Simple Shopping Cart". A query-only change keeps focus on the control used. A 2 px teal progress bar shows while a lazy module loads.
- **Product Card:** one stretched title link; 1:1 lazy `object-contain` image; `h3` clamped to 2 lines on an inner span, so the focus ring is never clipped; 2-line description; rating; price; an empty action slot (filled in Epic 2). "Only N left" badge for stock 1–5. The out-of-stock card uses `--oos-image-filter` with a centred "Out of stock" badge, keeps title and price at full contrast, and still links to Details. Hover lift on pointer devices only.
- **Listing:** a controls bar (Search Box with a 44 px clear ×, using history `replace`; native Category and Sort `<select>` with visible labels; result count). Filter Chips with × named "Remove filter: {value}", plus "Clear filters". Grid has 2, 3 or 4 columns (below `sm`, from `sm`, from `lg`). Pagination in `<nav aria-label="Pagination">` with `aria-current="page"`, 44 px squares, hidden when there is one page; a page change scrolls to the grid and focuses the result count. The count is announced after search, Category or sort changes. If categories fail, the select shows "Categories unavailable" with an inline Retry.
- **Details:** two columns from `md`, stacked below. Gallery thumbnails are named "Show image N of M", use `aria-pressed`, and keep focus. Rating reads "Rated 4.5 out of 5"; price uses `price-lg`; Stock Badge is a pill. "Back to products" restores the previous listing URL.
- **States:** 8 skeleton cards in the real grid, with the count reading "Loading products…", and a shimmer. The inline Alert (`role="alert"`) reads "We couldn't load products. Check your connection and try again." with Retry, which moves focus to the region container (`tabindex=-1`). The empty-results `h2` is "No products match". Not Found shows "Page not found" (`display`) with links to Home and Shop. The error page shows "Something went wrong", "Your cart is safe.", Reload and Go to Home.
- **Motion and bans:** all motion is off under `prefers-reduced-motion`. No infinite scroll, autoplay carousels, fake urgency, hover-only affordances or colour-only status. Focus ring is 2 px with a 2 px offset. axe runs at 320, 390 and 1280 px.

## Cross-Story Dependencies

- Story 1.1 (stack, structure, tokens, gates, MSW wiring) comes before every other story. Story 1.2 (router, shell, error page) comes before the page stories.
- Story 1.3 creates the adapter, DTOs, query options, fixtures, Product Card, Pagination and AsyncState. Stories 1.4–1.6 reuse them, and Epic 2 reconciliation reuses the MSW scenarios.
- The Product Card and Details action slots stay empty until Epic 2 fills them with `cart`'s `AddToCartButton` by composition. The header cart indicator also arrives in Epic 2.
- The sort control and the pure sort functions must stay extensible: Epic 4 adds "sort by rating" as the worked extension example.
