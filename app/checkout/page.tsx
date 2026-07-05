'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { PAYMENT_INSTRUCTIONS } from '@/lib/site'
import { Loader2, Info, Upload, X, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const PAYMENT_METHODS = ['Bank Transfer', 'Easypaisa', 'JazzCash']
const MAX_MB = 5

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [busy, setBusy] = useState(false)
  const [showInfo, setShowInfo] = useState(true) // instructions popup on load
  const [screenshot, setScreenshot] = useState<string>('') // base64 data URL
  const [screenshotType, setScreenshotType] = useState<string>('')

  const shipping = total > 50 || total === 0 ? 0 : 9.99
  const tax = +(total * 0.08).toFixed(2)
  const grandTotal = +(total + shipping + tax).toFixed(2)

  // Guard: if the cart is empty, bounce to the cart page.
  useEffect(() => {
    if (items.length === 0) router.replace('/cart')
  }, [items.length, router])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_MB} MB.`)
      return
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result as string)
      r.onerror = reject
      r.readAsDataURL(file)
    })
    setScreenshot(dataUrl)
    setScreenshotType(file.type)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return toast.error('Your cart is empty.')
    // Screenshot is MANDATORY.
    if (!screenshot) {
      toast.error('Please attach your payment screenshot to place the order.')
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
        paymentScreenshot: screenshot,
        paymentScreenshotType: screenshotType,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return toast.error(data.error || 'Could not place order.')

    clearCart()
    toast.success('Order placed! Check your email for confirmation. 🎉')
    router.push(`/order-confirmation?number=${data.orderNumber}`)
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Payment instructions popup */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[85vh] overflow-auto">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> {PAYMENT_INSTRUCTIONS.title}
              </h2>
              <button onClick={() => setShowInfo(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{PAYMENT_INSTRUCTIONS.intro}</p>

            <div className="space-y-2 mb-4">
              {PAYMENT_INSTRUCTIONS.methods.map((m) => (
                <div key={m.label} className="rounded-lg bg-gray-50 border p-3">
                  <p className="font-semibold text-sm">{m.label}</p>
                  <p className="text-xs text-gray-600">{m.detail}</p>
                </div>
              ))}
            </div>

            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 mb-5">
              {PAYMENT_INSTRUCTIONS.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>

            <Button className="w-full" onClick={() => setShowInfo(false)}>
              Got it — continue to checkout
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <Button variant="outline" size="sm" onClick={() => setShowInfo(true)}>
          <Info className="h-4 w-4 mr-1" /> Payment instructions
        </Button>
      </div>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
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

          {/* Payment */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-bold text-lg">Payment</h2>
            <div>
              <Label htmlFor="paymentMethod">Method you paid with</Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                required
                defaultValue={PAYMENT_METHODS[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Mandatory payment screenshot */}
            <div>
              <Label>Payment screenshot / receipt <span className="text-red-500">*</span></Label>
              {screenshot ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative h-24 w-24 rounded-lg overflow-hidden border">
                    <Image src={screenshot} alt="Payment proof" fill className="object-cover" unoptimized />
                  </div>
                  <div className="text-sm">
                    <p className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /> Attached</p>
                    <button type="button" onClick={() => { setScreenshot(''); setScreenshotType('') }} className="text-red-500 text-xs mt-1">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="mt-2 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 cursor-pointer hover:border-primary">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload your payment screenshot (required)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                </label>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Your order can&apos;t be placed without the payment proof. Max {MAX_MB} MB image.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
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
