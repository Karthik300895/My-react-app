import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'

// Placeholder until its story lands; it keeps the single-h1 contract (AD-11).
export function CheckoutPage() {
  useDocumentTitle('Checkout')
  return (
    <PageContainer className="py-section-gap">
      <h1 className="text-h1 text-foreground">Checkout</h1>
    </PageContainer>
  )
}
