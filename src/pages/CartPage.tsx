import { CartContents } from '../features/cart'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'

// FR12–FR17: the Cart page. Its one h1 stays on every state (AD-11).
export function CartPage() {
  useDocumentTitle('Cart')
  return (
    <PageContainer className="py-section-gap">
      <h1 className="text-h1 text-foreground">Your cart</h1>
      <div className="mt-6">
        <CartContents />
      </div>
    </PageContainer>
  )
}
