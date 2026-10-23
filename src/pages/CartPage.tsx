import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'
import { CartContents } from '../features/cart'
import { EMPTY_CART_REASON } from '../features/checkout'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'
import { noticeRequested } from '../shared/ui/notice/noticesSlice'

// FR12–FR17: the Cart page. Its one h1 stays on every state (AD-11).
export function CartPage() {
  useDocumentTitle('Cart')
  const dispatch = useDispatch()
  const location = useLocation()

  // AD-11: a redirect's reason becomes a Notice here, in an effect, never during render.
  useEffect(() => {
    const reason = (location.state as { reason?: string } | null)?.reason
    if (reason === EMPTY_CART_REASON) {
      dispatch(
        noticeRequested({
          message: "Your cart is empty, so there's nothing to check out yet.",
          persistent: true,
        }),
      )
    }
  }, [location.key, location.state, dispatch])

  return (
    <PageContainer className="py-section-gap">
      <h1 className="text-h1 text-foreground">Your cart</h1>
      <div className="mt-6">
        <CartContents />
      </div>
    </PageContainer>
  )
}
