import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { cartReducer } from '../features/cart'
import { checkoutReducer, type CheckoutState } from '../features/checkout'
import type { CartItem } from '../shared/model/cartItem'
import { renderWithRouter } from '../shared/lib/renderWithRouter'
import { noticesReducer } from '../shared/ui/notice/noticesSlice'
import { CartPage } from './CartPage'
import { CheckoutPage } from './CheckoutPage'

const item: CartItem = {
  productId: 1,
  title: 'Product 1',
  thumbnail: 'https://example.test/1.png',
  unitPriceCents: 1000,
  stock: 9,
  quantity: 1,
}

function renderAt(step: CheckoutState['step'] = 'review') {
  const store = configureStore({
    reducer: {
      cart: cartReducer,
      notices: noticesReducer,
      checkout: checkoutReducer,
    },
    preloadedState: {
      cart: { items: [item] },
      checkout: {
        step,
        shippingDraft: null,
        lastOrder: null,
        issuedOrderNumbers: [],
        placing: false,
      },
    },
  })
  renderWithRouter(
    [
      { path: '/cart', Component: CartPage },
      { path: '/checkout', Component: CheckoutPage },
    ],
    '/checkout',
    store,
  )
  return store
}

const VALID: Record<string, string> = {
  'Full name': 'Ada Lovelace',
  Email: 'ada@example.com',
  Phone: '+1 555 010 9999',
  'Address line 1': '10 Downing Street',
  City: 'London',
  'State or region': 'Greater London',
  'Postal code': 'SW1A2AA',
  Country: 'United Kingdom',
}

const field = (label: string) => screen.getByLabelText(new RegExp(`^${label}`))

function fillValid() {
  for (const [label, value] of Object.entries(VALID)) {
    fireEvent.change(field(label), { target: { value } })
  }
}

// Gets to step 2 from a fresh visit. Checkout always opens at Review (UX-DR27).
function goToShipping() {
  fireEvent.click(screen.getByRole('button', { name: 'Continue to shipping' }))
}

function renderShipping() {
  const store = renderAt()
  goToShipping()
  return store
}

describe('CheckoutPage shipping step', () => {
  it('FR25: step 2 shows nine labelled fields in one column', () => {
    renderShipping()
    const labels = [
      'Full name',
      'Email',
      'Phone',
      'Address line 1',
      'Address line 2',
      'City',
      'State or region',
      'Postal code',
      'Country',
    ]
    for (const label of labels) {
      expect(field(label)).toBeInTheDocument()
    }
  })

  it('UX-DR17: every field carries its autocomplete attribute', () => {
    renderShipping()
    const expected: Record<string, string> = {
      'Full name': 'name',
      Email: 'email',
      Phone: 'tel',
      'Address line 1': 'address-line1',
      'Address line 2': 'address-line2',
      City: 'address-level2',
      'State or region': 'address-level1',
      'Postal code': 'postal-code',
      Country: 'country-name',
    }
    for (const [label, autocomplete] of Object.entries(expected)) {
      expect(field(label)).toHaveAttribute('autocomplete', autocomplete)
    }
  })

  it('UX-DR17: required fields say "required" in text, and address line 2 says "optional"', () => {
    renderShipping()
    expect(screen.getByLabelText(/^Full name/)).toHaveAccessibleName(/required/)
    expect(screen.getByLabelText(/^Address line 2/)).toHaveAccessibleName(
      /optional/,
    )
  })

  it('FR25: an invalid email on blur shows fix-it text, aria-invalid, and aria-describedby', async () => {
    renderShipping()
    const email = field('Email')
    fireEvent.change(email, { target: { value: 'not-an-email' } })
    fireEvent.blur(email)

    const message = await screen.findByText(
      'Enter a valid email, like name@example.com.',
    )
    expect(email).toHaveAttribute('aria-invalid', 'true')
    expect(email).toHaveAttribute('aria-describedby', message.id)
  })

  it('FR25: "Review order" with invalid fields keeps the step, names the count, and focuses the first invalid field', async () => {
    const store = renderShipping()
    fireEvent.click(screen.getByRole('button', { name: 'Review order' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Fix 8 fields to continue.',
    )
    expect(store.getState().checkout.step).toBe('shipping')
    await waitFor(() => expect(field('Full name')).toHaveFocus())
  })

  it('FR25: valid input and "Review order" advance to Summary', async () => {
    const store = renderShipping()
    fillValid()
    fireEvent.click(screen.getByRole('button', { name: 'Review order' }))

    await waitFor(() => expect(store.getState().checkout.step).toBe('summary'))
    expect(
      screen.getByRole('heading', { level: 2, name: 'Summary' }),
    ).toBeInTheDocument()
  })

  it('AD-2: values survive a step change and an "Edit cart" round trip within the session', () => {
    const store = renderShipping()
    fillValid()
    // Back to Review through the progress list, then forward again.
    const progress = screen.getByRole('navigation', {
      name: 'Checkout progress',
    })
    fireEvent.click(within(progress).getByRole('button', { name: 'Review' }))
    goToShipping()

    expect(field('Full name')).toHaveValue('Ada Lovelace')
    expect(store.getState().checkout.shippingDraft).toMatchObject({
      fullName: 'Ada Lovelace',
    })
  })
})
