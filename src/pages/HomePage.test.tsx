import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Outlet } from 'react-router'
import { describe, expect, it } from 'vitest'
import { productFixtures } from '../mocks/fixtures/products'
import { server } from '../mocks/node'
import { scenarios } from '../mocks/scenarios'
import { configureStore } from '@reduxjs/toolkit'
import { cartReducer } from '../features/cart'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { HomePage } from './HomePage'

const makeStore = () =>
  configureStore({ reducer: { cart: cartReducer, notices: noticesReducer } })

function renderHome() {
  return renderWithRouter(
    [
      {
        path: '/',
        Component: () => (
          <main>
            <Outlet />
          </main>
        ),
        children: [
          { index: true, Component: HomePage },
          { path: 'products', Component: () => <p>Listing</p> },
        ],
      },
    ],
    '/',
    makeStore(),
  )
}

const topEight = [...productFixtures]
  .sort((a, b) => b.rating - a.rating || a.id - b.id)
  .slice(0, 8)

describe('HomePage', () => {
  it('FR31: shows the hero headline and a link to all products', async () => {
    renderHome()
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /find your favourite/i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Shop all products' }),
    ).toHaveAttribute('href', '/products')
  })

  it('FR31: lists category shortcuts linking to filtered listing', async () => {
    renderHome()
    const nav = await screen.findByRole('navigation', {
      name: 'Category shortcuts',
    })
    const beauty = within(nav).getByRole('link', { name: 'Beauty' })
    expect(beauty).toHaveAttribute('href', '/products?category=beauty')
  })

  it('FR31: shows the 8 highest-rated Products, ties by id', async () => {
    renderHome()
    const region = await screen.findByRole('region', {
      name: 'Top rated products',
    })
    const cards = await within(region).findAllByRole('listitem')
    expect(cards).toHaveLength(8)
    for (const product of topEight) {
      expect(
        await within(region).findByRole('link', { name: product.title }),
      ).toBeInTheDocument()
    }
  })

  it('FR34: a catalog failure keeps the hero and shows Retry in the featured region', async () => {
    server.use(scenarios.serverError)
    renderHome()
    const region = await screen.findByRole('region', {
      name: 'Top rated products',
    })
    expect(await within(region).findByRole('alert')).toHaveTextContent(
      "We couldn't load products",
    )
    expect(
      screen.getByRole('heading', { level: 1, name: /find your favourite/i }),
    ).toBeInTheDocument()
  })

  it('FR34: Retry on a failed catalog refetches and shows products', async () => {
    const user = userEvent.setup()
    server.use(scenarios.serverError)
    renderHome()
    const region = await screen.findByRole('region', {
      name: 'Top rated products',
    })
    await within(region).findByRole('alert')

    server.resetHandlers()
    await user.click(within(region).getByRole('button', { name: 'Retry' }))
    await waitFor(() =>
      expect(within(region).getAllByRole('listitem')).toHaveLength(8),
    )
  })

  it('a category failure keeps the featured products visible', async () => {
    server.use(scenarios.categoriesError)
    renderHome()
    const region = await screen.findByRole('region', {
      name: 'Top rated products',
    })
    expect(await within(region).findAllByRole('listitem')).toHaveLength(8)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      "We couldn't load categories",
    )
  })
})
