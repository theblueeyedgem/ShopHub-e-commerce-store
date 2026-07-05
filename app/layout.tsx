import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from 'sonner'
import { getSettings } from '@/lib/settings'

const inter = Inter({ subsets: ['latin'] })

// Title / description / keywords come from the admin Site Settings.
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return {
    title: `${s.brandName} - ${s.tagline}`,
    description: s.description,
    keywords: s.keywords,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {settings.promoBannerEnabled && settings.promoBanner ? (
              <div className="bg-primary text-primary-foreground text-center text-sm py-2 px-4">
                {settings.promoBanner}
              </div>
            ) : null}
            <Header brandName={settings.brandName} />
            <main className="flex-1">{children}</main>
            <Footer
              brandName={settings.brandName}
              tagline={settings.tagline}
              footerText={settings.footerText}
              contactEmail={settings.contactEmail}
              social={settings.social}
            />
          </div>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
