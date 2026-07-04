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

function slugify(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ products })
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const b = await req.json().catch(() => null)
  if (!b?.name || b.price == null) {
    return NextResponse.json({ error: 'Name and price are required.' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name: String(b.name),
      slug: slugify(String(b.name)),
      description: b.description ? String(b.description) : '',
      price: new Prisma.Decimal(Number(b.price)),
      comparePrice: b.comparePrice != null ? new Prisma.Decimal(Number(b.comparePrice)) : null,
      category: b.category ? String(b.category) : 'General',
      stock: Number(b.stock) || 0,
      images: b.image ? [String(b.image)] : [],
      featured: !!b.featured,
      isActive: true,
      tags: [],
    },
  })

  return NextResponse.json({ ok: true, product })
}
