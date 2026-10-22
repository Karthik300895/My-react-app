---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T16:20:42.847Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
title: 'Story 1.2: Navigate the Store Shell'
tier: Tier 2 (Greenfield per-story gate)
type: feature
created: '2026-10-21'
story_key: 1-2-navigate-the-store-shell
review_loop_iteration: 0
baseline_commit: NO_VCS
context:
  - '{project-root}/_acl-output/4-implementation/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After Story 1.1 the shop is a single placeholder page. There are no routes, no header or footer, no Not Found page and no crash fallback, so a Shopper cannot move around or recover from a wrong turn (FR30, FR32, FR35).

**Approach:** Add the single AD-11 route table with lazy page modules (placeholders until their stories land), a RootLayout shell (skip link, header, main, footer, Route Progress Bar), route-change focus and title handling, plus the Not Found and global error pages.

## Boundaries & Constraints

**Always:** Import from `react-router` / `react-router/dom` only. Navigate only via `Link`, `NavLink` and `useNavigate`. Use tokens only (no hex, no one-off spacing). Give interactive targets a 44 px minimum. Underline links inside running text. Keep focus rings visible.

**Ask First:** Any change to the Story 1.1 gates, `vite.config.ts` or Markdown Studio paths. Any route path other than the seven in AD-11.

**Never:** Add a hamburger menu, the Header Cart Indicator, Notices or guards (Epic 2/3). Add product data fetching (Story 1.3+). Touch Local Storage from the error page.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Known route | Visit `/`, `/products`, `/products/1`, `/cart`, `/checkout`, `/order-confirmation` | The lazy page renders a single `h1`; title is "{Page} · Simple Shopping Cart" | N/A |
| Path change | Navigate `/` → `/cart` | Focus moves to the Cart `h1` | N/A |
| Query-only change | `/products` → `/products?q=x` | Focus stays on the control used; title unchanged | N/A |
| Back / Forward | `/` → `/cart`, then Back, then Forward | `/` then `/cart` render in order | N/A |
| Lazy module loading | Navigation pending on a lazy page | 2 px teal progress bar shows; previous page stays visible | N/A |
| Unknown URL | `/nope` | "Page not found" (`display`) with links to Home and Shop | N/A |
| Render error | A page throws during render | `h1` "Something went wrong", "Your cart is safe.", [Reload] [Go to Home] | Local Storage unchanged |
| Lazy module fails | The page import rejects | Global error page | Same as render error |

</frozen-after-approval>

## Code Map

- `src/app/App.tsx`, `src/app/App.test.tsx` -- Story 1.1 placeholder → delete; `main.tsx` mounts `RouterProvider` instead.
- `src/app/main.tsx` -- keeps the `enableMocking().catch().finally()` bootstrap (Story 1.1 review fix).
- `src/index.css` -- tokens exist; utilities like `max-w-content-max`, `px-gutter-*`, `text-display`, `min-h-touch-target`, `bg-primary` resolve from `@theme`.
- `eslint.config.js` -- `src/app/**` may import pages and `features/<name>` index only. `src/pages/**` must not import `app/`, so shared page helpers go in `shared/`.
- `tooling/design-tokens.test.ts` -- the hex scan covers new `src/` files automatically.
- `playwright.config.ts` -- `webServer` (build + preview :4173), desktop and mobile projects; Chromium is installed locally.
- react-router 8.5.0: route `lazy: () => import(...).then(m => ({ Component: m.X }))`; `RouterProvider` from `react-router/dom`; `useNavigation().state` is `'loading'` while lazy modules resolve.

## Tasks & Acceptance

**Execution:**
- [x] `src/app/router.tsx` -- export `routes` (root route: `Component: RootLayout`, `ErrorBoundary: ErrorPage`, seven lazy children) and `createAppRouter()` → `createBrowserRouter(routes)` -- AD-11
- [x] `src/app/main.tsx` -- render `<RouterProvider router={createAppRouter()} />`; delete `App.tsx` and `App.test.tsx`
- [x] `src/app/RootLayout.tsx` -- skip link → header (wordmark: cart glyph + "Simple Shopping Cart" → `/`; "Shop" → `/products`; sticky, no hamburger) → `<main id="main" tabIndex={-1}>` with `<Outlet/>` → footer ("Demo store · No real orders or payments" + underlined Shop link); `<ScrollRestoration/>` -- UX-DR3, UX-DR23
- [x] `src/app/RouteProgressBar.tsx` -- 2 px `bg-primary` fixed bar while `useNavigation().state !== 'idle'` -- UX-DR22
- [x] `src/app/useRouteFocus.ts` -- on `pathname` change (not the first render) focus `main h1` (`tabIndex=-1`); query-only changes are ignored -- AD-11, UX-DR32
- [x] `src/app/ErrorPage.tsx` -- standalone page: own skip link, `main#main`, `h1` "Something went wrong", "Your cart is safe.", [Reload] → `location.reload()`, [Go to Home] → `location.assign('/')`; never touches storage -- FR35, UX-DR29
- [x] `src/shared/lib/useDocumentTitle.ts` -- sets "{page} · Simple Shopping Cart"
- [x] `src/shared/ui/PageContainer.tsx` -- centred `max-w-content-max` with 16/24/32 px gutters
- [x] `src/pages/{HomePage,ProductListingPage,ProductDetailsPage,CartPage,CheckoutPage,OrderConfirmationPage,NotFoundPage}.tsx` -- placeholders with a single `h1` and title; NotFound shows `display` "Page not found" with Home and Shop links -- FR30, FR32
- [x] `src/app/router.test.tsx` -- `createMemoryRouter(routes)` tests for every matrix row (FR30, FR32, FR35, UX-DR22, UX-DR32)
- [x] `src/app/SkipLink.tsx` -- shared by RootLayout and ErrorPage so both keep the skip link first
- [x] `tsconfig.e2e.json`, `tsconfig.json`, `eslint.config.js` -- type-check and lint `e2e/` (see Spec Change Log #1)
- [x] `e2e/shell.spec.ts` -- at 320, 768 and 1280 px: no horizontal scroll, gutters 16/24/32 px, content ≤ 1280 px, skip link is the first Tab stop

**Acceptance Criteria:**
- Given any route, when it renders, then there is one `header`, one `main#main`, one `footer` and exactly one `h1`, and "Skip to content" is the first focusable element.
- Given `npm run quality` and `npm run test:e2e`, when they run, then both pass.

## Spec Change Log

1. **Finding:** the Playwright specs need DOM types for `page.evaluate` callbacks, which `tsconfig.node.json` lacks. Because `tsc -b` failed, `npm run build` (the Playwright `webServer`) failed too. **Amended:** added `tsconfig.e2e.json` (ES2023 + DOM, Node types), referenced from `tsconfig.json`. **Avoids:** e2e code going unchecked, or DOM types leaking into tooling.
2. **Finding:** the sticky-header test passed without `sticky`, because the placeholder page never scrolls. **Amended:** the test adds 2000 px of filler, asserts `scrollY > 0`, and waits for the `h1` first. **KEEP:** this was mutation-checked; without `sticky` the header sits at −1972 px and the test fails.
3. **Review fixes (patch):**
   - The Shop `NavLink` gets `end`, so it is no longer `aria-current` on Product Details.
   - Route focus uses `focus({ preventScroll: true })` and falls back to `main` when a page has no `h1`, so Back/Forward keeps its restored scroll.
   - ErrorPage scrolls to the top and focuses its `h1` on mount, so a navigation that crashes doesn't lose focus.
   - `scroll-padding-top` keeps focus targets clear of the sticky header.
   - New tests cover: Reload and Go to Home clicks (stubbed `location`), crash-navigation focus, the Not Found title, the Shop `aria-current`, gutters on the header, main and footer, a 1440 px width (proves the 1280 px cap and centring), and scroll reset on a new page (mutation-checked without `ScrollRestoration`).
   - CI now installs Chromium and runs `npm run test:e2e`, and `--pass-with-no-tests` is removed.

## Design Notes

- **The error page is standalone,** because the root `ErrorBoundary` replaces RootLayout. It brings its own landmarks and uses full-page `location` calls rather than the router, so it still works when the router itself is what broke.
- **Initial load does not move focus,** so the skip link stays the first Tab stop. Only later path changes focus the `h1`.
- **Titles are set by each page** (`useDocumentTitle`) rather than route `handle`, so Story 1.5 can include the Product title from loaded data.

## Verification

**Commands:**
- `npm run quality` -- exit 0
- `npm run build` -- exit 0 (`check:build` passes)
- `npm run test:e2e` -- exit 0 (desktop + mobile projects)

## Suggested Review Order

**Route table (AD-11)**

- Entry point: one data-mode table, lazy pages, and the root ErrorBoundary for crashes and failed module loads.
  [`router.tsx:7`](../../src/app/router.tsx#L7)

**Shell and landmarks (UX-DR3)**

- Skip link first, a sticky header with no hamburger, `main#main`, and a footer with an underlined inline link.
  [`RootLayout.tsx:32`](../../src/app/RootLayout.tsx#L32)

- `end` stops "Shop" from being marked current on Product Details.
  [`RootLayout.tsx:46`](../../src/app/RootLayout.tsx#L46)

- One container gives every region the 1280 px cap and 16/24/32 px gutters.
  [`PageContainer.tsx:12`](../../src/shared/ui/PageContainer.tsx#L12)

**Focus, titles and scroll (UX-DR32)**

- Path changes only (not the first load or query changes); `preventScroll` keeps Back/Forward positions.
  [`useRouteFocus.ts:17`](../../src/app/useRouteFocus.ts#L17)

- Each page sets its own title, so Story 1.5 can add the Product title.
  [`useDocumentTitle.ts:6`](../../src/shared/lib/useDocumentTitle.ts#L6)

- Keeps focused headings clear of the sticky header.
  [`index.css:112`](../../src/index.css#L112)

**Recovery pages (FR32, FR35)**

- Standalone page with full-page Reload and Go to Home; it focuses its `h1` and never touches storage.
  [`ErrorPage.tsx:21`](../../src/app/ErrorPage.tsx#L21)

- Not Found in `display` style with two ways back.
  [`NotFoundPage.tsx:6`](../../src/pages/NotFoundPage.tsx#L6)

**Tests and CI (peripherals)**

- Unit tests, one or more per I/O matrix row, built on the real route table.
  [`router.test.tsx:29`](../../src/app/router.test.tsx#L29)

- Real-browser layout checks at 320, 768, 1280 and 1440 px, plus skip link, sticky header and scroll reset.
  [`shell.spec.ts:13`](../../e2e/shell.spec.ts#L13)

- CI runs the e2e suite after quality and build.
  [`quality.yml:25`](../../.github/workflows/quality.yml#L25)
