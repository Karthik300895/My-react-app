import { Link } from 'react-router'

// FR31: hero with a display-sized h1 and a direct path into the catalog.
export function HomeHero() {
  return (
    <section className="rounded-xl bg-primary/5 px-6 py-12 text-center md:py-20">
      <h1 className="text-display text-foreground">
        Find Your Favourite Products
      </h1>
      <p className="mt-4 text-body text-muted-foreground">
        Thousands of products, curated for you.
      </p>
      <Link
        to="/products"
        className="mt-8 inline-flex min-h-touch-target items-center rounded-md bg-primary px-6 text-label text-primary-foreground hover:bg-primary-hover"
      >
        Shop all products
      </Link>
    </section>
  )
}
