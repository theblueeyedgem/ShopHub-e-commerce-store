# ShopHub — GitHub + Supabase + Vercel deployment guide

Follow top to bottom. Commands go in a terminal opened **inside** `E:\vs code web`.

---

## PART 1 — Push the code to GitHub

1. Install Git (if you haven't): https://git-scm.com/download/win
2. Create an empty repo on GitHub: https://github.com/new
   - Name: `shophub` · **Private** or Public · **do NOT** add README/gitignore.
   - Copy the repo URL, e.g. `https://github.com/YOURNAME/shophub.git`
3. In the terminal (inside `E:\vs code web`):

```bash
git init
git add .
git commit -m "ShopHub e-commerce store"
git branch -M main
git remote add origin https://github.com/YOURNAME/shophub.git
git push -u origin main
```

> `.env.local` is git-ignored (secrets never leave your machine). Good.

---

## PART 2 — Create the database on Supabase

1. Sign up / log in: https://supabase.com → **New project**.
   - Name: `shophub` · set a **database password** (save it!) · pick a region.
2. Wait ~2 min for it to provision.
3. Get the connection strings: **Project → Settings → Database → Connection string**.
   - **Transaction pooler** (port **6543**) → this is your `DATABASE_URL`.
     Add `?pgbouncer=true&connection_limit=1` at the end.
   - **Direct connection** (port **5432**) → this is your `DIRECT_URL`.
   - Replace `[YOUR-PASSWORD]` in both with the password from step 1.

Example:
```
DATABASE_URL="postgresql://postgres.abcd:PASS@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.abcd:PASS@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

4. Put them in your local `.env.local` (replace the local Postgres lines).
5. Create the tables + seed data **from your PC** (points at Supabase now):

```bash
npx prisma db push        # creates all tables on Supabase
npm run seed              # admin user + sample products + sample orders
```

You should see “Admin user created” and “Database seeded successfully”.

---

## PART 3 — Deploy to Vercel

1. Go to https://vercel.com → sign in **with GitHub** → **Add New… → Project**.
2. Import your `shophub` repo. Framework auto-detects **Next.js**. Don't deploy yet.
3. Open **Environment Variables** and add these (Production + Preview):

| Name | Value |
|---|---|
| `DATABASE_URL` | your Supabase **pooler** (6543) string |
| `DIRECT_URL` | your Supabase **direct** (5432) string |
| `NEXTAUTH_SECRET` | a random 32+ char string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://YOUR-APP.vercel.app` (set after first deploy, then redeploy) |
| `NEXT_PUBLIC_APP_URL` | same as `NEXTAUTH_URL` |

   Optional (email alerts): `RESEND_API_KEY`, `EMAIL_FROM`, `ALERT_EMAIL`.

4. Click **Deploy**. When it finishes you'll get a URL like `https://shophub-xxx.vercel.app`.
5. Copy that URL → set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to it → **Redeploy**
   (Vercel → Deployments → ⋯ → Redeploy). This step is what makes login/admin work.

---

## PART 4 — Log into the admin panel

- Open `https://YOUR-APP.vercel.app/admin`
- Email: `admin@shophub.com` · Password: `Admin@123456`
- Go to **Security & 2FA** → change email + password, and enable 2FA.

### If the admin panel says "not accessible" / bounces to login
Almost always one of these:
1. **`NEXTAUTH_SECRET` or `NEXTAUTH_URL` missing/wrong on Vercel** → set them, redeploy.
2. **No admin user in the database.** Run this **from your PC** (env pointed at Supabase):
   ```bash
   npm run create-admin -- owner@you.com "YourStrongPassword"
   ```
   Then log in with those.
3. You enabled 2FA and lost the code → run `create-admin` again to reset the password,
   then in Security disable & re-enable 2FA.

---

## PART 5 — Add products from another website

Two ways:

**A. Manually in the admin** — `/admin/products` → fill the "Add product" form → it
appears on the store instantly.

**B. Bulk import** — put the products in `scripts/products.json` (array format shown
inside `scripts/import-products.mjs`), then:
```bash
npm run import-products -- scripts/products.json
```

> Send me the product page link and I'll generate `scripts/products.json` for you —
> then you just run the command above.

---

## Everyday updates

Change code → push → Vercel auto-redeploys:
```bash
git add .
git commit -m "update"
git push
```
Schema changes also need: `npx prisma db push` (against Supabase).
