#!/usr/bin/env node

/**
 * Categories Database Migration Script
 * Migrates from string-based categories to proper Category/Subcategory models
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Import categories data
const categoriesData = require('../src/data/categories.ts')
const ALL_CATEGORIES = categoriesData.ALL_CATEGORIES

async function migrateCategories() {
  console.log('🔄 Starting categories migration...')
  
  try {
    // Create categories
    console.log('📁 Creating categories...')
    const createdCategories = []
    
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
      
      createdCategories.push(category)
      console.log(`  ✅ Created category: ${category.name}`)
    }
    
    console.log(`\n📂 Creating subcategories...`)
    let totalSubcategories = 0
    
    for (const categoryData of ALL_CATEGORIES) {
      const category = createdCategories.find(c => c.slug === categoryData.id)
      
      for (const subcategoryName of categoryData.subcategories) {
        const subcategorySlug = subcategoryName.toLowerCase().replace(/\s+/g, '-')
        
        const subcategory = await prisma.subcategory.upsert({
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
        
        totalSubcategories++
        console.log(`    ✅ Created subcategory: ${subcategoryName}`)
      }
    }
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`  Categories created: ${createdCategories.length}`)
    console.log(`  Subcategories created: ${totalSubcategories}`)
    
    // Update existing records to reference new categories
    console.log(`\n🔄 Updating existing records...`)
    
    // Update companies
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { category: { not: null } },
          { subcategory: { not: null } }
        ]
      }
    })
    
    console.log(`  Found ${companies.length} companies to update`)
    
    for (const company of companies) {
      if (company.category) {
        const category = createdCategories.find(c => c.name === company.category)
        if (category) {
          await prisma.company.update({
            where: { id: company.id },
            data: { categoryId: category.id }
          })
        }
      }
      
      if (company.subcategory) {
        const category = createdCategories.find(c => c.name === company.category)
        if (category) {
          const subcategory = await prisma.subcategory.findFirst({
            where: {
              categoryId: category.id,
              name: company.subcategory
            }
          })
          
          if (subcategory) {
            await prisma.company.update({
              where: { id: company.id },
              data: { subcategoryId: subcategory.id }
            })
          }
        }
      }
    }
    
    // Update products
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { category: { not: null } },
          { subcategory: { not: null } }
        ]
      }
    })
    
    console.log(`  Found ${products.length} products to update`)
    
    for (const product of products) {
      if (product.category) {
        const category = createdCategories.find(c => c.name === product.category)
        if (category) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: category.id }
          })
        }
      }
      
      if (product.subcategory) {
        const category = createdCategories.find(c => c.name === product.category)
        if (category) {
          const subcategory = await prisma.subcategory.findFirst({
            where: {
              categoryId: category.id,
              name: product.subcategory
            }
          })
          
          if (subcategory) {
            await prisma.product.update({
              where: { id: product.id },
              data: { subcategoryId: subcategory.id }
            })
          }
        }
      }
    }
    
    // Update RFQs
    const rfqs = await prisma.rfq.findMany({
      where: {
        OR: [
          { category: { not: null } },
          { subcategory: { not: null } }
        ]
      }
    })
    
    console.log(`  Found ${rfqs.length} RFQs to update`)
    
    for (const rfq of rfqs) {
      if (rfq.category) {
        const category = createdCategories.find(c => c.name === rfq.category)
        if (category) {
          await prisma.rfq.update({
            where: { id: rfq.id },
            data: { categoryId: category.id }
          })
        }
      }
      
      if (rfq.subcategory) {
        const category = createdCategories.find(c => c.name === rfq.category)
        if (category) {
          const subcategory = await prisma.subcategory.findFirst({
            where: {
              categoryId: category.id,
              name: rfq.subcategory
            }
          })
          
          if (subcategory) {
            await prisma.rfq.update({
              where: { id: rfq.id },
              data: { subcategoryId: subcategory.id }
            })
          }
        }
      }
    }
    
    console.log(`\n✅ Categories migration completed successfully!`)
    
    // Generate summary report
    const summary = {
      categories: createdCategories.length,
      subcategories: totalSubcategories,
      companiesUpdated: companies.length,
      productsUpdated: products.length,
      rfqsUpdated: rfqs.length,
      timestamp: new Date().toISOString()
    }
    
    const reportPath = path.join(__dirname, '../data/categories-migration-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2))
    console.log(`📄 Migration report saved to: ${reportPath}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCategories()
    .then(() => {
      console.log('\n🎉 Categories migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateCategories }
