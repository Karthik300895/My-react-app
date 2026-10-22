import {
  productDetailsDtoSchema,
  type CatalogProductDto,
  type ProductDetailsDto,
} from '../../shared/api/dto'

// AD-10: representative catalog fixtures in DummyJSON's shape, parsed through the DTO schema.
// The live API can't be recorded from this network; `npm run contract:live` checks it.
// Deliberate states: ids 7 and 22 are out of stock (stock 0); ids 1, 9 and 23 are low stock.
// Images: id 2 has 5 (the gallery example), id 3 has 1 (no thumbnail row), the rest have 3.
const raw: CatalogProductDto[] = [
  {
    id: 1,
    title: 'Essence Mascara Lash Princess',
    description:
      "Essence Mascara Lash Princess from the beauty range. Representative fixture data in DummyJSON's catalog shape.",
    price: 9.99,
    category: 'beauty',
    rating: 4.94,
    stock: 5,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
  },
  {
    id: 2,
    title: 'Eyeshadow Palette with Mirror',
    description:
      "Eyeshadow Palette with Mirror from the beauty range. Representative fixture data in DummyJSON's catalog shape.",
    price: 19.99,
    category: 'beauty',
    rating: 3.28,
    stock: 44,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp',
  },
  {
    id: 3,
    title: 'Powder Canister',
    description:
      "Powder Canister from the beauty range. Representative fixture data in DummyJSON's catalog shape.",
    price: 14.99,
    category: 'beauty',
    rating: 3.82,
    stock: 59,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp',
  },
  {
    id: 4,
    title: 'Red Lipstick',
    description:
      "Red Lipstick from the beauty range. Representative fixture data in DummyJSON's catalog shape.",
    price: 12.99,
    category: 'beauty',
    rating: 2.51,
    stock: 68,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp',
  },
  {
    id: 5,
    title: 'Red Nail Polish',
    description:
      "Red Nail Polish from the beauty range. Representative fixture data in DummyJSON's catalog shape.",
    price: 8.99,
    category: 'beauty',
    rating: 3.91,
    stock: 71,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp',
  },
  {
    id: 6,
    title: 'Calvin Klein CK One',
    description:
      "Calvin Klein CK One from the fragrances range. Representative fixture data in DummyJSON's catalog shape.",
    price: 49.99,
    category: 'fragrances',
    rating: 4.85,
    stock: 17,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp',
  },
  {
    id: 7,
    title: 'Chanel Coco Noir Eau De',
    description:
      "Chanel Coco Noir Eau De from the fragrances range. Representative fixture data in DummyJSON's catalog shape.",
    price: 129.99,
    category: 'fragrances',
    rating: 2.76,
    stock: 0,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/thumbnail.webp',
  },
  {
    id: 8,
    title: "Dior J'adore",
    description:
      "Dior J'adore from the fragrances range. Representative fixture data in DummyJSON's catalog shape.",
    price: 89.99,
    category: 'fragrances',
    rating: 3.31,
    stock: 91,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/fragrances/dior-j-adore/thumbnail.webp',
  },
  {
    id: 9,
    title: 'Dolce Shine Eau de',
    description:
      "Dolce Shine Eau de from the fragrances range. Representative fixture data in DummyJSON's catalog shape.",
    price: 69.99,
    category: 'fragrances',
    rating: 2.68,
    stock: 3,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/thumbnail.webp',
  },
  {
    id: 10,
    title: 'Gucci Bloom Eau de',
    description:
      "Gucci Bloom Eau de from the fragrances range. Representative fixture data in DummyJSON's catalog shape.",
    price: 79.99,
    category: 'fragrances',
    rating: 2.69,
    stock: 93,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp',
  },
  {
    id: 11,
    title: 'Annibale Colombo Bed',
    description:
      "Annibale Colombo Bed from the furniture range. Representative fixture data in DummyJSON's catalog shape.",
    price: 1899.99,
    category: 'furniture',
    rating: 4.14,
    stock: 47,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp',
  },
  {
    id: 12,
    title: 'Annibale Colombo Sofa',
    description:
      "Annibale Colombo Sofa from the furniture range. Representative fixture data in DummyJSON's catalog shape.",
    price: 2499.99,
    category: 'furniture',
    rating: 3.08,
    stock: 16,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp',
  },
  {
    id: 13,
    title: 'Bedside Table African Cherry',
    description:
      "Bedside Table African Cherry from the furniture range. Representative fixture data in DummyJSON's catalog shape.",
    price: 299.99,
    category: 'furniture',
    rating: 4.48,
    stock: 16,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp',
  },
  {
    id: 14,
    title: 'Knoll Saarinen Executive Conference Chair',
    description:
      "Knoll Saarinen Executive Conference Chair from the furniture range. Representative fixture data in DummyJSON's catalog shape.",
    price: 499.99,
    category: 'furniture',
    rating: 4.11,
    stock: 47,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp',
  },
  {
    id: 15,
    title: 'Wooden Bathroom Sink With Mirror',
    description:
      "Wooden Bathroom Sink With Mirror from the furniture range. Representative fixture data in DummyJSON's catalog shape.",
    price: 799.99,
    category: 'furniture',
    rating: 3.26,
    stock: 95,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/thumbnail.webp',
  },
  {
    id: 16,
    title: 'Apple',
    description:
      "Apple from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 1.99,
    category: 'groceries',
    rating: 4.19,
    stock: 9,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp',
  },
  {
    id: 17,
    title: 'Beef Steak',
    description:
      "Beef Steak from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 12.99,
    category: 'groceries',
    rating: 4.47,
    stock: 96,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/beef-steak/thumbnail.webp',
  },
  {
    id: 18,
    title: 'Cat Food',
    description:
      "Cat Food from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 8.99,
    category: 'groceries',
    rating: 3.13,
    stock: 13,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/cat-food/thumbnail.webp',
  },
  {
    id: 19,
    title: 'Chicken Meat',
    description:
      "Chicken Meat from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 9.99,
    category: 'groceries',
    rating: 3.19,
    stock: 69,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/chicken-meat/thumbnail.webp',
  },
  {
    id: 20,
    title: 'Cooking Oil',
    description:
      "Cooking Oil from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 4.99,
    category: 'groceries',
    rating: 4.8,
    stock: 22,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/cooking-oil/thumbnail.webp',
  },
  {
    id: 21,
    title: 'Cucumber',
    description:
      "Cucumber from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 1.49,
    category: 'groceries',
    rating: 4.07,
    stock: 22,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/cucumber/thumbnail.webp',
  },
  {
    id: 22,
    title: 'Dog Food',
    description:
      "Dog Food from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 10.99,
    category: 'groceries',
    rating: 4.55,
    stock: 0,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/dog-food/thumbnail.webp',
  },
  {
    id: 23,
    title: 'Eggs',
    description:
      "Eggs from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 2.99,
    category: 'groceries',
    rating: 2.53,
    stock: 3,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/eggs/thumbnail.webp',
  },
  {
    id: 24,
    title: 'Fish Steak',
    description:
      "Fish Steak from the groceries range. Representative fixture data in DummyJSON's catalog shape.",
    price: 14.99,
    category: 'groceries',
    rating: 3.78,
    stock: 99,
    thumbnail:
      'https://cdn.dummyjson.com/product-images/groceries/fish-steak/thumbnail.webp',
  },
]

const IMAGE_COUNTS: Partial<Record<number, number>> = { 2: 5, 3: 1 }

/** DummyJSON names a Product's images `1.webp`, `2.webp`, … next to its thumbnail. */
function imagesFor({ id, thumbnail }: CatalogProductDto): string[] {
  if (!/thumbnail\.webp$/.test(thumbnail))
    throw new Error(`Fixture ${id}: unexpected thumbnail ${thumbnail}`)
  return Array.from({ length: IMAGE_COUNTS[id] ?? 3 }, (_, i) =>
    thumbnail.replace(/thumbnail\.webp$/, `${i + 1}.webp`),
  )
}

export const productFixtures: ProductDetailsDto[] = raw.map((product) =>
  productDetailsDtoSchema.parse({ ...product, images: imagesFor(product) }),
)
