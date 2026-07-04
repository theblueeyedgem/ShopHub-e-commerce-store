import { NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Allow ~±30s clock drift so enabling 2FA isn't blocked by minor time skew.
authenticator.options = { window: 1 }

async function resolveUser() {
  const session = await getServerSession(authOptions)
  const sUser = session?.user as { id?: string; email?: string } | undefined
  if (!sUser) return null
  let user = sUser.id
    ? await prisma.user.findUnique({ where: { id: sUser.id } })
    : null
  if (!user && sUser.email) {
    user = await prisma.user.findUnique({ where: { email: sUser.email } })
  }
  return user
}

// Verify the 6-digit code against the pending secret in real time, then enable 2FA.
export async function POST(req: Request) {
  const user = await resolveUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = (await req.json()) as { token?: string }
  if (!user.twoFASecret) {
    return NextResponse.json({ error: 'No pending secret' }, { status: 400 })
  }

  const ok = authenticator.verify({ token: String(token || ''), secret: user.twoFASecret })
  if (!ok) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { twoFAEnabled: true } })
  return NextResponse.json({ enabled: true })
}

// Disable 2FA.
export async function DELETE() {
  const user = await resolveUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFAEnabled: false, twoFASecret: null },
  })
  return NextResponse.json({ enabled: false })
}
