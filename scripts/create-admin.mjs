// Create or promote an ADMIN user on the connected database.
// Usage:
//   node scripts/create-admin.mjs <email> <password>
// Example:
//   node scripts/create-admin.mjs owner@shophub.com "MyStrongPass123"
//
// If the user exists it is promoted to ADMIN and (if a password is given) the
// password is reset. Run this against your Supabase DB after deploying if you
// ever get locked out of /admin.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = (process.argv[2] || 'admin@shophub.com').toLowerCase()
  const password = process.argv[3] || 'Admin@123456'
  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', password: hash },
    create: { email, name: 'Admin', role: 'ADMIN', password: hash },
  })

  console.log('✅ Admin ready:')
  console.log('   Email:   ', user.email)
  console.log('   Password:', password)
  console.log('   Role:    ', user.role)
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
