import { NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import qrcode from 'qrcode'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Generate a TOTP secret + QR for Google Authenticator. The secret is stored
// as PENDING; 2FA is only switched on after /api/2fa/verify succeeds.
export async function POST() {
  const session = await getServerSession(authOptions)
  const sUser = session?.user as { id?: string; email?: string } | undefined
  if (!sUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let user = sUser.id
    ? await prisma.user.findUnique({ where: { id: sUser.id } })
    : null
  if (!user && sUser.email) {
    user = await prisma.user.findUnique({ where: { email: sUser.email } })
  }
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(user.email, 'ShopHub', secret)
  const qrDataUrl = await qrcode.toDataURL(otpauth)

  await prisma.user.update({ where: { id: user.id }, data: { twoFASecret: secret } })
  return NextResponse.json({ qrDataUrl, secret, otpauth })
}
