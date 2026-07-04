import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Package } from 'lucide-react'
import { OrderActions } from '@/components/admin/order-actions'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const orders = await prisma.order
    .findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { items: { include: { product: true } } },
    })
    .catch(() => [])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-sm text-gray-500">
            Every order placed through the store. Update the status as you fulfil them.
          </p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-2 text-sm">
          <span className="font-bold text-lg">{orders.length}</span>{' '}
          <span className="text-gray-500">total order{orders.length === 1 ? '' : 's'} received</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="grid place-items-center rounded-xl border bg-white p-16 text-center text-gray-400">
          <Package className="mb-3 h-8 w-8" />
          No orders yet. They&apos;ll appear here as customers place them.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const address = (o.shippingAddress ?? {}) as Record<string, string>
            return (
              <div key={o.id} className="rounded-xl border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold">{o.orderNumber}</h3>
                      <OrderStatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPrice(Number(o.total))}</p>
                    <p className="text-xs text-gray-400">
                      {o.items.length} item(s)
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  {o.items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span>
                        {it.product?.name ?? 'Product'} × {it.quantity}
                      </span>
                      <span>{formatPrice(Number(it.price) * it.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Customer / shipping */}
                <div className="mt-4 grid gap-x-6 gap-y-1 border-t pt-4 text-sm sm:grid-cols-2">
                  <Row k="Name" v={o.customerName || address.fullName} />
                  <Row k="Email" v={o.customerEmail} />
                  <Row k="Phone" v={o.customerPhone || address.phone} />
                  <Row k="Payment" v={o.paymentMethod} />
                  <Row
                    k="Address"
                    v={
                      address.street
                        ? `${address.street}, ${address.city} ${address.zipCode}, ${address.country}`
                        : undefined
                    }
                  />
                </div>

                <div className="mt-4 flex justify-end border-t pt-4">
                  <OrderActions id={o.id} status={o.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Row({ k, v }: { k: string; v?: string | null }) {
  if (!v) return null
  return (
    <p className="flex gap-2">
      <span className="w-20 shrink-0 text-gray-400">{k}</span>
      <span className="text-gray-700">{v}</span>
    </p>
  )
}
