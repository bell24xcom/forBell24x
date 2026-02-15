// 🔍 BELL24H CATEGORY STRUCTURE AUDIT & ASSESSMENT FRAMEWORK
// Complete audit methodology for 51 categories with 7-8 subcategories each

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const axios = require('axios')

// Configuration
const SITE_URL = 'https://bell24h-v1.vercel.app'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function auditCategoryStructure() {
  console.log('🔍 BELL24H CATEGORY AUDIT STARTING...\n')
  
  const auditResults = {
    totalCategories: 0,
    totalSubcategories: 0,
    workingPages: 0,
    brokenPages: 0,
    missingPages: 0,
    databaseIssues: 0,
    navigationIssues: 0,
    errors: []
  }

  try {
    // Step 1: Audit Database Categories
    console.log('📊 STEP 1: DATABASE CATEGORY AUDIT')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
    
    if (catError) {
      console.error('❌ Database Error:', catError)
      auditResults.databaseIssues++
      return auditResults
    }

    auditResults.totalCategories = categories?.length || 0
    console.log(`✅ Found ${auditResults.totalCategories} categories in database`)

    // Step 2: Audit Subcategories
    console.log('\n📊 STEP 2: SUBCATEGORY AUDIT')
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('*')
    
    if (subError) {
      console.error('❌ Subcategory Error:', subError)
      auditResults.databaseIssues++
    } else {
      auditResults.totalSubcategories = subcategories?.length || 0
      console.log(`✅ Found ${auditResults.totalSubcategories} subcategories in database`)
    }

    // Step 3: Test Category Page URLs
    console.log('\n🌐 STEP 3: CATEGORY PAGE URL TESTING')
    
    for (const category of categories || []) {
      const categoryUrl = `${SITE_URL}/categories/${category.slug}`
      
      try {
        const response = await axios.get(categoryUrl, { timeout: 10000 })
        
        if (response.status === 200) {
          auditResults.workingPages++
          console.log(`✅ ${category.name}: ${categoryUrl}`)
        } else {
          auditResults.brokenPages++
          console.log(`❌ ${category.name}: ${categoryUrl} (Status: ${response.status})`)
          auditResults.errors.push({
            type: 'HTTP_ERROR',
            category: category.name,
            url: categoryUrl,
            status: response.status
          })
        }
      } catch (error) {
        auditResults.brokenPages++
        console.log(`❌ ${category.name}: ${categoryUrl} (Error: ${error.message})`)
        auditResults.errors.push({
          type: 'REQUEST_FAILED',
          category: category.name,
          url: categoryUrl,
          error: error.message
        })
      }

      // Test subcategories for this category
      const categorySubcategories = subcategories?.filter(sub => sub.category_id === category.id) || []
      
      for (const subcategory of categorySubcategories) {
        const subUrl = `${SITE_URL}/categories/${category.slug}/${subcategory.slug}`
        
        try {
          const response = await axios.get(subUrl, { timeout: 10000 })
          
          if (response.status === 200) {
            auditResults.workingPages++
            console.log(`  ✅ ${subcategory.name}: ${subUrl}`)
          } else {
            auditResults.brokenPages++
            console.log(`  ❌ ${subcategory.name}: ${subUrl} (Status: ${response.status})`)
            auditResults.errors.push({
              type: 'SUBCATEGORY_HTTP_ERROR',
              category: category.name,
              subcategory: subcategory.name,
              url: subUrl,
              status: response.status
            })
          }
        } catch (error) {
          auditResults.brokenPages++
          console.log(`  ❌ ${subcategory.name}: ${subUrl} (Error: ${error.message})`)
          auditResults.errors.push({
            type: 'SUBCATEGORY_REQUEST_FAILED',
            category: category.name,
            subcategory: subcategory.name,
            url: subUrl,
            error: error.message
          })
        }
      }
    }

    // Step 4: Generate Audit Report
    console.log('\n📋 AUDIT REPORT GENERATION')
    generateAuditReport(auditResults)
    
    return auditResults

  } catch (error) {
    console.error('❌ Audit Failed:', error)
    auditResults.errors.push({
      type: 'AUDIT_SYSTEM_ERROR',
      error: error.message
    })
    return auditResults
  }
}

function generateAuditReport(results) {
  const report = `
# BELL24H CATEGORY AUDIT REPORT
Generated: ${new Date().toISOString()}

## SUMMARY
- Total Categories: ${results.totalCategories}
- Total Subcategories: ${results.totalSubcategories}
- Working Pages: ${results.workingPages}
- Broken Pages: ${results.brokenPages}
- Database Issues: ${results.databaseIssues}

## SUCCESS RATE
- Page Success Rate: ${((results.workingPages / (results.workingPages + results.brokenPages)) * 100).toFixed(2)}%
- Critical Issues: ${results.errors.length}

## CRITICAL ERRORS
${results.errors.map(error => `
- Type: ${error.type}
- Category: ${error.category || 'N/A'}
- URL: ${error.url || 'N/A'}
- Error: ${error.error || error.status || 'Unknown'}
`).join('')}

## RECOMMENDATIONS
${results.brokenPages > 0 ? '❌ CRITICAL: Fix broken category pages immediately' : '✅ All category pages working'}
${results.databaseIssues > 0 ? '❌ CRITICAL: Database structure issues found' : '✅ Database structure intact'}
${results.errors.length > 10 ? '❌ HIGH PRIORITY: Multiple system errors detected' : '✅ System stability good'}
`

  fs.writeFileSync('category-audit-report.md', report)
  console.log('📄 Audit report saved to: category-audit-report.md')
}

// Run the audit
auditCategoryStructure() 