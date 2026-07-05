import { getSettings } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/settings-form'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-sm text-gray-500">
          Control your store&apos;s name, text, SEO tags, promo banner and social links.
          Changes appear on the storefront immediately.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  )
}
