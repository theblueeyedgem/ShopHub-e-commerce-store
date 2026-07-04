import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { logSecurityEvent } from '@/lib/security'

export const dynamic = 'force-dynamic'

// Change the signed-in user's password.
// Body: { current: <current password>, next: <new password> }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const sUser = session?.user as { id?: string; email?: string } | undefined
  if (!sUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let user = sUser.id
    ? await prisma.user.findUnique({ where: { id: sUser.id } })
    : null
  if (!user && sUser.email) {
    user = await prisma.user.findUnique({ where: { email: sUser.email } })
  }
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { current, next } = (await req.json()) as { current?: string; next?: string }
  const newPassword = String(next || '')
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  const ok = await bcrypt.compare(current ?? '', user.password)
  if (!ok) {
    return NextResponse.json({ error: 'Wrong current password' }, { status: 400 })
  }

  const password = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: user.id }, data: { password } })
  await logSecurityEvent('password_change', { email: user.email }).catch(() => null)

  return NextResponse.json({ ok: true })
}
