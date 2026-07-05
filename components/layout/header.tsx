'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, PackageSearch, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'

export function Header({ brandName = 'ShopHub' }: { brandName?: string }) {
  const { data: session } = useSession()
  const items = useCart((s) => s.items)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const [open, setOpen] = useState(false)

  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            {brandName}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/products?featured=true" className="hover:text-primary transition-colors">
              Deals
            </Link>
            <Link href="/track" className="hover:text-primary transition-colors">
              Track Order
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="w-4 h-4 mr-1" /> Admin
                    </Button>
                  </Link>
                ) : (
                  <Link href="/account">
                    <Button variant="ghost" size="sm">
                      <UserCircle className="w-4 h-4 mr-1" /> Account
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-1" /> Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden py-3 border-t flex flex-col gap-2">
            <Link href="/products" onClick={() => setOpen(false)}>Products</Link>
            <Link href="/products?featured=true" onClick={() => setOpen(false)}>Deals</Link>
            <Link href="/track" onClick={() => setOpen(false)}>Track Order</Link>
            {session ? (
              <Link href={isAdmin ? '/admin' : '/account'} onClick={() => setOpen(false)}>
                {isAdmin ? 'Admin' : 'My Account'}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/register" onClick={() => setOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
