import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public order tracking. Requires BOTH the order number AND the email used at
// checkout, so a stranger can't look up someone else's order from the number alone.
export async function POST(req: Request) {
  const { orderNumber, email } = (await req.json().catch(() => ({}))) as {
    orderNumber?: string
    email?: string
  }

  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 })
  }

  const order = await prisma.order
    .findUnique({
      where: { orderNumber: orderNumber.trim() },
      include: { items: { include: { product: true } } },
    })
    .catch(() => null)

  if (!order || order.customerEmail?.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json(
      { error: 'No order found for that number and email.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    total: Number(order.total),
    items: order.items.map((it) => ({
      name: it.product?.name ?? 'Product',
      quantity: it.quantity,
    })),
  })
}
