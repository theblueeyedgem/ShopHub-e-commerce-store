import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { prisma } from '@/lib/prisma'
import { logSecurityEvent } from '@/lib/security'

// Tolerate ~±30s of clock drift between the server and the phone. Without this,
// a slightly out-of-sync clock makes EVERY authenticator code fail — the #1
// cause of "invalid 2FA code" on local/dev machines.
authenticator.options = { window: 1 }

// Central NextAuth config. Kept in lib/ (not the route file) so it can be
// imported by getServerSession() everywhere without circular imports.
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totp: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').toLowerCase().trim()
        const password = String(credentials?.password || '')
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          await logSecurityEvent('login_failed', { email, meta: { reason: 'no_account' } })
          return null
        }

        const ok = await bcrypt.compare(password, user.password)
        if (!ok) {
          await logSecurityEvent('login_failed', { email, meta: { reason: 'bad_password' } })
          return null
        }

        // Enforce TOTP (password AND 2FA code) when 2FA is enabled for this user.
        if (user.twoFAEnabled && user.twoFASecret) {
          const token = String(credentials?.totp || '')
          const valid = authenticator.verify({ token, secret: user.twoFASecret })
          if (!valid) {
            await logSecurityEvent('login_failed', { email, meta: { reason: 'bad_2fa' } })
            // A distinct error string lets the login page prompt for the code.
            throw new Error('INVALID_2FA')
          }
        }

        await logSecurityEvent('login_success', { email })
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role ?? 'CUSTOMER'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
}
