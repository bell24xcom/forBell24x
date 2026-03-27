const { PrismaClient } = require('@prisma/client')
const { getCategoriesForSeeding, getSubcategoriesForSeeding, getMockOrdersForSeeding } = require('../src/data/all-50-categories.ts')

const prisma = new PrismaClient()

async function seedAllCategories() {
  console.log('🌱 Starting comprehensive category seeding...')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing category data...')
    await prisma.mockOrder.deleteMany()
    await prisma.subcategory.deleteMany()
    await prisma.category.deleteMany()
    
    // Seed categories
    console.log('📂 Seeding 50 categories...')
    const categories = getCategoriesForSeeding()
    
    for (const categoryData of categories) {
      const category = await prisma.category.create({
        data: {
          id: categoryData.id,
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description,
          icon: categoryData.icon,
          supplierCount: categoryData.supplierCount,
          productCount: categoryData.productCount,
          rfqCount: categoryData.rfqCount,
          mockOrderCount: categoryData.mockOrderCount,
          trending: categoryData.trending,
          isActive: categoryData.isActive,
          sortOrder: categoryData.sortOrder,
          metaTitle: categoryData.metaTitle,
          metaDescription: categoryData.metaDescription,
          keywords: categoryData.keywords
        }
      })
      
      console.log(`  ✅ Created category: ${category.name}`)
    }
    
    // Seed subcategories
    console.log('📁 Seeding subcategories...')
    const subcategories = getSubcategoriesForSeeding()
    
    for (const subcategoryData of subcategories) {
      await prisma.subcategory.create({
        data: {
          id: subcategoryData.id,
          name: subcategoryData.name,
          slug: subcategoryData.slug,
          description: subcategoryData.description,
          categoryId: subcategoryData.categoryId,
          supplierCount: subcategoryData.supplierCount,
          productCount: subcategoryData.productCount,
          rfqCount: subcategoryData.rfqCount,
          mockOrderCount: subcategoryData.mockOrderCount,
          isActive: subcategoryData.isActive,
          sortOrder: subcategoryData.sortOrder
        }
      })
    }
    
    console.log(`  ✅ Created ${subcategories.length} subcategories`)
    
    // Seed mock orders
    console.log('📦 Seeding mock orders...')
    const mockOrders = getMockOrdersForSeeding()
    
    for (const orderData of mockOrders) {
      await prisma.mockOrder.create({
        data: {
          id: orderData.id,
          title: orderData.title,
          description: orderData.description,
          value: orderData.value,
          currency: orderData.currency,
          status: orderData.status,
          buyer: orderData.buyer,
          supplier: orderData.supplier,
          category: orderData.category,
          subcategory: orderData.subcategory,
          categoryId: orderData.categoryId,
          createdAt: new Date(orderData.createdAt),
          completedAt: orderData.completedAt ? new Date(orderData.completedAt) : null
        }
      })
    }
    
    console.log(`  ✅ Created ${mockOrders.length} mock orders`)
    
    // Generate comprehensive mock RFQ data
    console.log('📝 Generating comprehensive mock RFQ data...')
    await generateMockRFQs()
    
    console.log('🎉 Category seeding completed successfully!')
    
    // Display summary
    const categoryCount = await prisma.category.count()
    const subcategoryCount = await prisma.subcategory.count()
    const mockOrderCount = await prisma.mockOrder.count()
    const rfqCount = await prisma.rfQ.count()
    
    console.log('\n📊 Seeding Summary:')
    console.log(`  Categories: ${categoryCount}`)
    console.log(`  Subcategories: ${subcategoryCount}`)
    console.log(`  Mock Orders: ${mockOrderCount}`)
    console.log(`  Mock RFQs: ${rfqCount}`)
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function generateMockRFQs() {
  const categories = await prisma.category.findMany({
    include: { subcategories: true }
  })
  
  const mockRFQs = []
  
  for (const category of categories) {
    // Generate 3-5 RFQs per category
    const rfqCount = Math.floor(Math.random() * 3) + 3
    
    for (let i = 0; i < rfqCount; i++) {
      const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)]
      
      const rfq = {
        id: `RFQ-${category.slug}-${subcategory.slug}-${i + 1}`,
        title: `RFQ: ${subcategory.name} - ${category.name}`,
        description: `Looking for reliable suppliers of ${subcategory.name.toLowerCase()} in ${category.name.toLowerCase()} category. Quality and timely delivery are our top priorities.`,
        category: category.name,
        subcategory: subcategory.name,
        categoryId: category.id,
        subcategoryId: subcategory.id,
        budget: Math.floor(Math.random() * 5000000) + 100000,
        quantity: Math.floor(Math.random() * 1000) + 10,
        unit: 'pieces',
        deliveryLocation: 'Mumbai, Maharashtra',
        deliveryTimeframe: '30 days',
        specifications: {
          quality: 'High',
          certification: 'ISO 9001',
          packaging: 'Standard',
          payment: '30% advance, 70% on delivery'
        },
        status: ['open', 'in_progress', 'closed'][Math.floor(Math.random() * 3)],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        isActive: true,
        createdBy: 'mock-user',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
      
      mockRFQs.push(rfq)
    }
  }
  
  // Insert mock RFQs in batches
  const batchSize = 100
  for (let i = 0; i < mockRFQs.length; i += batchSize) {
    const batch = mockRFQs.slice(i, i + batchSize)
    await prisma.rFQ.createMany({
      data: batch
    })
  }
  
  console.log(`  ✅ Generated ${mockRFQs.length} mock RFQs`)
}

// Run the seeding
if (require.main === module) {
  seedAllCategories()
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedAllCategories }
