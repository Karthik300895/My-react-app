import {
  HomeCategoryShortcuts,
  HomeFeaturedProducts,
  HomeHero,
} from '../features/catalog'
import { AddToCartButton } from '../features/cart'
import { useDocumentTitle } from '../shared/lib/useDocumentTitle'
import { PageContainer } from '../shared/ui/PageContainer'

export function HomePage() {
  useDocumentTitle('Home')
  return (
    <PageContainer className="flex flex-col gap-section-gap py-section-gap">
      <HomeHero />
      <div>
        <h2 className="mb-4 text-h2 text-foreground">Browse categories</h2>
        <HomeCategoryShortcuts />
      </div>
      <div>
        <h2 className="mb-4 text-h2 text-foreground">Top rated</h2>
        <HomeFeaturedProducts
          renderAction={(product) => <AddToCartButton product={product} />}
        />
      </div>
    </PageContainer>
  )
}
