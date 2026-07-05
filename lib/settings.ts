import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export type SocialLinks = {
  facebook: string
  instagram: string
  twitter: string
  youtube: string
  tiktok: string
  whatsapp: string
}

export type SiteSettings = {
  brandName: string
  tagline: string // short line under the brand / in the footer
  heroTitle: string
  heroSubtitle: string
  description: string // SEO meta description
  keywords: string // SEO keywords / tags (comma separated)
  promoBanner: string // thin top-bar text ("" = hidden)
  promoBannerEnabled: boolean
  footerText: string
  contactEmail: string
  social: SocialLinks
}

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'ShopHub',
  tagline: 'Premium products at unbeatable prices.',
  heroTitle: 'Welcome to ShopHub',
  heroSubtitle:
    'Discover amazing products at unbeatable prices. Your satisfaction is our priority.',
  description: 'Premium e-commerce platform with amazing products',
  keywords: 'ecommerce, shopping, electronics, fashion, deals',
  promoBanner: '🚚 Free shipping on orders over $50 — shop now!',
  promoBannerEnabled: true,
  footerText: '',
  contactEmail: 'support@shophub.com',
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: '',
    whatsapp: '',
  },
}

// Cached per-request so multiple components (layout, header, footer) share one query.
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 'site' } })
    const data = (row?.data as Partial<SiteSettings>) || {}
    return {
      ...DEFAULT_SETTINGS,
      ...data,
      social: { ...DEFAULT_SETTINGS.social, ...(data.social || {}) },
    }
  } catch {
    return DEFAULT_SETTINGS
  }
})

export async function saveSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSettings()
  const next: SiteSettings = {
    ...current,
    ...patch,
    social: { ...current.social, ...(patch.social || {}) },
  }
  await prisma.siteSetting.upsert({
    where: { id: 'site' },
    update: { data: next as object },
    create: { id: 'site', data: next as object },
  })
  return next
}
