'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function AdminLogoutButton() {
  const [loading, setLoading] = useState(false)
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        await signOut({ callbackUrl: '/login' })
      }}
      className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  )
}
