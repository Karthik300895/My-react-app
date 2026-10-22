import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { Product } from '../../../shared/model/product'
import { ProductCard } from './ProductCard'

const base: Product = {
  id: 42,
  title: 'Knoll Saarinen Executive Conference Chair',
  description: 'A long description that the card clamps to two lines.',
  priceCents: 49999,
  category: 'home-decoration',
  rating: 4.11,
  stock: 47,
  thumbnail: 'https://cdn.dummyjson.com/product-images/x/thumbnail.webp',
}

function renderCard(
  overrides: Partial<Product> = {},
  action?: React.ReactNode,
) {
  render(
    <MemoryRouter>
      <ProductCard product={{ ...base, ...overrides }} action={action} />
    </MemoryRouter>,
  )
  return screen.getByRole('article')
}

describe('ProductCard (UX-DR5)', () => {
  it('FR1: shows image, Category, title, description, rating and formatted price', () => {
    const card = renderCard()

    const image = within(card).getByRole('img', { name: base.title })
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('src', base.thumbnail)
    expect(within(card).getByText('Home Decoration')).toBeInTheDocument()
    expect(within(card).getByText(base.description)).toHaveClass('line-clamp-2')
    expect(within(card).getByText('Rated 4.1 out of 5')).toBeInTheDocument()
    expect(within(card).getByText('$499.99')).toHaveClass('tabular-nums')
  })

  it('FR1: the h3 title is the single stretched link to Product Details, clamped on an inner span', () => {
    const card = renderCard()

    const heading = within(card).getByRole('heading', { level: 3 })
    const link = within(heading).getByRole('link', { name: base.title })
    expect(link).toHaveAttribute('href', '/products/42')
    expect(within(card).getAllByRole('link')).toHaveLength(1)
    // The clamp is on the inner span, never on the focusable link, so its ring isn't clipped.
    expect(link).not.toHaveClass('line-clamp-2')
    expect(within(link).getByText(base.title)).toHaveClass('line-clamp-2')
    expect(link.className).toMatch(/after:absolute/)
  })

  it('FR1: renders the action slot content above the stretched link', () => {
    const card = renderCard({}, <button type="button">Slot action</button>)

    const slot = within(card)
      .getByRole('button', { name: 'Slot action' })
      .closest('[data-slot="action"]')
    expect(slot).toHaveClass('relative', 'z-10')
  })

  it('FR8: an in-stock card shows no stock badge and an unfiltered image', () => {
    const card = renderCard({ stock: 47 })

    expect(within(card).queryByText(/left|Out of stock/)).toBeNull()
    expect(within(card).getByRole('img').className).not.toMatch(
      /oos-image-filter/,
    )
  })

  it('FR8: stock 1–5 shows an "Only N left" badge over the image', () => {
    const card = renderCard({ stock: 3 })

    const badge = within(card).getByText('Only 3 left')
    expect(badge).toHaveClass('absolute')
    expect(badge.parentElement).toContainElement(within(card).getByRole('img'))
  })

  it('FR8, AD-9: an out-of-stock card is still a full card with a filtered image and an "Out of stock" badge', () => {
    const card = renderCard({ stock: 0 })

    expect(within(card).getByText('Out of stock')).toBeInTheDocument()
    expect(within(card).getByRole('img').className).toMatch(
      /\[filter:var\(--oos-image-filter\)\]/,
    )
    // UX-DR6: title and price keep full contrast and the card still links to details.
    const link = within(card).getByRole('link', { name: base.title })
    expect(link).toHaveAttribute('href', '/products/42')
    expect(within(card).getByText('$499.99')).toHaveClass('text-foreground')
    expect(link.closest('h3')).toHaveClass('text-foreground')
  })
})
