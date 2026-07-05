// Email delivery helper.
// Prefers Resend (set RESEND_API_KEY); falls back to SMTP via nodemailer
// (set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS). If neither is configured it
// simply logs to the server console so the app still runs in dev with no keys.
//
// Used for: security alerts (admin access) and new-order notifications.

type SendArgs = {
  to: string
  subject: string
  html: string
  text?: string
}

const FROM = process.env.EMAIL_FROM || 'ShopHub <onboarding@resend.dev>'

export async function sendEmail({ to, subject, html, text }: SendArgs) {
  // 1) Resend (recommended, simplest)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
      })
      if (res.ok) return { ok: true, provider: 'resend' as const }
      console.error('Resend error:', await res.text())
    } catch (e) {
      console.error('Resend failed:', e)
    }
  }

  // 2) SMTP via nodemailer (optional)
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = (await import('nodemailer')).default
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transport.sendMail({ from: FROM, to, subject, html, text })
      return { ok: true, provider: 'smtp' as const }
    } catch (e) {
      console.error('SMTP failed:', e)
    }
  }

  // 3) No provider configured — log instead of failing.
  console.warn(`[email] No provider configured — would have sent to ${to}: ${subject}`)
  return { ok: false, provider: 'none' as const }
}

// Sends an order confirmation to the CUSTOMER right after they place an order.
// No-op (beyond logging) when no email provider is configured.
export async function sendOrderConfirmation(order: {
  orderNumber: string
  customerName?: string | null
  customerEmail?: string | null
  total: number | string
  items: { name: string; quantity: number; price: number }[]
}) {
  if (!order.customerEmail) return

  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 8px">${i.name} × ${i.quantity}</td><td style="padding:4px 8px;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join('')

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px">
      <h2 style="color:#2563eb">Thank you for your order! 🎉</h2>
      <p>Hi ${order.customerName || 'there'}, we've received your order and are verifying your payment.</p>
      <p style="font-size:14px">Order number: <b>${order.orderNumber}</b><br/>
      Status: <b>Pending payment verification</b></p>
      <table style="border-collapse:collapse;font-size:14px;width:100%;margin-top:8px">
        ${rows}
        <tr><td style="padding:8px;border-top:1px solid #eee"><b>Total</b></td>
            <td style="padding:8px;border-top:1px solid #eee;text-align:right"><b>$${Number(order.total).toFixed(2)}</b></td></tr>
      </table>
      <p style="font-size:13px;color:#666;margin-top:16px">
        Track your order anytime with your order number at our website's <b>Track Order</b> page.
      </p>
      <p style="font-size:12px;color:#999">— ShopHub</p>
    </div>`

  await sendEmail({
    to: order.customerEmail,
    subject: `Your ShopHub order ${order.orderNumber} is confirmed`,
    html,
    text: `Thanks for your order ${order.orderNumber}! Total $${Number(order.total).toFixed(2)}. We're verifying your payment.`,
  })
}
