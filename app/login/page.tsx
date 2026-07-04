'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [need2FA, setNeed2FA] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)

    const res = await signIn('credentials', {
      email,
      password,
      totp,
      redirect: false,
    })

    setBusy(false)

    if (res?.error) {
      // The authorize() function throws "INVALID_2FA" when a code is required
      // or wrong. Reveal the 2FA field and ask for the code.
      if (res.error.includes('2FA') || res.error === 'INVALID_2FA') {
        setNeed2FA(true)
        toast.error(need2FA ? 'Invalid 2FA code — try again.' : 'Enter your 6-digit 2FA code.')
      } else {
        toast.error('Invalid email or password.')
      }
      return
    }

    toast.success('Signed in!')
    router.push(from)
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-gray-500 mb-6 text-sm">Sign in to your ShopHub account</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {need2FA && (
            <div>
              <Label htmlFor="totp" className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 2FA code
              </Label>
              <Input
                id="totp"
                inputMode="numeric"
                maxLength={6}
                value={totp}
                onChange={(e) => setTotp(e.target.value)}
                placeholder="123456"
                className="tracking-[0.5em] text-center"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code from your authenticator app.
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Sign In
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-medium">
            Sign up
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <b>Demo admin:</b> admin@shophub.com / Admin@123456
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
