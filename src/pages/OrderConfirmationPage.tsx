import { ConfirmationGuard, OrderConfirmation } from '../features/checkout'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'

// FR28, FR29: the confirmation for the Order just placed. Opened without one, it redirects Home.
export function OrderConfirmationPage() {
  useDocumentTitle('Order confirmation')
  return (
    <PageContainer className="py-section-gap">
      <ConfirmationGuard>
        <OrderConfirmation />
      </ConfirmationGuard>
    </PageContainer>
  )
}
