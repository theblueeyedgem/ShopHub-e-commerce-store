import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getSettings, saveSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  return (session?.user as { role?: string } | undefined)?.role === 'ADMIN'
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await getSettings()
  return NextResponse.json({ settings })
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const patch = await req.json().catch(() => ({}))
  const settings = await saveSettings(patch)
  return NextResponse.json({ ok: true, settings })
}
