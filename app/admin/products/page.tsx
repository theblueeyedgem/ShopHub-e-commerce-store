import { prisma } from '@/lib/prisma'
import { ProductManager } from '@/components/admin/product-manager'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await prisma.product
    .findMany({ orderBy: { createdAt: 'desc' } })
    .catch(() => [])

  // Serialize Decimal → number for the client component.
  const plain = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    stock: p.stock,
    image: p.images?.[0] || '',
    featured: p.featured,
    isActive: p.isActive,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-sm text-gray-500">
          Add, feature, or remove products. Added products appear instantly on the storefront.
        </p>
      </div>
      <ProductManager initialProducts={plain} />
    </div>
  )
}
