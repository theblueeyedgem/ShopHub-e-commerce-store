'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()

  const shipping = total > 50 || total === 0 ? 0 : 9.99
  const tax = +(total * 0.08).toFixed(2)
  const grandTotal = +(total + shipping + tax).toFixed(2)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Browse our products and add something you love.</p>
        <Link href="/products">
          <Button size="lg">Shop Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white border rounded-lg p-4">
              <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex-1">
                <Link href={`/products/${item.slug}`} className="font-semibold hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-gray-500 text-sm">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded hover:bg-gray-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded hover:bg-gray-50">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeItem(item.id)} className="ml-auto text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="font-bold">{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-lg p-6 h-fit">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span>Tax (8%)</span><span>{formatPrice(tax)}</span></div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
              <span>Total</span><span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
          <Link href="/checkout">
            <Button className="w-full mt-6" size="lg">Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
