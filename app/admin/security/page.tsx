import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { SecurityForm } from '@/components/admin/security-form'

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  const session = await getServerSession(authOptions)
  const sUser = session?.user as { id?: string; email?: string } | undefined

  // Resolve the signed-in admin by id first, then fall back to email.
  let user = sUser?.id
    ? await prisma.user.findUnique({ where: { id: sUser.id } }).catch(() => null)
    : null
  if (!user && sUser?.email) {
    user = await prisma.user.findUnique({ where: { email: sUser.email } }).catch(() => null)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security &amp; 2FA</h1>
        <p className="text-sm text-gray-500">
          Change your login email, password, and manage two-factor authentication.
        </p>
      </div>

      <SecurityForm
        email={user?.email ?? sUser?.email ?? ''}
        twoFAEnabled={!!user?.twoFAEnabled}
      />
    </div>
  )
}
