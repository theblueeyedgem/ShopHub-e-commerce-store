import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Music2, MessageCircle } from 'lucide-react'
import type { SocialLinks } from '@/lib/settings'

export function Footer({
  brandName = 'ShopHub',
  tagline = '',
  footerText = '',
  contactEmail = 'support@shophub.com',
  social,
}: {
  brandName?: string
  tagline?: string
  footerText?: string
  contactEmail?: string
  social?: SocialLinks
}) {
  const socials = [
    { href: social?.facebook, icon: Facebook, label: 'Facebook' },
    { href: social?.instagram, icon: Instagram, label: 'Instagram' },
    { href: social?.twitter, icon: Twitter, label: 'X / Twitter' },
    { href: social?.youtube, icon: Youtube, label: 'YouTube' },
    { href: social?.tiktok, icon: Music2, label: 'TikTok' },
    { href: social?.whatsapp, icon: MessageCircle, label: 'WhatsApp' },
  ].filter((x) => x.href)

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-4">{brandName}</h3>
            <p className="text-sm text-gray-400">
              {tagline || 'Premium products at unbeatable prices.'}
            </p>

            {socials.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href as string}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/products?category=Electronics" className="hover:text-white">Electronics</Link></li>
              <li><Link href="/products?category=Fashion" className="hover:text-white">Fashion</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-white">Deals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
              <li><Link href="/register" className="hover:text-white">Register</Link></li>
              <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              <li><Link href="/track" className="hover:text-white">Track Order</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href={`mailto:${contactEmail}`} className="hover:text-white">{contactEmail}</a></li>
              <li><span className="text-gray-400">Mon–Fri, 9am–5pm</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          {footerText || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}
        </div>
      </div>
    </footer>
  )
}
