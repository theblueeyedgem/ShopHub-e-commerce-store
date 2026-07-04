import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function orderNumber() {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `ORD-${t}-${r}`
}

async function main() {
  console.log('🌱 Starting database seed...')

  // ---- Admin user ----
  const hashedPassword = await bcrypt.hash('Admin@123456', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shophub.com' },
    update: {},
    create: {
      email: 'admin@shophub.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // ---- A demo customer (used to attach sample orders) ----
  const customer = await prisma.user.upsert({
    where: { email: 'customer@shophub.com' },
    update: {},
    create: {
      email: 'customer@shophub.com',
      name: 'Jane Customer',
      password: await bcrypt.hash('Customer@123', 10),
      role: 'CUSTOMER',
    },
  })

  // ---- Sample products ----
  const products = [
    {
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description:
        'Experience crystal-clear audio with our premium noise-cancelling headphones. Features 40-hour battery life, premium comfort padding, and studio-quality sound. Perfect for music lovers and professionals.',
      price: 299.99,
      comparePrice: 399.99,
      category: 'Electronics',
      stock: 50,
      sku: 'WH-PRO-001',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
      featured: true,
      tags: ['electronics', 'audio', 'wireless', 'featured'],
    },
    {
      name: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      description:
        'Stay connected and track your fitness with advanced health monitoring, GPS, and 7-day battery life. Water-resistant design with customizable watch faces.',
      price: 399.99,
      comparePrice: 499.99,
      category: 'Electronics',
      stock: 35,
      sku: 'SW-PRO-002',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
      featured: true,
      tags: ['electronics', 'wearables', 'fitness'],
    },
    {
      name: 'Minimalist Backpack',
      slug: 'minimalist-backpack',
      description:
        'Sleek design meets functionality. Water-resistant material with laptop compartment, USB charging port, and anti-theft pocket. Perfect for daily commute or travel.',
      price: 79.99,
      category: 'Fashion',
      stock: 100,
      sku: 'BP-MIN-003',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
      featured: false,
      tags: ['fashion', 'accessories', 'travel'],
    },
    {
      name: 'Classic Leather Wallet',
      slug: 'classic-leather-wallet',
      description:
        'Handcrafted genuine leather wallet with RFID protection. Slim design with 8 card slots, 2 bill compartments. Ages beautifully with use.',
      price: 49.99,
      category: 'Fashion',
      stock: 75,
      sku: 'WL-LEA-004',
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
      featured: false,
      tags: ['fashion', 'accessories', 'leather'],
    },
    {
      name: 'Stainless Steel Water Bottle',
      slug: 'stainless-steel-water-bottle',
      description:
        'Keep drinks cold for 24 hours or hot for 12 hours. BPA-free, leak-proof design with wide mouth for easy cleaning. Eco-friendly choice.',
      price: 34.99,
      category: 'Sports',
      stock: 150,
      sku: 'WB-SS-005',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
      featured: false,
      tags: ['sports', 'accessories', 'eco-friendly'],
    },
    {
      name: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      description:
        'Extra thick 6mm cushioning with non-slip texture. Eco-friendly TPE material, lightweight and durable. Comes with carrying strap.',
      price: 59.99,
      category: 'Sports',
      stock: 80,
      sku: 'YM-PRE-006',
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'],
      featured: false,
      tags: ['sports', 'fitness', 'yoga'],
    },
    {
      name: 'Wireless Bluetooth Speaker',
      slug: 'wireless-bluetooth-speaker',
      description:
        '360° premium sound with deep bass. Waterproof IPX7 rating, 20-hour battery life. Perfect for outdoor adventures and parties.',
      price: 129.99,
      comparePrice: 179.99,
      category: 'Electronics',
      stock: 60,
      sku: 'SP-BT-007',
      images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'],
      featured: true,
      tags: ['electronics', 'audio', 'wireless'],
    },
    {
      name: 'Desk Organizer Set',
      slug: 'desk-organizer-set',
      description:
        'Modern wooden desk organizer with phone stand, pen holder, and cable management. Keep your workspace tidy and organized.',
      price: 44.99,
      category: 'Home',
      stock: 90,
      sku: 'DO-WOD-008',
      images: ['https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80'],
      featured: false,
      tags: ['home', 'office', 'organization'],
    },
    {
      name: 'LED Desk Lamp',
      slug: 'led-desk-lamp',
      description:
        'Adjustable brightness and color temperature. Touch control with USB charging port. Eye-friendly lighting for work and study.',
      price: 69.99,
      category: 'Home',
      stock: 70,
      sku: 'DL-LED-009',
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'],
      featured: false,
      tags: ['home', 'lighting', 'office'],
    },
    {
      name: 'Running Shoes Ultra',
      slug: 'running-shoes-ultra',
      description:
        'Lightweight cushioning with responsive energy return. Breathable mesh upper with reflective details. Engineered for performance.',
      price: 149.99,
      comparePrice: 189.99,
      category: 'Fashion',
      stock: 55,
      sku: 'RS-ULT-010',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
      featured: true,
      tags: ['fashion', 'footwear', 'sports'],
    },
    {
      name: 'Coffee Maker Pro',
      slug: 'coffee-maker-pro',
      description:
        'Programmable 12-cup coffee maker with thermal carafe. Brew strength control and auto-shutoff. Start your day right.',
      price: 89.99,
      category: 'Home',
      stock: 45,
      sku: 'CM-PRO-011',
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80'],
      featured: false,
      tags: ['home', 'kitchen', 'appliances'],
    },
    {
      name: 'Wireless Phone Charger',
      slug: 'wireless-phone-charger',
      description:
        'Fast 15W wireless charging pad with LED indicator. Compatible with all Qi-enabled devices. Sleek and compact design.',
      price: 29.99,
      category: 'Electronics',
      stock: 120,
      sku: 'WC-15W-012',
      images: ['https://images.unsplash.com/photo-1591290619762-caa6c4f53ed8?w=800&q=80'],
      featured: false,
      tags: ['electronics', 'accessories', 'wireless'],
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }
  console.log('✅ Sample products created')

  // ---- Sample orders (so the admin "Orders received" screen has data) ----
  const existingOrders = await prisma.order.count()
  if (existingOrders === 0) {
    const headphones = await prisma.product.findUnique({
      where: { slug: 'premium-wireless-headphones' },
    })
    const watch = await prisma.product.findUnique({ where: { slug: 'smart-watch-pro' } })

    if (headphones && watch) {
      const sampleOrders = [
        {
          status: 'PENDING' as const,
          customerName: 'Jane Customer',
          customerEmail: 'customer@shophub.com',
          customerPhone: '+1 555-0100',
          paymentMethod: 'Card',
          items: [{ product: headphones, quantity: 1 }],
          address: {
            fullName: 'Jane Customer',
            street: '12 Market St',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            country: 'USA',
            phone: '+1 555-0100',
          },
        },
        {
          status: 'PROCESSING' as const,
          customerName: 'John Buyer',
          customerEmail: 'john@example.com',
          customerPhone: '+1 555-0199',
          paymentMethod: 'Card',
          items: [
            { product: watch, quantity: 1 },
            { product: headphones, quantity: 2 },
          ],
          address: {
            fullName: 'John Buyer',
            street: '48 Oak Avenue',
            city: 'Denver',
            state: 'CO',
            zipCode: '80202',
            country: 'USA',
            phone: '+1 555-0199',
          },
        },
      ]

      for (const o of sampleOrders) {
        const subtotal = o.items.reduce(
          (sum, it) => sum + Number(it.product.price) * it.quantity,
          0
        )
        const tax = +(subtotal * 0.08).toFixed(2)
        const shipping = subtotal > 50 ? 0 : 9.99
        const total = +(subtotal + tax + shipping).toFixed(2)

        await prisma.order.create({
          data: {
            userId: customer.id,
            orderNumber: orderNumber(),
            status: o.status,
            subtotal: new Prisma.Decimal(subtotal),
            tax: new Prisma.Decimal(tax),
            shipping: new Prisma.Decimal(shipping),
            total: new Prisma.Decimal(total),
            customerName: o.customerName,
            customerEmail: o.customerEmail,
            customerPhone: o.customerPhone,
            paymentMethod: o.paymentMethod,
            shippingAddress: o.address,
            items: {
              create: o.items.map((it) => ({
                productId: it.product.id,
                quantity: it.quantity,
                price: new Prisma.Decimal(Number(it.product.price)),
              })),
            },
          },
        })
      }
      console.log('✅ Sample orders created')
    }
  }

  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Admin Login:')
  console.log('  Email:    admin@shophub.com')
  console.log('  Password: Admin@123456')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
