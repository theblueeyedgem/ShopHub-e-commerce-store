'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

type P = {
  id: string
  name: string
  category: string
  price: number
  comparePrice: number | null
  stock: number
  image: string
  featured: boolean
  isActive: boolean
}

export function ProductManager({ initialProducts }: { initialProducts: P[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    setBusy(true)
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.get('name'),
        category: f.get('category'),
        price: Number(f.get('price')),
        comparePrice: f.get('comparePrice') ? Number(f.get('comparePrice')) : null,
        stock: Number(f.get('stock') || 0),
        image: f.get('image'),
        description: f.get('description'),
        featured: f.get('featured') === 'on',
      }),
    })
    setBusy(false)
    const j = await res.json().catch(() => ({}))
    if (res.ok) {
      toast.success('Product added')
      form.reset()
      router.refresh()
    } else {
      toast.error(j.error || 'Could not add product')
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Deleted')
      router.refresh()
    } else {
      toast.error('Could not delete')
    }
  }

  async function toggleFeatured(p: P) {
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !p.featured }),
    })
    if (res.ok) router.refresh()
    else toast.error('Could not update')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Add form */}
      <div className="lg:col-span-1">
        <form onSubmit={add} className="rounded-xl border bg-white p-6 space-y-3 sticky top-6">
          <h2 className="font-bold flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add product
          </h2>
          <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
          <div><Label htmlFor="category">Category</Label><Input id="category" name="category" required placeholder="Electronics" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label htmlFor="price">Price</Label><Input id="price" name="price" type="number" step="0.01" required /></div>
            <div><Label htmlFor="comparePrice">Compare at</Label><Input id="comparePrice" name="comparePrice" type="number" step="0.01" placeholder="optional" /></div>
          </div>
          <div><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" defaultValue={10} /></div>
          <div><Label htmlFor="image">Image URL</Label><Input id="image" name="image" placeholder="https://..." /></div>
          <div><Label htmlFor="description">Description</Label>
            <textarea id="description" name="description" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" /> Featured on homepage
          </label>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add product
          </Button>
        </form>
      </div>

      {/* List */}
      <div className="lg:col-span-2 space-y-3">
        {initialProducts.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-400">
            No products yet. Add one on the left, or run <code>npm run seed</code>.
          </div>
        ) : (
          initialProducts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border bg-white p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" unoptimized />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">
                  {p.category} · {formatPrice(p.price)} · stock {p.stock}
                </p>
              </div>
              <button
                onClick={() => toggleFeatured(p)}
                title={p.featured ? 'Unfeature' : 'Feature on homepage'}
                className={`grid h-9 w-9 place-items-center rounded-md border ${p.featured ? 'text-yellow-500 border-yellow-200 bg-yellow-50' : 'text-gray-300 hover:text-yellow-500'}`}
              >
                <Star className="h-4 w-4" fill={p.featured ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => del(p.id)}
                title="Delete"
                className="grid h-9 w-9 place-items-center rounded-md border text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
