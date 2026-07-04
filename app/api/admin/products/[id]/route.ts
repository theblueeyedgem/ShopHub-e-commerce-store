import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  return (session?.user as { role?: string } | undefined)?.role === 'ADMIN'
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const b = await req.json().catch(() => ({}))
  const data: Prisma.ProductUpdateInput = {}
  if (typeof b.featured === 'boolean') data.featured = b.featured
  if (typeof b.isActive === 'boolean') data.isActive = b.isActive
  if (b.price != null) data.price = new Prisma.Decimal(Number(b.price))
  if (b.stock != null) data.stock = Number(b.stock)

  await prisma.product.update({ where: { id: params.id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
