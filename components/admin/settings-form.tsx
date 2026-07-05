'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, Store, Megaphone, Search, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SiteSettings } from '@/lib/settings'
import { toast } from 'sonner'

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter()
  const [s, setS] = useState<SiteSettings>(initial)
  const [busy, setBusy] = useState(false)

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setS((prev) => ({ ...prev, [key]: value }))
  }
  function setSocial(key: keyof SiteSettings['social'], value: string) {
    setS((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s),
    })
    setBusy(false)
    if (res.ok) {
      toast.success('Settings saved — live on the storefront.')
      router.refresh()
    } else {
      toast.error('Could not save settings.')
    }
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      {/* Brand & text */}
      <Card icon={<Store className="h-5 w-5" />} title="Brand & storefront text">
        <Field label="Website name">
          <Input value={s.brandName} onChange={(e) => set('brandName', e.target.value)} />
        </Field>
        <Field label="Tagline (short line under the brand / footer)">
          <Input value={s.tagline} onChange={(e) => set('tagline', e.target.value)} />
        </Field>
        <Field label="Homepage hero title">
          <Input value={s.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} />
        </Field>
        <Field label="Homepage hero subtitle">
          <textarea value={s.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} rows={2} className="ta" />
        </Field>
        <Field label="Footer text (optional)">
          <Input value={s.footerText} onChange={(e) => set('footerText', e.target.value)} placeholder="© 2025 Your Store…" />
        </Field>
        <Field label="Contact / support email">
          <Input type="email" value={s.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
        </Field>
      </Card>

      {/* Promo banner */}
      <Card icon={<Megaphone className="h-5 w-5" />} title="Promo banner (top bar)">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.promoBannerEnabled} onChange={(e) => set('promoBannerEnabled', e.target.checked)} />
          Show the promo banner at the top of every page
        </label>
        <Field label="Banner text">
          <Input value={s.promoBanner} onChange={(e) => set('promoBanner', e.target.value)} placeholder="🚚 Free shipping over $50" />
        </Field>
      </Card>

      {/* SEO */}
      <Card icon={<Search className="h-5 w-5" />} title="SEO (search engines)">
        <Field label="Meta description">
          <textarea value={s.description} onChange={(e) => set('description', e.target.value)} rows={2} className="ta" />
        </Field>
        <Field label="Keywords / tags (comma separated)">
          <Input value={s.keywords} onChange={(e) => set('keywords', e.target.value)} placeholder="shoes, electronics, deals" />
        </Field>
      </Card>

      {/* Social */}
      <Card icon={<Share2 className="h-5 w-5" />} title="Social media links">
        <p className="text-xs text-gray-500 -mt-2 mb-1">Paste full URLs. Empty fields are hidden on the site.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Facebook"><Input value={s.social.facebook} onChange={(e) => setSocial('facebook', e.target.value)} placeholder="https://facebook.com/…" /></Field>
          <Field label="Instagram"><Input value={s.social.instagram} onChange={(e) => setSocial('instagram', e.target.value)} placeholder="https://instagram.com/…" /></Field>
          <Field label="X / Twitter"><Input value={s.social.twitter} onChange={(e) => setSocial('twitter', e.target.value)} placeholder="https://x.com/…" /></Field>
          <Field label="YouTube"><Input value={s.social.youtube} onChange={(e) => setSocial('youtube', e.target.value)} placeholder="https://youtube.com/@…" /></Field>
          <Field label="TikTok"><Input value={s.social.tiktok} onChange={(e) => setSocial('tiktok', e.target.value)} placeholder="https://tiktok.com/@…" /></Field>
          <Field label="WhatsApp"><Input value={s.social.whatsapp} onChange={(e) => setSocial('whatsapp', e.target.value)} placeholder="https://wa.me/12345678900" /></Field>
        </div>
      </Card>

      <div className="sticky bottom-4">
        <Button type="submit" size="lg" disabled={busy} className="shadow-lg">
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
          {busy ? 'Saving…' : 'Save all settings'}
        </Button>
      </div>

      <style>{`.ta{display:flex;width:100%;border-radius:0.375rem;border:1px solid hsl(var(--input));background:hsl(var(--background));padding:0.5rem 0.75rem;font-size:0.875rem}`}</style>
    </form>
  )
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-primary">{icon}</span>
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
    </div>
  )
}
