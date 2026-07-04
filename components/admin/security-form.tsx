'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Check,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SecurityForm({
  email,
  twoFAEnabled,
}: {
  email: string
  twoFAEnabled: boolean
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <EmailCard currentEmail={email} />
      <PasswordCard />
      <TwoFactorCard initiallyEnabled={twoFAEnabled} />
    </div>
  )
}

/* ---------------- Change email ---------------- */
function EmailCard({ currentEmail }: { currentEmail: string }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const form = e.currentTarget
    const f = new FormData(form)
    setBusy(true)
    const res = await fetch('/api/account/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: f.get('current'), email: f.get('email') }),
    })
    setBusy(false)
    const j = await res.json().catch(() => ({}))
    if (res.ok) {
      setMsg({ ok: true, text: `Email changed to ${j.email}. Use it next time you log in.` })
      form.reset()
    } else {
      setMsg({ ok: false, text: j.error || 'Could not change email.' })
    }
  }

  return (
    <Card icon={<Mail className="h-5 w-5" />} title="Login email" subtitle={`Current: ${currentEmail || '—'}`}>
      <form onSubmit={onSubmit} className="space-y-3">
        <Input name="email" type="email" required placeholder="New login email" />
        <Input name="current" type="password" required placeholder="Confirm current password" />
        {msg && <Message {...msg} />}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
          {busy ? 'Saving…' : 'Update email'}
        </Button>
      </form>
    </Card>
  )
}

/* ---------------- Change password ---------------- */
function PasswordCard() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const form = e.currentTarget
    const f = new FormData(form)
    const next = String(f.get('next') || '')
    const confirm = String(f.get('confirm') || '')
    if (next.length < 8) {
      setMsg({ ok: false, text: 'New password must be at least 8 characters.' })
      return
    }
    if (next !== confirm) {
      setMsg({ ok: false, text: 'Passwords do not match.' })
      return
    }
    setBusy(true)
    const res = await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: f.get('current'), next }),
    })
    setBusy(false)
    if (res.ok) {
      setMsg({ ok: true, text: 'Password updated. It takes effect immediately.' })
      form.reset()
    } else {
      const j = await res.json().catch(() => ({}))
      setMsg({ ok: false, text: j.error || 'Could not update password.' })
    }
  }

  return (
    <Card icon={<KeyRound className="h-5 w-5" />} title="Change password" subtitle="Saved securely (bcrypt-hashed).">
      <form onSubmit={onSubmit} className="space-y-3">
        <Input name="current" type="password" required placeholder="Current password" />
        <Input name="next" type="password" required placeholder="New password (8+ chars)" />
        <Input name="confirm" type="password" required placeholder="Confirm new password" />
        {msg && <Message {...msg} />}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
          {busy ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </Card>
  )
}

/* ---------------- Two-factor (2FA) ---------------- */
function TwoFactorCard({ initiallyEnabled }: { initiallyEnabled: boolean }) {
  const [enabled, setEnabled] = useState(initiallyEnabled)
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function startSetup() {
    setBusy(true)
    setError('')
    const res = await fetch('/api/2fa/setup', { method: 'POST' })
    setBusy(false)
    if (res.ok) {
      const j = await res.json()
      setQr(j.qrDataUrl)
      setSecret(j.secret)
    } else {
      setError('Could not start 2FA setup.')
    }
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const token = String(new FormData(e.currentTarget).get('token') || '')
    // Real-time check: the server verifies the 6-digit code against the pending
    // TOTP secret right now — a wrong/expired code is rejected immediately.
    const res = await fetch('/api/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    setBusy(false)
    if (res.ok) {
      setEnabled(true)
      setQr(null)
      setSecret('')
    } else {
      setError('Invalid code — check the app and try again.')
    }
  }

  async function disable() {
    if (!confirm('Disable two-factor authentication?')) return
    setBusy(true)
    await fetch('/api/2fa/verify', { method: 'DELETE' })
    setBusy(false)
    setEnabled(false)
  }

  return (
    <Card
      icon={enabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <ShieldAlert className="h-5 w-5 text-gray-400" />}
      title="Two-factor authentication"
      subtitle={enabled ? 'Enabled — login requires a code.' : 'Add a Google Authenticator code at login.'}
    >
      {enabled ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            ✅ 2FA is active. You&apos;ll be asked for a 6-digit code from your
            authenticator app each time you sign in.
          </p>
          <Button onClick={disable} disabled={busy} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
            Disable 2FA
          </Button>
        </div>
      ) : qr ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            1. Open <b>Google Authenticator</b> (or Authy) → <b>+</b> → <b>Scan a QR code</b>.
          </p>
          <div className="flex justify-center">
            <div className="rounded-xl bg-white p-3 border">
              <Image src={qr} alt="2FA QR code" width={180} height={180} unoptimized />
            </div>
          </div>
          <p className="break-all text-center text-xs text-gray-400">
            Can&apos;t scan? Enter this key manually: <span className="text-gray-600">{secret}</span>
          </p>
          <form onSubmit={verify} className="space-y-3">
            <p className="text-sm text-gray-600">2. Enter the 6-digit code it shows:</p>
            <Input name="token" inputMode="numeric" maxLength={6} required placeholder="123456" className="text-center tracking-[0.5em]" />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
              Verify &amp; enable
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button onClick={startSetup} disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
            Enable 2FA
          </Button>
        </div>
      )}
    </Card>
  )
}

/* ---------------- shared bits ---------------- */
function Card({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function Message({ ok, text }: { ok: boolean; text: string }) {
  return <p className={`text-xs ${ok ? 'text-green-600' : 'text-red-600'}`}>{text}</p>
}
