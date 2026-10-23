import { describe, expect, it } from 'vitest'
import {
  checkoutReducer,
  checkoutStarted,
  initialCheckoutState,
  stepChanged,
} from './checkoutSlice'

describe('checkout slice', () => {
  it('UX-DR27: the session starts at Review with no shipping draft, order or issued numbers', () => {
    expect(initialCheckoutState).toEqual({
      step: 'review',
      shippingDraft: null,
      lastOrder: null,
      issuedOrderNumbers: [],
      placing: false,
    })
  })

  it('UX-DR27: a visit to Checkout returns to step 1 from any later step', () => {
    let state = checkoutReducer(initialCheckoutState, stepChanged('shipping'))
    expect(state.step).toBe('shipping')
    state = checkoutReducer(state, checkoutStarted())
    expect(state.step).toBe('review')
  })

  it('UX-DR16: stepChanged moves to the given step', () => {
    const state = checkoutReducer(initialCheckoutState, stepChanged('summary'))
    expect(state.step).toBe('summary')
  })
})
