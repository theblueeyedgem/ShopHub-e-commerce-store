# ShopHub — Next.js E-commerce Store

A full-stack e-commerce store built with Next.js 14 (App Router), Prisma +
PostgreSQL, NextAuth, Tailwind, and a complete **admin panel** with 2FA.

## Features

- 🛍️ Storefront: home, product listing, product detail, cart, checkout
- 👤 Auth: register / login (NextAuth credentials), roles (CUSTOMER / ADMIN)
- 🔐 **Admin panel** (`/admin`, admins only):
  - **Dashboard** — orders received, revenue, products, customers, recent orders
  - **Orders** — every order placed, customer/shipping details, update status, delete
  - **Security & 2FA** — change login email, change password, enable/disable
    **two-factor authentication** (Google Authenticator) with **real-time code
    verification**
- 📧 Optional email alerts (admin access + new order) via Resend or SMTP
- 🔒 `/admin` protected by middleware **and** a server-side role check

## Prerequisites

- Node.js 18+
- A running **PostgreSQL** database

## Setup

```bash
# 1. Install dependencies (also runs `prisma generate`)
npm install

# 2. Configure environment
#    Edit .env.local and set DATABASE_URL to your Postgres connection string,
#    and NEXTAUTH_SECRET to a random 32+ char string.
#    (Generate one with:  openssl rand -base64 32)

# 3. Create the database tables
npx prisma migrate dev --name init

# 4. Seed admin user + sample products + sample orders
npm run seed

# 5. Start the dev server
npm run dev
```

Open http://localhost:3000

## Admin login (after seeding)

- URL: http://localhost:3000/admin
- Email: `admin@shophub.com`
- Password: `Admin@123456`

Change these immediately from **Admin → Security & 2FA**.

## Enabling 2FA (real-time)

1. Log in as admin → go to **Security & 2FA** → **Enable 2FA**.
2. Scan the QR code with **Google Authenticator** (or Authy).
3. Type the 6-digit code — the server verifies it **in real time** and only
   turns 2FA on once a valid code is confirmed.
4. Next login will ask for email + password **and** the current 6-digit code.

## Email alerts (optional)

The app runs fine with no email keys (it logs "would have sent" to the console).
To receive real emails, set in `.env.local`:

- `RESEND_API_KEY` and `EMAIL_FROM` (verified domain), plus `ALERT_EMAIL`
  (where alerts go), **or**
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm start` | Run the production build |
| `npm run seed` | Seed admin, products, sample orders |
| `npm run db:studio` | Open Prisma Studio (browse the DB) |
