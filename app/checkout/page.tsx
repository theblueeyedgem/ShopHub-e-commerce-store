'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [busy, setBusy] = useState(false)

  const shipping = total > 50 || total === 0 ? 0 : 9.99
  const tax = +(total * 0.08).toFixed(2)
  const grandTotal = +(total + shipping + tax).toFixed(2)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) {
      toast.error('Your cart is empty.')
      return
    }
    const f = new FormData(e.currentTarget)
    setBusy(true)

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        customer: {
          fullName: f.get('fullName'),
          email: f.get('email'),
          phone: f.get('phone'),
          street: f.get('street'),
          city: f.get('city'),
          state: f.get('state'),
          zipCode: f.get('zipCode'),
          country: f.get('country'),
        },
        paymentMethod: f.get('paymentMethod'),
      }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      toast.error(data.error || 'Could not place order.')
      return
    }

    clearCart()
    toast.success('Order placed! 🎉')
    router.push(`/order-confirmation?number=${data.orderNumber}`)
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-bold text-lg">Shipping details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label htmlFor="fullName">Full name</Label><Input id="fullName" name="fullName" required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
              <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" required /></div>
              <div><Label htmlFor="country">Country</Label><Input id="country" name="country" required defaultValue="USA" /></div>
              <div className="sm:col-span-2"><Label htmlFor="street">Street address</Label><Input id="street" name="street" required /></div>
              <div><Label htmlFor="city">City</Label><Input id="city" name="city" required /></div>
              <div><Label htmlFor="state">State</Label><Input id="state" name="state" required /></div>
              <div><Label htmlFor="zipCode">ZIP code</Label><Input id="zipCode" name="zipCode" required /></div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 space-y-3">
            <h2 className="font-bold text-lg">Payment</h2>
            <p className="text-sm text-gray-500">
              Demo checkout — no real charge is made. Select a method to place your order.
            </p>
            <select name="paymentMethod" className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="Card">
              <option value="Card">Credit / Debit Card</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 h-fit">
          <h2 className="font-bold text-lg mb-4">Your order</h2>
          <div className="space-y-2 text-sm max-h-64 overflow-auto">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span className="truncate mr-2">{i.name} × {i.quantity}</span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatPrice(tax)}</span></div>
            <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatPrice(grandTotal)}</span></div>
          </div>
          <Button type="submit" className="w-full mt-6" size="lg" disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Place Order
          </Button>
        </div>
      </form>
    </div>
  )
}
