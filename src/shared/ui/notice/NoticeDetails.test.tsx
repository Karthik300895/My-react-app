import { configureStore } from '@reduxjs/toolkit'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'
import { NoticeRegion } from './NoticeRegion'
import { noticeRequested, noticesReducer } from './noticesSlice'

function setup() {
  const store = configureStore({ reducer: { notices: noticesReducer } })
  render(
    <Provider store={store}>
      <main id="main" tabIndex={-1} />
      <NoticeRegion />
    </Provider>,
  )
  return store
}

describe('NoticeRegion details and warning', () => {
  it('UX-DR30: a summary Notice hides its details until "Show details" is pressed', () => {
    const store = setup()
    act(() => {
      store.dispatch(
        noticeRequested({
          message: '2 changes to your cart',
          persistent: true,
          variant: 'warning',
          details: ['First change.', 'Second change.'],
        }),
      )
    })

    const toggle = screen.getByRole('button', { name: 'Show details' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('First change.')).toBeNull()

    fireEvent.click(toggle)

    expect(
      screen.getByRole('button', { name: 'Hide details' }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('First change.')).toBeInTheDocument()
    expect(screen.getByText('Second change.')).toBeInTheDocument()
  })

  it('UX-DR30: a warning Notice carries the warning rule', () => {
    const store = setup()
    act(() => {
      store.dispatch(
        noticeRequested({
          message: 'The price changed.',
          persistent: true,
          variant: 'warning',
        }),
      )
    })
    const notice = screen
      .getByText('The price changed.')
      .closest('[data-notice-id]')!
    expect(notice).toHaveClass('border-l-4', 'border-warning')
  })

  it('UX-DR30: a plain Notice has no details toggle and no warning rule', () => {
    const store = setup()
    act(() => {
      store.dispatch(
        noticeRequested({ message: 'Added to cart', persistent: false }),
      )
    })
    expect(screen.queryByRole('button', { name: 'Show details' })).toBeNull()
    expect(
      screen.getByText('Added to cart').closest('[data-notice-id]'),
    ).not.toHaveClass('border-warning')
  })
})
