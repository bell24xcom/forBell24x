
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default categories
  const categories = [
    { name: 'Textiles & Garments', description: 'Clothing and textile products' },
    { name: 'Pharmaceuticals', description: 'Medical and pharmaceutical products' },
    { name: 'Agricultural Products', description: 'Farming and agricultural supplies' },
    { name: 'Automotive Parts', description: 'Vehicle components and parts' },
    { name: 'IT Services', description: 'Information technology services' },
    { name: 'Gems & Jewelry', description: 'Precious stones and jewelry' },
    { name: 'Handicrafts', description: 'Handmade and artisanal products' },
    { name: 'Machinery & Equipment', description: 'Industrial machinery and equipment' },
    { name: 'Chemicals', description: 'Chemical products and supplies' },
    { name: 'Food Processing', description: 'Food and beverage processing' },
    { name: 'Construction', description: 'Building and construction materials' },
    { name: 'Metals & Steel', description: 'Metal products and steel' },
    { name: 'Plastics', description: 'Plastic products and materials' },
    { name: 'Paper & Packaging', description: 'Paper products and packaging' },
    { name: 'Rubber', description: 'Rubber products and materials' },
    { name: 'Ceramics', description: 'Ceramic products and materials' },
    { name: 'Glass', description: 'Glass products and materials' },
    { name: 'Wood', description: 'Wood products and materials' },
    { name: 'Leather', description: 'Leather products and materials' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  console.log('✅ Categories created')

  // Create sample campaigns
  const sampleCampaigns = [
    {
      name: 'B2B Marketplace Launch',
      description: 'Launch campaign for Bell24h B2B marketplace',
      channels: ['google', 'facebook', 'linkedin'],
      budget: 10000,
      targetMarket: 'B2B Suppliers',
      productName: 'Bell24h Platform',
      status: 'PUBLISHED'
    },
    {
      name: 'Supplier Acquisition',
      description: 'Campaign to acquire new suppliers',
      channels: ['google', 'linkedin'],
      budget: 5000,
      targetMarket: 'Manufacturing Companies',
      productName: 'Supplier Portal',
      status: 'PUBLISHED'
    },
    {
      name: 'RFQ Feature Promotion',
      description: 'Promote RFQ creation feature',
      channels: ['facebook', 'twitter'],
      budget: 3000,
      targetMarket: 'Buyers',
      productName: 'RFQ System',
      status: 'DRAFT'
    }
  ]

  for (const campaign of sampleCampaigns) {
    await prisma.campaign.upsert({
      where: { name: campaign.name },
      update: {},
      create: campaign
    })
  }

  console.log('✅ Sample campaigns created')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
