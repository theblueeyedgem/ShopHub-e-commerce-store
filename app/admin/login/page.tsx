'use client'

import { useState } from 'react'
import { signIn, getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ShieldCheck, Lock } from 'lucide-react'

// Dedicated ADMIN login. Separate from the customer /login page. Only ADMIN
// accounts can proceed; a non-admin who signs in here is immediately signed out.
export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [need2FA, setNeed2FA] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const res = await signIn('credentials', { email, password, totp, redirect: false })

    if (res?.error) {
      setBusy(false)
      if (res.error.includes('2FA') || res.error === 'INVALID_2FA') {
        setNeed2FA(true)
        setError(need2FA ? 'Invalid 2FA code — try again.' : 'Enter your 6-digit 2FA code.')
      } else {
        setError('Invalid email or password.')
      }
      return
    }

    // Signed in — but only ADMIN may enter the panel.
    const session = await getSession()
    const role = (session?.user as { role?: string } | undefined)?.role
    setBusy(false)
    if (role !== 'ADMIN') {
      await signOut({ redirect: false })
      setError('This account is not an administrator.')
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm">Authorized staff only</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Admin email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yourstore.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {need2FA && (
              <div>
                <Label htmlFor="totp" className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> 2FA code
                </Label>
                <Input id="totp" inputMode="numeric" maxLength={6} value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="123456" className="text-center tracking-[0.5em]" />
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign in to Admin
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Not staff? <a href="/login" className="text-primary">Go to customer login</a>
        </p>
      </div>
    </div>
  )
}
