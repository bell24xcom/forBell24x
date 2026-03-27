import { PrismaClient } from '@prisma/client'
import { ALL_50_CATEGORIES } from '../src/data/all-50-categories'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean small demo tables (safe for dev/demo only)
  await prisma.message.deleteMany().catch(() => {})
  await prisma.quote.deleteMany().catch(() => {})
  await prisma.rfq.deleteMany().catch(() => {})
  await prisma.category.deleteMany().catch(() => {})
  await prisma.user.deleteMany().catch(() => {})

  // Create demo users
  const buyer = await prisma.user.create({
    data: {
      email: 'buyer@bell24h.com',
      name: 'Demo Buyer',
      phone: '+91 9876543210',
      company: 'ABC Industries',
      role: 'buyer',
    },
  })
  const supplier = await prisma.user.create({
    data: {
      email: 'supplier@bell24h.com',
      name: 'Demo Supplier',
      phone: '+91 9876543211',
      company: 'XYZ Suppliers',
      role: 'supplier',
    },
  })

  // Seed categories
  for (const cat of ALL_50_CATEGORIES) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        rfqCount: typeof cat.rfqCount === 'number' ? cat.rfqCount : 0,
      },
    })
  }

  // Create two demo RFQs
  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } })
  const construction = await prisma.category.findUnique({ where: { slug: 'construction' } })

  if (electronics) {
    await prisma.rfq.create({
      data: {
        userId: buyer.id,
        categoryId: electronics.id,
        title: 'Need 500 LED Bulbs for Office',
        description: '9W warm white, BIS certified. Delivery in Mumbai.',
        type: 'text',
        status: 'active',
        location: 'Mumbai, MH',
        quantity: '500 units',
      },
    })
  }
  if (construction) {
    await prisma.rfq.create({
      data: {
        userId: buyer.id,
        categoryId: construction.id,
        title: 'Steel Rods Required - 1000kg',
        description: 'Grade 60 rods, urgent requirement for site.',
        type: 'voice',
        status: 'active',
        location: 'Delhi, IN',
        quantity: '1000 kg',
      },
    })
  }

  console.log('✅ Seed complete')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
