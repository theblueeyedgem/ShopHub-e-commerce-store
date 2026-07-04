'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

// Update status / delete controls for a single order in Admin → Orders.
export function OrderActions({ id, status }: { id: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [value, setValue] = useState(status)

  async function updateStatus(next: string) {
    setValue(next)
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error || 'Could not update the order.')
        setValue(status)
      } else {
        router.refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('Permanently delete this order? This cannot be undone.')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error || 'Could not delete the order.')
      } else {
        router.refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500">Status</label>
      <select
        value={value}
        disabled={busy}
        onChange={(e) => updateStatus(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={busy}
        onClick={remove}
        title="Delete order"
        className="grid h-9 w-9 place-items-center rounded-md border text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
