import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { alertNewOrder } from '@/lib/security'
import { sendOrderConfirmation } from '@/lib/email'
import { generateOrderNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Places an order from the cart. Works for guests too — falls back to (or
// creates) a shared "guest" customer so the order still records who to contact.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.items?.length) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
  }

  const c = body.customer || {}
  if (!c.fullName || !c.email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
  }

  // Payment screenshot is MANDATORY.
  const screenshot: string = String(body.paymentScreenshot || '')
  if (!screenshot.startsWith('data:image/')) {
    return NextResponse.json(
      { error: 'A payment screenshot is required to place the order.' },
      { status: 400 }
    )
  }

  // Look up real products + prices server-side (never trust client prices).
  const ids: string[] = body.items.map((i: any) => String(i.id))
  const products = await prisma.product.findMany({ where: { id: { in: ids } } })
  if (products.length === 0) {
    return NextResponse.json({ error: 'No valid products in cart.' }, { status: 400 })
  }

  const lineItems = body.items
    .map((i: any) => {
      const p = products.find((pr) => pr.id === i.id)
      if (!p) return null
      const quantity = Math.max(1, Number(i.quantity) || 1)
      return { product: p, quantity, price: Number(p.price) }
    })
    .filter(Boolean) as { product: (typeof products)[number]; quantity: number; price: number }[]

  const subtotal = lineItems.reduce((s, li) => s + li.price * li.quantity, 0)
  const tax = +(subtotal * 0.08).toFixed(2)
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = +(subtotal + tax + shipping).toFixed(2)

  // Resolve the buyer: signed-in user, else a reusable guest account.
  const sessionUser = await getCurrentUser()
  let userId = (sessionUser as any)?.id as string | undefined
  if (!userId) {
    const guest = await prisma.user.upsert({
      where: { email: 'guest@shophub.com' },
      update: {},
      create: {
        email: 'guest@shophub.com',
        name: 'Guest Orders',
        password: 'guest-no-login',
        role: 'CUSTOMER',
      },
    })
    userId = guest.id
  }

  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber: generateOrderNumber(),
      status: 'PENDING',
      subtotal: new Prisma.Decimal(subtotal),
      tax: new Prisma.Decimal(tax),
      shipping: new Prisma.Decimal(shipping),
      total: new Prisma.Decimal(total),
      customerName: String(c.fullName),
      customerEmail: String(c.email),
      customerPhone: c.phone ? String(c.phone) : null,
      paymentMethod: body.paymentMethod ? String(body.paymentMethod) : null,
      paymentScreenshot: screenshot,
      paymentScreenshotType: body.paymentScreenshotType ? String(body.paymentScreenshotType) : null,
      shippingAddress: {
        fullName: c.fullName,
        street: c.street,
        city: c.city,
        state: c.state,
        zipCode: c.zipCode,
        country: c.country,
        phone: c.phone,
      },
      items: {
        create: lineItems.map((li) => ({
          productId: li.product.id,
          quantity: li.quantity,
          price: new Prisma.Decimal(li.price),
        })),
      },
    },
  })

  // Fire-and-forget notifications (no-op if email isn't configured):
  //  - alert the store owner of a new order
  //  - send the CUSTOMER an order confirmation
  void alertNewOrder({
    orderNumber: order.orderNumber,
    total,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
  })
  void sendOrderConfirmation({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    total,
    items: lineItems.map((li) => ({
      name: li.product.name,
      quantity: li.quantity,
      price: li.price,
    })),
  })

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber })
}
