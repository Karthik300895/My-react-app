import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { CartItem } from '../../../shared/model/cartItem'
import { cartReducer } from '../model/cartSlice'
import { CartContents } from './CartContents'

// jsdom may not implement <dialog>'s modal methods. Provide the minimum they need.
const dialogProto = HTMLDialogElement.prototype as Partial<HTMLDialogElement>
if (!dialogProto.showModal) {
  dialogProto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  dialogProto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

const line = (productId: number, quantity = 1): CartItem => ({
  productId,
  title: `Product ${productId}`,
  thumbnail: `https://example.test/${productId}.png`,
  unitPriceCents: 1000,
  stock: 9,
  quantity,
})

function renderCart(items: CartItem[]) {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items } },
  })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CartContents />
      </MemoryRouter>
    </Provider>,
  )
  return store
}

// The trigger comes first in the DOM, before the dialog's own "Clear cart" button.
const trigger = () => screen.getAllByRole('button', { name: 'Clear cart' })[0]
const dialog = () =>
  screen.getByRole('dialog', { hidden: true }) as HTMLDialogElement

describe('ClearCartDialog', () => {
  it('FR15: the trigger opens a labelled modal dialog with Cancel autofocused', () => {
    renderCart([line(1), line(2, 2)])
    expect(dialog()).not.toHaveAttribute('open')

    fireEvent.click(trigger())

    expect(dialog()).toHaveAttribute('open')
    expect(dialog()).toHaveAccessibleName('Remove all 3 items from your cart?')
    expect(
      within(dialog()).getByRole('button', { name: 'Cancel', hidden: true }),
    ).toHaveAttribute('autofocus')
  })

  it('FR15: the title uses "item" for one unit', () => {
    renderCart([line(1)])
    fireEvent.click(trigger())
    expect(dialog()).toHaveAccessibleName('Remove all 1 item from your cart?')
  })

  it('FR15: Cancel closes the dialog, leaves the Cart unchanged, and returns focus to the trigger', () => {
    const store = renderCart([line(1), line(2)])
    fireEvent.click(trigger())

    fireEvent.click(
      within(dialog()).getByRole('button', { name: 'Cancel', hidden: true }),
    )

    expect(dialog()).not.toHaveAttribute('open')
    expect(store.getState().cart.items).toHaveLength(2)
    expect(trigger()).toHaveFocus()
  })

  it('FR15: Esc (the native close) returns focus to the trigger and leaves the Cart unchanged', () => {
    const store = renderCart([line(1)])
    fireEvent.click(trigger())

    // Esc in a modal dialog closes it; jsdom does not send the key, so close it directly.
    dialog().close()

    expect(store.getState().cart.items).toHaveLength(1)
    expect(trigger()).toHaveFocus()
  })

  it('FR15, FR17: confirming empties the Cart and moves focus to the empty-state heading', () => {
    const store = renderCart([line(1), line(2)])
    fireEvent.click(trigger())

    fireEvent.click(
      within(dialog()).getByRole('button', {
        name: 'Clear cart',
        hidden: true,
      }),
    )

    expect(store.getState().cart.items).toEqual([])
    expect(
      screen.getByRole('heading', { name: 'Your cart is empty.' }),
    ).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Clear cart' })).toBeNull()
  })

  it('AD-15: cartCleared is dispatched only from ClearCartDialog.tsx', () => {
    // Vite inlines every source file as text, so no Node built-ins are needed.
    const sources = import.meta.glob<string>('/src/**/*.{ts,tsx}', {
      query: '?raw',
      import: 'default',
      eager: true,
    })
    const offenders = Object.keys(sources).filter((path) => {
      if (/\.test\.tsx?$/.test(path)) return false
      // The reducer defines the action; the dialog is the only dispatcher.
      if (path === '/src/features/cart/model/cartSlice.ts') return false
      if (path === '/src/features/cart/ui/ClearCartDialog.tsx') return false
      return sources[path].includes('cartCleared(')
    })
    expect(offenders).toEqual([])
  })
})
