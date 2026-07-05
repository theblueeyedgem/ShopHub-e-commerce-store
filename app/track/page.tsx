'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, PackageSearch } from 'lucide-react'

type Result = {
  orderNumber: string
  status: string
  createdAt: string
  total: number
  items: { name: string; quantity: number }[]
} | null

const STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

function TrackForm() {
  const params = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(params.get('number') || '')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result>(null)

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault()
    setBusy(true)
    setError('')
    setResult(null)
    const res = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
    })
    setBusy(false)
    const j = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(j.error || 'Order not found.')
      return
    }
    setResult(j)
  }

  const stepIndex = result ? STEPS.indexOf(result.status) : -1

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="text-center mb-6">
        <PackageSearch className="mx-auto h-10 w-10 text-primary mb-2" />
        <h1 className="text-3xl font-bold">Track your order</h1>
        <p className="text-sm text-gray-500">Enter your order number and the email you used.</p>
      </div>

      <form onSubmit={lookup} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <Label htmlFor="number">Order number</Label>
          <Input id="number" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ORD-XXXX-XXXXX" />
        </div>
        <div>
          <Label htmlFor="email">Email used at checkout</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Track order
        </Button>
      </form>

      {result && (
        <div className="bg-white rounded-xl border p-6 mt-6">
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-mono font-semibold">{result.orderNumber}</p>
              <p className="text-xs text-gray-400">{new Date(result.createdAt).toLocaleString()}</p>
            </div>
            <p className="font-bold">${result.total.toFixed(2)}</p>
          </div>

          {result.status === 'CANCELLED' ? (
            <p className="rounded-lg bg-red-50 text-red-700 p-3 text-sm">This order was cancelled.</p>
          ) : (
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((s, i) => (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold ${i <= stepIndex ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <span className={`mt-1 text-[10px] ${i <= stepIndex ? 'text-primary' : 'text-gray-400'}`}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-3 text-sm text-gray-600 space-y-1">
            {result.items.map((it, i) => (
              <div key={i}>{it.name} × {it.quantity}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Loading…</div>}>
      <TrackForm />
    </Suspense>
  )
}
