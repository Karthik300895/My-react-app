import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NOTICE_TIMEOUT_MS, NoticeRegion } from './NoticeRegion'
import { noticeRequested, noticesReducer } from './noticesSlice'

const makeStore = () => configureStore({ reducer: { notices: noticesReducer } })

function setup() {
  const store = makeStore()
  render(
    <Provider store={store}>
      <main id="main" tabIndex={-1}>
        <p>Page</p>
      </main>
      <NoticeRegion />
    </Provider>,
  )
  return store
}

const raise = (
  store: ReturnType<typeof makeStore>,
  message: string,
  persistent = false,
) => {
  act(() => {
    store.dispatch(noticeRequested({ message, persistent }))
  })
}

describe('NoticeRegion', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('FR13: a transient Notice auto-dismisses after 5 s', () => {
    const store = setup()
    raise(store, 'Added to cart')
    expect(screen.getByText('Added to cart')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(NOTICE_TIMEOUT_MS)
    })
    expect(screen.queryByText('Added to cart')).not.toBeInTheDocument()
  })

  it('FR13: a persistent Notice never auto-dismisses', () => {
    const store = setup()
    raise(store, 'Only 2 available. Your cart has the maximum.', true)
    act(() => {
      vi.advanceTimersByTime(NOTICE_TIMEOUT_MS * 4)
    })
    expect(
      screen.getByText('Only 2 available. Your cart has the maximum.'),
    ).toBeInTheDocument()
  })

  it('FR13: hovering pauses the timer, and leaving restarts it', () => {
    const store = setup()
    raise(store, 'Added to cart')
    const notice = screen
      .getByText('Added to cart')
      .closest('[data-notice-id]')!

    fireEvent.mouseEnter(notice)
    act(() => {
      vi.advanceTimersByTime(NOTICE_TIMEOUT_MS * 2)
    })
    expect(screen.getByText('Added to cart')).toBeInTheDocument()

    fireEvent.mouseLeave(notice)
    act(() => {
      vi.advanceTimersByTime(NOTICE_TIMEOUT_MS)
    })
    expect(screen.queryByText('Added to cart')).not.toBeInTheDocument()
  })

  it('UX-DR18: a dismiss named "Dismiss notice" removes that Notice and moves focus to the next one', () => {
    const store = setup()
    raise(store, 'Older', true)
    raise(store, 'Newer', true)

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Dismiss notice' })[0],
    )

    expect(screen.queryByText('Newer')).not.toBeInTheDocument()
    const older = screen.getByText('Older').closest('[data-notice-id]')!
    expect(older.querySelector('button')).toHaveFocus()
  })

  it('UX-DR18: dismissing the last Notice moves focus back to main', () => {
    const store = setup()
    raise(store, 'Only one', true)

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notice' }))

    expect(screen.getByRole('main')).toHaveFocus()
  })
})
