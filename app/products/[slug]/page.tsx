import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const product = await prisma.product
    .findUnique({ where: { slug: params.slug } })
    .catch(() => null)

  if (!product) notFound()

  const price = Number(product.price)
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null
  const image = product.images?.[0] || '/placeholder.svg'

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold">{formatPrice(price)}</span>
            {comparePrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(comparePrice)}
              </span>
            )}
            {product.stock > 0 ? (
              <Badge variant="success">In stock</Badge>
            ) : (
              <Badge variant="destructive">Out of stock</Badge>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price,
              image,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  )
}
