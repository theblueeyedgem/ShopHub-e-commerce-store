import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  ArrowRight,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // All stats tolerate an empty/unmigrated DB.
  const [orderCount, productCount, customerCount, orders, revenueAgg] =
    await Promise.all([
      prisma.order.count().catch(() => 0),
      prisma.product.count().catch(() => 0),
      prisma.user.count({ where: { role: 'CUSTOMER' } }).catch(() => 0),
      prisma.order
        .findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { items: true },
        })
        .catch(() => []),
      prisma.order.aggregate({ _sum: { total: true } }).catch(() => ({ _sum: { total: null } })),
    ])

  const revenue = Number(revenueAgg._sum.total ?? 0)

  const stats = [
    { label: 'Orders received', value: orderCount, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total revenue', value: formatPrice(revenue), icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Products', value: productCount, icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Customers', value: customerCount, icon: Users, color: 'text-orange-600 bg-orange-50' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your store.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-white p-5">
            <div className={`inline-flex rounded-lg p-2 mb-3 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No orders yet. They&apos;ll show up here as customers check out.
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-5">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {o.customerName || 'Customer'} · {o.items.length} item(s) ·{' '}
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-bold">{formatPrice(Number(o.total))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
