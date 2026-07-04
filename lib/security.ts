// Security audit logging + email alerting.
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

type EventInfo = {
  email?: string | null
  ip?: string | null
  userAgent?: string | null
  meta?: Record<string, unknown>
}

export async function logSecurityEvent(type: string, info: EventInfo = {}) {
  try {
    await prisma.securityEvent.create({
      data: {
        type,
        email: info.email ?? null,
        ip: info.ip ?? null,
        userAgent: info.userAgent ?? null,
        meta: (info.meta as object) ?? undefined,
      },
    })
  } catch (e) {
    console.error('logSecurityEvent failed:', e)
  }
}

// Fires an email when the admin panel is accessed. Throttled to one email per
// 10 minutes per email-address so navigating inside the panel doesn't spam you.
// No-op (beyond logging) when ALERT_EMAIL / email provider aren't configured.
export async function alertAdminAccess(info: EventInfo = {}) {
  await logSecurityEvent('admin_access', info)

  const to = process.env.ALERT_EMAIL
  if (!to) return

  try {
    const since = new Date(Date.now() - 10 * 60 * 1000)
    const recent = await prisma.securityEvent.count({
      where: {
        type: 'admin_access_alert_sent',
        email: info.email ?? null,
        createdAt: { gte: since },
      },
    })
    if (recent > 0) return // already alerted recently
  } catch {
    /* if the check fails, still try to send once */
  }

  const when = new Date().toLocaleString()
  const who = info.email || 'unknown'
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px">
      <h2 style="color:#0b0a0d">⚠ Admin panel accessed</h2>
      <p>Someone opened the <b>ShopHub</b> admin dashboard.</p>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">User</td><td><b>${who}</b></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Time</td><td>${when}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">IP</td><td>${info.ip || 'n/a'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Device</td><td>${info.userAgent || 'n/a'}</td></tr>
      </table>
      <p style="color:#999;font-size:12px;margin-top:16px">If this was not you, change your password and 2FA immediately.</p>
    </div>`

  await sendEmail({
    to,
    subject: '⚠ ShopHub admin panel was accessed',
    html,
    text: `Admin panel accessed by ${who} at ${when} (IP ${info.ip || 'n/a'}).`,
  })

  await logSecurityEvent('admin_access_alert_sent', { email: info.email })
}

// Notify the store owner that a new order arrived.
export async function alertNewOrder(order: {
  orderNumber: string
  total: number | string
  customerName?: string | null
  customerEmail?: string | null
}) {
  const to = process.env.ALERT_EMAIL
  if (!to) return

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px">
      <h2>🛒 New order received</h2>
      <p>Order <b>${order.orderNumber}</b> was just placed on <b>ShopHub</b>.</p>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Customer</td><td>${order.customerName || 'n/a'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${order.customerEmail || 'n/a'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Total</td><td><b>$${Number(order.total).toFixed(2)}</b></td></tr>
      </table>
      <p style="color:#999;font-size:12px">See it in Admin → Orders.</p>
    </div>`

  await sendEmail({
    to,
    subject: `🛒 New ShopHub order ${order.orderNumber}`,
    html,
    text: `New order ${order.orderNumber} — $${Number(order.total).toFixed(2)} from ${order.customerName || 'a customer'}.`,
  })
}
