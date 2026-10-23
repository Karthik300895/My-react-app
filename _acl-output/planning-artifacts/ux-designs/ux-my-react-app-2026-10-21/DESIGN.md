---
status: Approved
reviewed_by: Manager (via Markdown Studio)
review_timestamp: 2026-10-21T14:53:21.506Z
gate_signature: ACL-STUDIO-APPROVAL-APPROVED
name: 'Simple Shopping Cart'
description: 'Calm, trustworthy demo storefront. Tailwind CSS v4 tokens (@theme) with in-house shared/ui components; no third-party UI library.'
created: '2026-10-21'
updated: '2026-10-21'
sources:
  - _acl-output/planning-artifacts/prds/prd-my-react-app-2026-10-21/prd.md
  - _acl-output/planning-artifacts/architecture/architecture-my-react-app-2026-10-21/ARCHITECTURE-SPINE.md
colors:
  # Light theme only in V1. Names are semantic so a *-dark set can be added later without touching components.
  background: '#FAFAF9'
  surface: '#FFFFFF'
  foreground: '#1C1917'
  muted: '#F5F5F4'
  muted-foreground: '#57534E'
  border: '#E7E5E4'
  border-strong: '#8A8580'
  primary: '#0F766E'
  primary-hover: '#115E59'
  primary-foreground: '#FFFFFF'
  primary-subtle: '#F0FDFA'
  focus-ring: '#0F766E'
  success: '#15803D'
  success-subtle: '#F0FDF4'
  warning: '#B45309'
  warning-subtle: '#FFFBEB'
  danger: '#B91C1C'
  danger-subtle: '#FEF2F2'
  rating: '#B45309'
  overlay: '#1C1917'
typography:
  display:
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.02em
  h1:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.25'
  h3:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.45'
  label:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.3'
  caption:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: 0.02em
  price:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.2'
  price-lg:
    fontFamily: '{typography.display.fontFamily}'
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.15'
  mono:
    fontFamily: 'ui-monospace, "SF Mono", "Cascadia Mono", Consolas, monospace'
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: 0.04em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  # Tailwind's 4px base scale is inherited; these are the named layout tokens.
  gutter-mobile: 16px
  gutter-tablet: 24px
  gutter-desktop: 32px
  grid-gap: 16px
  grid-gap-lg: 24px
  section-gap: 48px
  content-max: 1280px
  form-max: 560px
  touch-target: 44px
components:
  button-primary:
    background: '{colors.primary}'
    background-hover: '{colors.primary-hover}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.md}'
    min-height: '{spacing.touch-target}'
    typography: '{typography.label}'
  button-secondary:
    background: '{colors.surface}'
    foreground: '{colors.foreground}'
    border: '{colors.border-strong}'
    radius: '{rounded.md}'
    min-height: '{spacing.touch-target}'
  button-ghost:
    background: 'transparent'
    foreground: '{colors.primary}'
    radius: '{rounded.md}'
  button-disabled:
    background: '{colors.muted}'
    foreground: '{colors.muted-foreground}'
    border: '{colors.border}'
  product-card:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
    image-background: '{colors.surface}'
    padding: 12px
  badge-low-stock:
    background: '{colors.warning-subtle}'
    foreground: '{colors.warning}'
    radius: '{rounded.full}'
    typography: '{typography.caption}'
  badge-out-of-stock:
    background: '{colors.foreground}'
    foreground: '{colors.surface}'
    radius: '{rounded.full}'
    typography: '{typography.caption}'
  badge-in-stock:
    background: '{colors.success-subtle}'
    foreground: '{colors.success}'
    radius: '{rounded.full}'
    typography: '{typography.caption}'
  quantity-stepper:
    border: '{colors.border-strong}'
    radius: '{rounded.md}'
    button-size: '{spacing.touch-target}'
  input:
    background: '{colors.surface}'
    border: '{colors.border-strong}'
    border-error: '{colors.danger}'
    radius: '{rounded.md}'
    min-height: '{spacing.touch-target}'
  notice:
    background: '{colors.foreground}'
    foreground: '{colors.surface}'
    radius: '{rounded.md}'
  alert-error:
    background: '{colors.danger-subtle}'
    foreground: '{colors.danger}'
    radius: '{rounded.md}'
  header-cart-indicator-count:
    background: '{colors.primary}'
    foreground: '{colors.primary-foreground}'
    radius: '{rounded.full}'
  skeleton:
    background: '{colors.muted}'
    radius: '{rounded.md}'
