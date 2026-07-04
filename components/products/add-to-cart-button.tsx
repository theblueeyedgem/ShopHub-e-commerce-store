'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { toast } from 'sonner'

export function AddToCartButton({
  product,
}: {
  product: { id: string; name: string; slug: string; price: number; image: string; stock: number }
}) {
  const addItem = useCart((s) => s.addItem)

  return (
    <Button
      size="lg"
      disabled={product.stock === 0}
      onClick={() => {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          slug: product.slug,
        })
        toast.success(`${product.name} added to cart`)
      }}
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      Add to Cart
    </Button>
  )
}
