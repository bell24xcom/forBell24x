#!/usr/bin/env node

/**
 * Database Seeding Script
 * Seeds the database with categories, mock RFQs, and sample data
 */

const { PrismaClient } = require('@prisma/client')
const { generateMockRFQs } = require('./generate-mock-rfqs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // 1. Seed Categories
    console.log('\n📁 Seeding categories...')
    await seedCategories()
    
    // 2. Generate and seed mock RFQs
    console.log('\n📝 Generating mock RFQs...')
    const mockRFQs = await generateMockRFQs()
    await seedMockRFQs(mockRFQs)
    
    // 3. Seed sample companies
    console.log('\n🏢 Seeding sample companies...')
    await seedSampleCompanies()
    
    // 4. Seed sample products
    console.log('\n📦 Seeding sample products...')
    await seedSampleProducts()
    
    // 5. Generate statistics
    console.log('\n📊 Generating statistics...')
    await updateCategoryStatistics()
    
    console.log('\n✅ Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function seedCategories() {
  const categoriesData = require('../src/data/categories.ts')
  const ALL_CATEGORIES = categoriesData.ALL_CATEGORIES
  
  for (const categoryData of ALL_CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.id },
      update: {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        supplierCount: parseInt(categoryData.supplierCount.replace(/[^\d]/g, '')),
        isTrending: categoryData.trending || false,
        isActive: true,
      },
      create: {
        id: categoryData.id,
        name: categoryData.name,
        slug: categoryData.id,
        description: categoryData.description,
        icon: categoryData.icon,
        supplierCount: parseInt(categoryData.supplierCount.replace(/[^\d]/g, '')),
        isTrending: categoryData.trending || false,
        isActive: true,
        sortOrder: ALL_CATEGORIES.indexOf(categoryData),
      }
    })
    
    // Create subcategories
    for (const subcategoryName of categoryData.subcategories) {
      const subcategorySlug = subcategoryName.toLowerCase().replace(/\s+/g, '-')
      
      await prisma.subcategory.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: subcategorySlug
          }
        },
        update: {
          name: subcategoryName,
          description: `${subcategoryName} under ${categoryData.name}`,
          isActive: true,
        },
        create: {
          name: subcategoryName,
          slug: subcategorySlug,
          description: `${subcategoryName} under ${categoryData.name}`,
          categoryId: category.id,
          isActive: true,
          sortOrder: categoryData.subcategories.indexOf(subcategoryName),
        }
      })
    }
    
    console.log(`  ✅ Seeded category: ${category.name}`)
  }
}

async function seedMockRFQs(mockRFQs) {
  console.log(`  📝 Seeding ${mockRFQs.length} mock RFQs...`)
  
  let successCount = 0
  let errorCount = 0
  
  for (const rfqData of mockRFQs) {
    try {
      // Find category and subcategory
      const category = await prisma.category.findUnique({
        where: { slug: rfqData.category.toLowerCase().replace(/\s+/g, '-') }
      })
      
      let subcategory = null
      if (category) {
        subcategory = await prisma.subcategory.findFirst({
          where: {
            categoryId: category.id,
            name: rfqData.subcategory
          }
        })
      }
      
      // Create RFQ
      const rfq = await prisma.rfq.create({
        data: {
          title: rfqData.title,
          description: rfqData.description,
          category: rfqData.category,
          subcategory: rfqData.subcategory,
          categoryId: category?.id,
          subcategoryId: subcategory?.id,
          quantity: rfqData.quantity,
          unit: rfqData.unit,
          specifications: rfqData.specifications,
          budget: rfqData.budget.min,
          currency: rfqData.budget.currency,
          deliveryTimeline: rfqData.deliveryTimeline,
          urgency: rfqData.urgency,
          paymentTerms: rfqData.paymentTerms,
          certifications: rfqData.certifications,
          status: 'OPEN',
          location: rfqData.location,
          companyName: rfqData.company,
          rfqType: rfqData.rfqType,
          voiceTranscript: rfqData.voiceTranscript,
          videoMetadata: rfqData.videoMetadata,
          confidenceScore: rfqData.confidenceScore,
          language: rfqData.language,
          createdAt: rfqData.createdAt,
        }
      })
      
      successCount++
      
      if (successCount % 100 === 0) {
        console.log(`    📊 Processed ${successCount} RFQs...`)
      }
      
    } catch (error) {
      errorCount++
      console.error(`    ❌ Error seeding RFQ ${rfqData.id}:`, error.message)
    }
  }
  
  console.log(`  ✅ Seeded ${successCount} RFQs successfully, ${errorCount} errors`)
}

