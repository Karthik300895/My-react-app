import { Link } from 'react-router'

// FR17: the empty Cart offers a way back to the shop and no Checkout.
export function EmptyCart() {
  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <h2
        tabIndex={-1}
        data-empty-heading
        className="text-h2 text-foreground focus:outline-none"
      >
        Your cart is empty.
      </h2>
      <p className="text-body text-muted-foreground">
        Find something you like in the shop.
      </p>
      <Link
        to="/products"
        className="inline-flex min-h-touch-target items-center rounded-md bg-primary px-4 text-label text-primary-foreground hover:bg-primary-hover"
      >
        Start shopping
      </Link>
    </div>
  )
}
