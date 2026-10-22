import { useState } from 'react'

type ProductGalleryProps = {
  title: string
  images: string[]
  /** AD-9: an out-of-stock Product is shown, desaturated like its card. */
  available: boolean
}

// UX-DR15: a main image above thumbnail buttons. Activating a thumbnail swaps the main
// image and keeps focus on the thumbnail. Key this by Product id to reset the selection.
export function ProductGallery({
  title,
  images,
  available,
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const count = images.length
  // A refetch can return fewer images than the index chosen before it.
  const current = Math.min(selected, count - 1)
  const name = (index: number) =>
    count > 1 ? `${title}, image ${index + 1} of ${count}` : title

  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-lg border border-border bg-surface">
        <img
          src={images[current]}
          alt={name(current)}
          width={600}
          height={600}
          fetchPriority="high"
          decoding="async"
          className={`size-full object-contain ${available ? '' : '[filter:var(--oos-image-filter)]'}`}
        />
      </div>
      {count > 1 && (
        <ul aria-label="Product images" className="mt-3 flex flex-wrap gap-2">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show image ${index + 1} of ${count}`}
                aria-pressed={index === current}
                onClick={() => setSelected(index)}
                className={`size-16 overflow-hidden rounded-md border-2 bg-surface p-0.5 ${index === current ? 'border-primary' : 'border-border'}`}
              >
                <img
                  src={src}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
