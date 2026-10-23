import { beforeEach, describe, expect, it } from 'vitest'
import { shippingDraftSaved, type ShippingValues } from '../features/checkout'
import { makeStore } from './store'

const shipping: ShippingValues = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+1 555 010 9999',
  addressLine1: '10 Downing Street',
  addressLine2: '',
  city: 'London',
  state: 'Greater London',
  postalCode: 'SW1A2AA',
  country: 'United Kingdom',
}

describe('shipping information persistence', () => {
  beforeEach(() => localStorage.clear())

  it('NFR6: saved Shipping Information stays in memory and is never written to localStorage', () => {
    const store = makeStore()
    store.dispatch(shippingDraftSaved(shipping))

    expect(store.getState().checkout.shippingDraft).toEqual(shipping)
    const everything = Object.keys(localStorage)
      .map((key) => `${key}=${localStorage.getItem(key)}`)
      .join('\n')
    expect(everything).not.toMatch(/Ada|Lovelace|ada@example|Downing|SW1A2AA/)
  })
})
