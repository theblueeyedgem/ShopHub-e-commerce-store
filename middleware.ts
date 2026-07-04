// Route protection — edge-safe.
// Verifies the NextAuth JWT directly (no DB/Prisma import — those can't run on
// the edge) and locks every /admin route to users whose role === "ADMIN".
// The server component in app/admin/layout.tsx repeats this check with the full
// session for defense-in-depth.
import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/admin')) return NextResponse.next()

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  }).catch(() => null)

  if (!token || (token as { role?: string }).role !== 'ADMIN') {
    const url = new URL('/login', req.url)
    url.searchParams.set('from', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
