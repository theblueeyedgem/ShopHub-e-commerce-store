import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { alertAdminAccess } from '@/lib/security'
import { LayoutDashboard, ShoppingCart, ShieldCheck, Store, Package } from 'lucide-react'
import { AdminLogoutButton } from '@/components/admin/admin-logout-button'

// Server-side gate — real NextAuth session + role check. The middleware also
// guards /admin, so this is defense-in-depth. Every successful access is logged
// and (if email is configured) emails an alert.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The dedicated admin login page lives at /admin/login. Render it standalone
  // (no sidebar / no auth gate) so visiting /admin shows the ADMIN login form.
  const pathname = headers().get('x-pathname') || ''
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!session?.user || role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // Fire-and-forget security alert (won't block rendering).
  const h = headers()
  void alertAdminAccess({
    email: session.user.email,
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip'),
    userAgent: h.get('user-agent'),
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white p-5 md:flex">
        <Link href="/admin" className="mb-8 text-2xl font-bold text-primary">
          ShopHub<span className="text-gray-400 text-sm font-normal"> Admin</span>
        </Link>

        <nav className="flex flex-col gap-1 text-sm">
          <NavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/orders" icon={<ShoppingCart className="h-4 w-4" />}>
            Orders
          </NavLink>
          <NavLink href="/admin/products" icon={<Package className="h-4 w-4" />}>
            Products
          </NavLink>
          <NavLink href="/admin/security" icon={<ShieldCheck className="h-4 w-4" />}>
            Security &amp; 2FA
          </NavLink>
          <NavLink href="/" icon={<Store className="h-4 w-4" />}>
            View Storefront
          </NavLink>
          <AdminLogoutButton />
        </nav>

        <p className="mt-auto text-xs text-gray-400">
          Signed in as {session.user.email}
        </p>
      </aside>

      <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">{children}</main>
    </div>
  )
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
    >
      {icon}
      {children}
    </Link>
  )
}
