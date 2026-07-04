// Bulk-import products from a JSON file into the database.
// Usage:
//   node scripts/import-products.mjs scripts/products.json
//
// products.json format — an array of objects:
// [
//   {
//     "name": "Wireless Earbuds",
//     "price": 49.99,
//     "comparePrice": 79.99,          // optional
//     "category": "Electronics",
//     "description": "…",             // optional
//     "image": "https://.../img.jpg", // primary image URL
//     "images": ["https://…"],        // optional extra images
//     "stock": 25,                     // optional (default 10)
//     "featured": true                 // optional
//   }
// ]
//
// This is what your other-website products get converted into. Send me the
// link and I'll generate scripts/products.json for you; then run this command.

import { PrismaClient, Prisma } from '@prisma/client'
import { readFileSync } from 'node:fs'

const prisma = new PrismaClient()

function slugify(name) {
  const base = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

async function main() {
  const file = process.argv[2] || 'scripts/products.json'
  const items = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(items)) throw new Error('JSON must be an array of products.')

  let created = 0
  for (const p of items) {
    if (!p?.name || p.price == null) {
      console.warn('Skipping (missing name/price):', p?.name)
      continue
    }
    const images = p.images?.length ? p.images : p.image ? [p.image] : []
    await prisma.product.create({
      data: {
        name: String(p.name),
        slug: slugify(p.name),
        description: p.description ? String(p.description) : '',
        price: new Prisma.Decimal(Number(p.price)),
        comparePrice: p.comparePrice != null ? new Prisma.Decimal(Number(p.comparePrice)) : null,
        category: p.category ? String(p.category) : 'General',
        stock: p.stock != null ? Number(p.stock) : 10,
        images,
        featured: !!p.featured,
        isActive: true,
        tags: Array.isArray(p.tags) ? p.tags : [],
      },
    })
    created++
    console.log('  + ', p.name)
  }
  console.log(`\n✅ Imported ${created} product(s).`)
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
