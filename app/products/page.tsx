import { ProductCard } from '@/components/products/product-card'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; featured?: string; q?: string }
}) {
  const where: Prisma.ProductWhereInput = { isActive: true }
  if (searchParams.category) where.category = searchParams.category
  if (searchParams.featured === 'true') where.featured = true
  if (searchParams.q) {
    where.name = { contains: searchParams.q, mode: 'insensitive' }
  }

  const products = await prisma.product
    .findMany({ where, orderBy: { createdAt: 'desc' } })
    .catch(() => [])

  const title = searchParams.featured
    ? 'Deals & Featured'
    : searchParams.category
    ? searchParams.category
    : 'All Products'

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 mb-8">
        {products.length} product{products.length === 1 ? '' : 's'} available
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          No products found. Run <code>npm run seed</code> to add sample products.
        </div>
      )}
    </div>
  )
}
