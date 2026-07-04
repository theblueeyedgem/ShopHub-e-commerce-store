import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { logSecurityEvent } from '@/lib/security'

export const dynamic = 'force-dynamic'

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

// Change the signed-in user's login email.
// Body: { current: <password>, email: <new email> }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const sUser = session?.user as { id?: string; email?: string } | undefined
  if (!sUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { current, email } = (await req.json()) as { current?: string; email?: string }
  const next = String(email || '').trim().toLowerCase()
  if (!isEmail(next)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  let user = sUser.id
    ? await prisma.user.findUnique({ where: { id: sUser.id } })
    : null
  if (!user && sUser.email) {
    user = await prisma.user.findUnique({ where: { email: sUser.email } })
  }
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify current password so nobody can hijack the login email.
  const ok = await bcrypt.compare(current ?? '', user.password)
  if (!ok) return NextResponse.json({ error: 'Wrong current password' }, { status: 400 })

  if (next === user.email.toLowerCase()) {
    return NextResponse.json({ error: "That's already your email" }, { status: 400 })
  }

  const taken = await prisma.user.findUnique({ where: { email: next } })
  if (taken && taken.id !== user.id) {
    return NextResponse.json({ error: 'That email is already in use' }, { status: 409 })
  }

  await prisma.user.update({ where: { id: user.id }, data: { email: next } })
  await logSecurityEvent('email_change', { email: next, meta: { previous: user.email } })

  return NextResponse.json({ ok: true, email: next })
}
