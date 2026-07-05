// Route protection — edge-safe.
// 1) Exposes the current pathname to server components via the `x-pathname`
//    header (used by the admin layout to render the standalone admin login).
// 2) Locks every /admin route (except /admin/login) to users whose role is ADMIN,
//    redirecting everyone else to the dedicated ADMIN login page — never the
//    customer login page.
import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  const isAdminArea = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'

  if (isAdminArea && !isAdminLogin) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    }).catch(() => null)

    if (!token || (token as { role?: string }).role !== 'ADMIN') {
      // Send to the ADMIN login page, not the customer one.
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = { matcher: ['/admin/:path*'] }
