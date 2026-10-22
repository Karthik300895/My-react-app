import { useParams } from 'react-router'
import { AddToCartButton, InCartLine } from '../features/cart'
import {
  parseProductId,
  ProductDetailsSkeleton,
  ProductDetailsView,
  ProductNotFound,
  useCategories,
  useProduct,
} from '../features/catalog'
import { isNotFound } from '../shared/api/ApiError'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { AsyncState } from '../shared/ui/AsyncState'
import { PageContainer } from '../shared/ui/PageContainer'

const NOT_FOUND_TITLE = 'Product not found'

// FR7–FR9: one Product's page. A malformed id never makes a request (AD-8).
export function ProductDetailsPage() {
  const id = parseProductId(useParams().productId)
  return (
    <PageContainer className="py-section-gap">
      {id === null ? <MalformedId /> : <ProductDetails key={id} id={id} />}
    </PageContainer>
  )
}

function MalformedId() {
  useDocumentTitle(NOT_FOUND_TITLE)
  return <ProductNotFound />
}

function ProductDetails({ id }: { id: number }) {
  const query = useProduct(id)
  const { categoryName } = useCategories()
  const notFound = query.data === undefined && isNotFound(query.error)
  useDocumentTitle(
    notFound ? NOT_FOUND_TITLE : (query.data?.title ?? 'Product'),
  )

  if (notFound) return <ProductNotFound />
  return (
    <AsyncState
      query={query}
      label="Product"
      skeleton={<ProductDetailsSkeleton />}
      errorMessage="We couldn't load this product. Check your connection and try again."
    >
      {(product) => (
        <ProductDetailsView
          product={product}
          categoryName={categoryName(product.category)}
          action={
            // AD-1: the page fills the catalog's action slot with cart's control.
            <div className="flex w-full flex-col gap-2">
              <AddToCartButton product={product} />
              <InCartLine productId={product.id} />
            </div>
          }
        />
      )}
    </AsyncState>
  )
}
