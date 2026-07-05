'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CustomerLogout() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
      <LogOut className="h-4 w-4 mr-1" /> Log out
    </Button>
  )
}