async function seedSampleCompanies() {
  const sampleCompanies = [
    {
      name: 'Bharat Steel Industries',
      slug: 'bharat-steel-industries',
      description: 'Leading manufacturer of steel products and metal fabrication',
      category: 'Steel & Metals',
      subcategory: 'Steel Sheets',
      gstNumber: '27AABCU9603R1ZX',
      panNumber: 'AABCU9603R',
      email: 'info@bharatsteel.com',
      phone: '+91-9876543210',
      address: {
        street: 'Industrial Area, MIDC',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411019',
        country: 'India'
      },
      trustScore: 8.5,
      rating: 4.3,
      reviewCount: 156
    },
    {
      name: 'Delhi Textiles Hub',
      slug: 'delhi-textiles-hub',
      description: 'Premium textile manufacturer and exporter',
      category: 'Textiles & Apparel',
      subcategory: 'Cotton Fabrics',
      gstNumber: '07ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      email: 'contact@delhitextiles.com',
      phone: '+91-9876543211',
      address: {
        street: 'Textile Market, Karol Bagh',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110005',
        country: 'India'
      },
      trustScore: 9.2,
      rating: 4.7,
      reviewCount: 234
    },
    {
      name: 'Mumbai Electronics Corp',
      slug: 'mumbai-electronics-corp',
      description: 'Electronic components and consumer electronics distributor',
      category: 'Electronics & Components',
      subcategory: 'Semiconductors',
      gstNumber: '27FGHIJ5678K1L9',
      panNumber: 'FGHIJ5678K',
      email: 'sales@mumbaielectronics.com',
      phone: '+91-9876543212',
      address: {
        street: 'Electronics Market, Lamington Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400008',
        country: 'India'
      },
      trustScore: 7.8,
      rating: 4.1,
      reviewCount: 89
    }
  ]
  
  for (const companyData of sampleCompanies) {
    const category = await prisma.category.findFirst({
      where: { name: companyData.category }
    })
    
    const subcategory = category ? await prisma.subcategory.findFirst({
      where: {
        categoryId: category.id,
        name: companyData.subcategory
      }
    }) : null
    
    await prisma.company.create({
      data: {
        name: companyData.name,
        slug: companyData.slug,
        description: companyData.description,
        category: companyData.category,
        subcategory: companyData.subcategory,
        categoryId: category?.id,
        subcategoryId: subcategory?.id,
        gstNumber: companyData.gstNumber,
        panNumber: companyData.panNumber,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        trustScore: companyData.trustScore,
        rating: companyData.rating,
        reviewCount: companyData.reviewCount,
        isVerified: true,
        isActive: true,
        verifiedAt: new Date(),
      }
    })
    
    console.log(`  ✅ Seeded company: ${companyData.name}`)
  }
}

async function seedSampleProducts() {
  const sampleProducts = [
    {
      name: 'TMT Steel Bars - Fe 500 Grade',
      description: 'High-quality TMT steel bars for construction',
      category: 'Steel & Metals',
      subcategory: 'Steel Sheets',
      price: 45000,
      currency: 'INR',
      specifications: {
        grade: 'Fe 500',
        diameter: '12mm, 16mm, 20mm',
        length: '12 meters',
        standard: 'IS 1786:2008'
      },
      stock: 1000,
      minOrderQty: 1,
      maxOrderQty: 100
    },
    {
      name: 'Cotton Fabric - 100% Cotton',
      description: 'Premium cotton fabric for garment manufacturing',
      category: 'Textiles & Apparel',
      subcategory: 'Cotton Fabrics',
      price: 120,
      currency: 'INR',
      specifications: {
        material: '100% Cotton',
        width: '60 inches',
        weight: '150 GSM',
        color: 'White, various colors available'
      },
      stock: 5000,
      minOrderQty: 100,
      maxOrderQty: 10000
    },
    {
      name: 'Semiconductor Chips - IC Components',
      description: 'High-performance semiconductor chips for electronics',
      category: 'Electronics & Components',
      subcategory: 'Semiconductors',
      price: 25,
      currency: 'INR',
      specifications: {
        type: 'IC Components',
        package: 'DIP, SOP, QFP',
        voltage: '3.3V, 5V',
        temperature: '-40°C to +85°C'
      },
      stock: 10000,
      minOrderQty: 100,
      maxOrderQty: 50000
    }
  ]
  
  const companies = await prisma.company.findMany({
    take: 3
  })
  
  for (let i = 0; i < sampleProducts.length; i++) {
    const productData = sampleProducts[i]
    const company = companies[i]
    
    if (company) {
      const category = await prisma.category.findFirst({
        where: { name: productData.category }
      })
      
      const subcategory = category ? await prisma.subcategory.findFirst({
        where: {
          categoryId: category.id,
          name: productData.subcategory
        }
      }) : null
      
      await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          category: productData.category,
          subcategory: productData.subcategory,
          categoryId: category?.id,
          subcategoryId: subcategory?.id,
          price: productData.price,
          currency: productData.currency,
          specifications: productData.specifications,
          stock: productData.stock,
          minOrderQty: productData.minOrderQty,
          maxOrderQty: productData.maxOrderQty,
          companyId: company.id,
          isActive: true,
          isFeatured: true,
        }
      })
      
      console.log(`  ✅ Seeded product: ${productData.name}`)
    }
  }
}

async function updateCategoryStatistics() {
  console.log('  📊 Updating category statistics...')
  
  const categories = await prisma.category.findMany()
  
  for (const category of categories) {
    // Count RFQs
    const rfqCount = await prisma.rfq.count({
      where: { categoryId: category.id }
    })
    
    // Count products
    const productCount = await prisma.product.count({
      where: { categoryId: category.id }
    })
    
    // Count companies
    const companyCount = await prisma.company.count({
      where: { categoryId: category.id }
    })
    
    // Update category
    await prisma.category.update({
      where: { id: category.id },
      data: {
        rfqCount,
        productCount,
        supplierCount: companyCount
      }
    })
    
    console.log(`    ✅ Updated stats for ${category.name}: ${rfqCount} RFQs, ${productCount} products, ${companyCount} companies`)
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n🎉 Database seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedDatabase }
