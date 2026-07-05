import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { Package, LogOut } from 'lucide-react'
import { CustomerLogout } from '@/components/customer-logout'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?from=/account')

  const orders = await prisma.order
    .findMany({
      where: {
        OR: [
          { userId: (user as { id?: string }).id },
          { customerEmail: user.email ?? undefined },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    })
    .catch(() => [])

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <CustomerLogout />
      </div>

      <h2 className="font-bold text-lg mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-400">
          <Package className="mx-auto mb-3 h-8 w-8" />
          You haven&apos;t placed any orders yet.
          <div className="mt-4">
            <Link href="/products" className="text-primary font-medium">Start shopping →</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold">{o.orderNumber}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(Number(o.total))}</p>
                  <Link href={`/track?number=${o.orderNumber}`} className="text-xs text-primary">
                    Track this order →
                  </Link>
                </div>
              </div>
              <div className="mt-3 border-t pt-3 text-sm text-gray-600 space-y-1">
                {o.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.product?.name ?? 'Product'} × {it.quantity}</span>
                    <span>{formatPrice(Number(it.price) * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
