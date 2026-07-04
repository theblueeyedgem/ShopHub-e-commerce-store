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