confluence_page_id: 819233
---

## Brand & Style

Simple Shopping Cart is a calm, trustworthy demo storefront. The products are the colour; the interface is quiet around them. It should look like a store you would buy from: clean white product tiles on a warm off-white page, one confident teal for every primary action, and generous space. There are no gimmicks. It is also a teaching codebase, so every visual rule is a token, and nothing is styled ad hoc. *[ASSUMPTION: posture inferred; no brand assets were supplied]*

The visible name is **Simple Shopping Cart**, shown as a plain wordmark (text in `{typography.h3}`, with a small cart glyph in `{colors.primary}`). *[ASSUMPTION]*

## Colors

- **Teal `{colors.primary}`** is the only brand colour. It is used for primary buttons, links, the header cart count, the focus ring and the active filter. It is never used for status. Its contrast is 5.47:1 on white and 5.24:1 on the page background.
- **Warm neutrals:**
  - `{colors.background}` is the page.
  - `{colors.surface}` is cards, panels and inputs.
  - `{colors.foreground}` is text, about 17:1 on surface.
  - `{colors.muted-foreground}` is secondary text, about 7.5:1 on surface.
  - `{colors.border}` is for dividers.
  - `{colors.border-strong}` is for input and stepper outlines, so they read as controls. It is 3.65:1 on white, which meets the 3:1 WCAG 1.4.11 requirement for non-text elements.
- **Semantic colours, used only for status:**
  - `{colors.success}`: "In stock".
  - `{colors.warning}`: "Only N left". The same amber is `{colors.rating}` for star ratings.
  - `{colors.danger}`: errors and destructive actions.

  All three are 700 weights, which meet AA (≥ 4.5:1) as text on their `-subtle` tints: success 4.79, warning 4.84, danger 5.91.
- **Out of stock is deliberately neutral, not red.** Unavailable is a fact, not an error. It uses an inverted `{colors.foreground}` badge.

Avoid: gradients, more than one brand colour, colour-only status, red on product tiles except in error states.

## Typography

The system UI font stack is used throughout. There is no web-font request, which keeps first paint fast and avoids third-party calls (NFR-1, NFR-6).

| Role | Use |
|---|---|
| `display` | Home hero headline, Order Confirmation headline |
| `h1` | One per page: page titles and the product title on Product Details |
| `h2` / `h3` | Section headings, panel titles, product titles on cards (`h3`, clamped to 2 lines) |
| `body` / `body-sm` | Descriptions, form help, cart line meta |
| `label` | Buttons, form labels, filter controls |
| `caption` | Badges, category tag, image counters |
| `price` / `price-lg` | Prices on cards and summary lines / the price and Order Total on Product Details. Always tabular numerals. |
| `mono` | The Order Number only |

## Layout & Spacing

- Tailwind's 4 px base scale is used.
- Content is centred to `{spacing.content-max}`, with side gutters of `{spacing.gutter-mobile}` / `{spacing.gutter-tablet}` / `{spacing.gutter-desktop}` below `sm` / from `sm` / from `lg`.
- **Breakpoints** are Tailwind v4's defaults, used by name in both spines: `sm` = 640 px, `md` = 768 px, `lg` = 1024 px. The minimum supported width is **320 px** (WCAG 1.4.10 reflow).
- Product grid columns: **2** below `sm`, **3** from `sm`, **4** from `lg`. The gap is `{spacing.grid-gap}`, or `{spacing.grid-gap-lg}` on `lg+`.
- Forms are capped at `{spacing.form-max}`.
- Page sections are separated by `{spacing.section-gap}`.
- Every interactive target is at least `{spacing.touch-target}` square.

## Elevation & Depth

The design is flat by default. Structure comes from borders, not shadows.
- **Product card hover (pointer devices only):** a single soft shadow (`0 4px 12px rgb(28 25 23 / 0.08)`) and a 2 px lift.
- **Notices and the Clear-cart dialog** are the only floating layers. They use `0 8px 24px rgb(28 25 23 / 0.16)`. The dialog backdrop is `{colors.overlay}` at 40% opacity.

**Implementation tokens** (declared in `@theme` alongside the colours, never written inline):
- `--shadow-card-hover` = the card hover shadow above
- `--shadow-float` = the Notice and Dialog shadow
- `--overlay-opacity` = 0.4
- `--oos-image-filter` = `grayscale(0.6) opacity(0.75)`
- `--motion-fast` = 150ms, `--motion-pop` = 200ms, `--motion-shimmer` = 1.5s

## Shapes

- `{rounded.sm}`: inline chips and skeleton text bars.
- `{rounded.md}`: buttons, inputs, steppers, notices.
- `{rounded.lg}`: cards and panels.
- `{rounded.full}`: badges and the header count only.

## Components

- **Button.**
  - *Primary:* `{colors.primary}` fill, white label, hover `{colors.primary-hover}`.
  - *Secondary:* white with `{colors.border-strong}`.
  - *Ghost:* teal text, used for links styled as actions ("Edit cart", "Clear filters").
  - *Disabled:* `{colors.muted}` fill, `{colors.muted-foreground}` label and a visible border. The reason for disabling is always visible text, never conveyed by opacity alone. Either the button label *is* the reason ("Out of stock", "Maximum available quantity in cart", which may wrap to two lines) or the reason sits directly below the control. Disabled buttons use `aria-disabled` styling (Tailwind `aria-disabled:` variant), not the `disabled:` variant.
- **Product Card.** White tile with a `{colors.border}` border and `{rounded.lg}` corners.
  - **Image:** square (1:1), `object-contain` on white, lazy-loaded.
  - **Category:** `caption` in `{colors.muted-foreground}`.
  - **Title:** `h3`, clamped to 2 lines. The clamp goes on an inner span, never on the focusable link, so the focus ring is never clipped. Corner clipping (`overflow: hidden`) applies only to the image wrapper, never to an element that contains a focus target.
  - **Description:** `body-sm` in `{colors.muted-foreground}`, clamped to 2 lines (FR-1).
  - **Rating:** amber stars plus the numeric value in `body-sm`.
  - **Price:** `price`.
  - **Action:** full-width primary *Add to Cart*.
  - **Badges:** "Only N left" (`badge-low-stock`) sits top-left over the image, and appears only when stock is 1–5.
- **Out-of-stock Product Card.** The design target is "elegant, not broken". *[Per user direction: show out-of-stock products, and make them look good]*
  - Image uses `--oos-image-filter`. Text stays at full contrast.
  - `badge-out-of-stock` ("Out of stock") centred over the lower third of the image.
  - The action becomes a disabled button labelled **"Out of stock"**.
  - The price stays visible.
  - The card still links to Product Details.
- **Stock Badge on Product Details.** It always shows one of three states:
  - `badge-in-stock` "In stock"
  - `badge-low-stock` "Only N left"
  - `badge-out-of-stock` "Out of stock"
- **Quantity Stepper.** `[ − ] 2 [ + ]` in one `{rounded.md}` outlined group. Each button is a 44 px square, and the value is `label` with tabular numerals. A disabled side shows a muted glyph.
- **Header.** White bar with a bottom border, containing the wordmark, a "Shop" link, and the Header Cart Indicator. The indicator is a cart icon with a `header-cart-indicator-count` pill. The pill is always visible: at 0 it shows "0" with a `{colors.muted}` fill and `{colors.muted-foreground}` text, and it switches to teal from 1 (FR-28).
- **Notice.** A dark (`{colors.foreground}`) toast with white text, a dismiss ×, and `{rounded.md}` corners. Persistent notices add a `{colors.warning}` left rule. On the dark Notice, the focus ring is `{colors.surface}`, because teal on near-black is only 3.2:1. A collapsed Notice ("{k} changes to your cart") shows a "Show details" ghost toggle in `{colors.surface}`. Its expanded list uses `body-sm` rows and a maximum height of 40vh, with scrolling. Load errors are never Notices; they are inline Alerts.
- **Alert (inline error).** `{colors.danger-subtle}` panel with `{colors.danger}` text, an icon, a message and a *Retry* secondary button.
- **Skeleton.** `{colors.muted}` blocks shaped like the content they replace, with a slow 1.5 s shimmer. The shimmer is disabled under reduced motion.
- **Form Field.** Label above the input. Help text uses `body-sm` muted. The error message is below the input in `{colors.danger}` with an icon, and the input border switches to `border-error`.
- **Search Box.** An `input` token field with a leading search icon and a trailing clear × (44 px hit area), full width below `sm`.
- **Select** (Category, Sort). A native `<select>` styled with the `input` tokens and a chevron. Each always has a visible `label` above it.
- **Pagination.** A row of 44 px `button-secondary` squares. The current page is `button-primary`. Previous/Next carry text labels from `sm`, and arrows with accessible names only below `sm`.
- **Cart Line.** Thumbnail (64 px, or 96 px from `sm`), title (`label`, links to Product Details), unit price (`body-sm`, muted), Quantity Stepper, Line Total (`price`), and a Remove ghost button. Separated by a `{colors.border}` rule.
- **Cart Summary** (Cart page) and **Order Total Panel** (Checkout). A `{colors.surface}` card with `{rounded.lg}` corners and a `{colors.border}` border. Rows are `body` (label left, value right, tabular). The Order Total row is `price` and sits above a divider. Only the Cart Summary has the full-width *Checkout* `button-primary`.
- **Product Gallery.** A main image (1:1, `object-contain`, `{rounded.lg}` frame) above a row of 64 px thumbnails. The selected thumbnail has a 2 px `{colors.primary}` border; the others have `{colors.border}`.
- **Filter Chip.** `{colors.primary-subtle}` fill, `{colors.primary}` text in `label`, `{rounded.full}`, with a trailing × (44 px hit area).
- **Danger Ghost Button** (Clear cart). A `<button>` with `{colors.danger}` text and no fill, underlined on hover and focus.
- **Inline Link** (links inside body text). `{colors.primary}`, **always underlined**, because the contrast between teal and body text alone is under 3:1 (WCAG 1.4.1).
- **Dialog.** `{colors.surface}` panel, `{rounded.lg}` corners, `{spacing.gutter-tablet}` padding and a maximum width of 400 px. Actions are right-aligned on `md+` and stacked full-width on mobile.
- **Spinner.** A 16 px ring in `currentColor`, used only inside the *Confirm purchase* button.
- **Route Progress Bar.** A 2 px `{colors.primary}` bar at the very top of the viewport while a lazy page module loads.
- **Order Total Disclosure** (Checkout on mobile). A `{colors.surface}` bar with a `{colors.border}` bottom edge: "Order total $X" in `label` plus a "Show items" ghost toggle. Its expanded panel uses `body-sm` rows.
- **Checkout Progress.** Three numbered steps (Review · Shipping · Summary). Completed steps get a teal check, the current step teal text with an underline, and upcoming steps muted text.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use only tokens. Every colour, radius and space comes from the frontmatter. | Hard-code hex values or one-off spacing in components |
| Keep `{colors.primary}` for actions and focus | Use teal for status, or red for out-of-stock |
| Show stock state as text (badges and button labels) | Signal stock by colour or opacity alone |
| Let product imagery be the colour | Add decorative gradients, patterns or illustrations |
| Keep out-of-stock cards fully legible | Fade the title or price of unavailable products |
| Use tabular numerals for every price and quantity | Use proportional figures that make totals jitter |
