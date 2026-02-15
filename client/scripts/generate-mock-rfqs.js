#!/usr/bin/env node

/**
 * Comprehensive Mock RFQ Generator
 * Generates realistic RFQs for all 50 categories with Indian business context
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Indian company name generators
const companyNames = {
  prefixes: ['Bharat', 'India', 'Maharashtra', 'Gujarat', 'Tamil', 'Karnataka', 'Punjab', 'Rajasthan', 'Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Kolkata'],
  suffixes: ['Industries', 'Enterprises', 'Corporation', 'Limited', 'Pvt Ltd', 'Trading Co', 'Manufacturing', 'Solutions', 'Technologies', 'Services', 'Group', 'International'],
  business: ['Steel', 'Textiles', 'Electronics', 'Chemicals', 'Machinery', 'Automotive', 'Construction', 'Food', 'Pharma', 'Agro', 'Energy', 'IT', 'Logistics', 'Healthcare', 'Education']
}

// Indian cities for location
const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi'
]

// Payment terms commonly used in India
const paymentTerms = [
  '30% advance, 70% on delivery',
  'LC terms acceptable',
  'Against delivery',
  '45-day credit terms',
  '15 days payment terms',
  'COD (Cash on Delivery)',
  'Bank guarantee required',
  'Escrow payment preferred'
]

// Quality specifications by category
const qualitySpecs = {
  'steel-metals': ['IS 2062 Grade A', 'Fe 500 grade', 'Corrosion resistant', 'Welding quality', 'Dimensional accuracy'],
  'textiles': ['Export quality', 'Color fastness', 'Shrinkage <3%', 'GSM 150-200', 'OEKO-TEX certified'],
  'electronics': ['CE certified', 'RoHS compliant', 'IP65 rating', '1 year warranty', 'ISO 9001 certified'],
  'machinery': ['Heavy duty', 'Stainless steel construction', 'Low maintenance', 'Energy efficient', 'CE marked'],
  'chemicals': ['Pharma grade', 'Analytical grade', '99.9% purity', 'Hazardous material certified', 'MSDS provided'],
  'agriculture': ['Organic certified', 'Non-GMO', 'Germination rate >95%', 'Disease resistant', 'FSSAI approved'],
  'construction': ['IS 456 compliant', 'Weather resistant', 'Fire retardant', 'Load bearing capacity', 'BIS certified'],
  'automotive': ['OEM quality', 'DOT approved', 'Long lasting', 'Fuel efficient', 'Emission compliant'],
  'food': ['FSSAI certified', 'HACCP compliant', 'Halal certified', 'Organic', 'Shelf life 12 months'],
  'medical': ['FDA approved', 'CE marked', 'Sterile packaging', 'ISO 13485', 'Medical grade']
}

// Generate Indian company name
function generateIndianCompany() {
  const prefix = companyNames.prefixes[Math.floor(Math.random() * companyNames.prefixes.length)]
  const business = companyNames.business[Math.floor(Math.random() * companyNames.business.length)]
  const suffix = companyNames.suffixes[Math.floor(Math.random() * companyNames.suffixes.length)]
  
  return `${prefix} ${business} ${suffix}`
}

// Generate product specifications based on category
function generateSpecifications(category, subcategory) {
  const baseSpecs = qualitySpecs[category.toLowerCase().replace(/\s+/g, '-')] || qualitySpecs['machinery']
  const specs = []
  
  // Add 2-4 random specifications
  const numSpecs = Math.floor(Math.random() * 3) + 2
  for (let i = 0; i < numSpecs; i++) {
    specs.push(baseSpecs[Math.floor(Math.random() * baseSpecs.length)])
  }
  
  return specs
}

// Generate quantity based on category type
function generateQuantity(category) {
  const quantityRanges = {
    'steel-metals': { min: 100, max: 5000, unit: 'MT' },
    'textiles': { min: 1000, max: 50000, unit: 'meters' },
    'electronics': { min: 50, max: 5000, unit: 'units' },
    'machinery': { min: 1, max: 100, unit: 'units' },
    'chemicals': { min: 500, max: 10000, unit: 'kg' },
    'agriculture': { min: 1000, max: 50000, unit: 'kg' },
    'construction': { min: 100, max: 10000, unit: 'sq ft' },
    'automotive': { min: 100, max: 10000, unit: 'units' },
    'food': { min: 500, max: 5000, unit: 'kg' },
    'medical': { min: 10, max: 1000, unit: 'units' }
  }
  
  const range = quantityRanges[category.toLowerCase().replace(/\s+/g, '-')] || quantityRanges['machinery']
  const quantity = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
  
  return { quantity, unit: range.unit }
}

// Generate budget based on category and quantity
function generateBudget(category, quantity) {
  const basePrices = {
    'steel-metals': 50000,
    'textiles': 200,
    'electronics': 5000,
    'machinery': 100000,
    'chemicals': 1000,
    'agriculture': 500,
    'construction': 1000,
    'automotive': 10000,
    'food': 200,
    'medical': 5000
  }
  
  const basePrice = basePrices[category.toLowerCase().replace(/\s+/g, '-')] || basePrices['machinery']
  const totalValue = basePrice * quantity
  const variance = 0.2 // 20% variance
  
  const minBudget = Math.floor(totalValue * (1 - variance))
  const maxBudget = Math.floor(totalValue * (1 + variance))
  
  return { min: minBudget, max: maxBudget }
}

// Generate delivery timeline
function generateDeliveryTimeline() {
  const timelines = [
    { days: 7, urgency: 'URGENT' },
    { days: 15, urgency: 'HIGH' },
    { days: 30, urgency: 'MEDIUM' },
    { days: 60, urgency: 'LOW' }
  ]
  
  return timelines[Math.floor(Math.random() * timelines.length)]
}

// Generate certifications based on category
function generateCertifications(category) {
  const certs = {
    'steel-metals': ['IS 2062', 'BIS certified', 'IIT approved'],
    'textiles': ['OEKO-TEX', 'GOTS certified', 'Export quality'],
    'electronics': ['CE certified', 'RoHS compliant', 'ISO 9001'],
    'machinery': ['CE marked', 'ISO 9001', 'Heavy duty certified'],
    'chemicals': ['Pharma grade', 'Analytical grade', 'MSDS provided'],
    'agriculture': ['Organic certified', 'FSSAI approved', 'Non-GMO'],
    'construction': ['IS 456', 'BIS certified', 'Fire retardant'],
    'automotive': ['DOT approved', 'OEM quality', 'Emission compliant'],
    'food': ['FSSAI certified', 'HACCP', 'Halal certified'],
    'medical': ['FDA approved', 'CE marked', 'ISO 13485']
  }
  
  const categoryCerts = certs[category.toLowerCase().replace(/\s+/g, '-')] || certs['machinery']
  return categoryCerts[Math.floor(Math.random() * categoryCerts.length)]
}

// Generate voice RFQ transcript
function generateVoiceTranscript(company, product, quantity, budget, location) {
  const transcripts = [
    `Hello, this is ${company.split(' ')[0]} from ${location}. We need ${quantity} ${product} for our manufacturing unit. Budget around ${budget} lakhs. Need delivery within 20 days.`,
    `Namaste, I'm calling from ${company}. We require ${quantity} ${product} for export quality. Budget is ${budget} to ${budget + 10} lakhs. Location is ${location}.`,
    `Hi, this is ${company.split(' ')[0]} Industries. We need ${quantity} ${product} urgently. Budget around ${budget} lakhs. Can you deliver to ${location}?`,
    `Hello, I'm from ${company} in ${location}. We want to source ${quantity} ${product}. Budget is ${budget} lakhs. Quality should be export grade.`,
    `Namaste, this is ${company.split(' ')[0]} from ${location}. We need ${quantity} ${product} for our project. Budget ${budget} lakhs. Delivery required in 15 days.`
  ]
  
  return transcripts[Math.floor(Math.random() * transcripts.length)]
}

// Generate video RFQ metadata
function generateVideoMetadata() {
  const durations = ['1:30', '2:15', '3:00', '2:45', '1:45']
  const languages = ['Hindi', 'English', 'Hindi-English Mix', 'Tamil', 'Gujarati']
  
  return {
    duration: durations[Math.floor(Math.random() * durations.length)],
    language: languages[Math.floor(Math.random() * languages.length)],
    subtitles: 'Auto-generated',
    quality: 'HD 1080p'
  }
}

// Main RFQ generation function
async function generateMockRFQs() {
  console.log('🚀 Starting comprehensive mock RFQ generation...')
  
  try {
    // Get all categories from the data file
    const categoriesData = require('../src/data/categories.ts')
    const categories = categoriesData.ALL_CATEGORIES
    
    console.log(`📊 Found ${categories.length} categories to process`)
    
    const mockRFQs = []
    let totalGenerated = 0
    
    for (const category of categories) {
      console.log(`\n📁 Processing category: ${category.name}`)
      
      for (const subcategory of category.subcategories) {
        console.log(`  📂 Subcategory: ${subcategory}`)
        
        // Generate 3 RFQs per subcategory
        for (let i = 1; i <= 3; i++) {
          const company = generateIndianCompany()
          const location = indianCities[Math.floor(Math.random() * indianCities.length)]
          const { quantity, unit } = generateQuantity(category.name)
          const budget = generateBudget(category.name, quantity)
          const timeline = generateDeliveryTimeline()
          const specifications = generateSpecifications(category.name, subcategory)
          const certification = generateCertifications(category.name)
          const paymentTerm = paymentTerms[Math.floor(Math.random() * paymentTerms.length)]
          
          // Generate different RFQ types
          const rfqTypes = ['text', 'voice', 'video']
          const rfqType = rfqTypes[Math.floor(Math.random() * rfqTypes.length)]
          
          let voiceTranscript = null
          let videoMetadata = null
          
          if (rfqType === 'voice') {
            voiceTranscript = generateVoiceTranscript(company, subcategory, quantity, Math.floor(budget.min / 100000), location)
          } else if (rfqType === 'video') {
            videoMetadata = generateVideoMetadata()
          }
          
          const mockRFQ = {
            id: `RFQ-${category.id}-${subcategory.replace(/\s+/g, '-').toLowerCase()}-${i}`,
            title: `${subcategory} - ${quantity} ${unit}`,
            description: `We are looking for high-quality ${subcategory} for our manufacturing requirements. ${specifications.join(', ')}. ${certification} required.`,
            category: category.name,
            subcategory: subcategory,
            company: company,
            location: location,
            quantity: quantity,
            unit: unit,
            specifications: specifications,
            budget: {
              min: budget.min,
              max: budget.max,
              currency: 'INR'
            },
            deliveryTimeline: timeline.days,
            urgency: timeline.urgency,
            paymentTerms: paymentTerm,
            certifications: [certification],
            rfqType: rfqType,
            voiceTranscript: voiceTranscript,
            videoMetadata: videoMetadata,
            status: 'OPEN',
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
            confidenceScore: 0.7 + Math.random() * 0.3, // 0.7 to 1.0
            language: rfqType === 'voice' ? 'Hindi-English Mix' : 'English'
          }
          
          mockRFQs.push(mockRFQ)
          totalGenerated++
        }
      }
    }
    
    console.log(`\n✅ Generated ${totalGenerated} mock RFQs`)
    
    // Save to JSON file
    const outputPath = path.join(__dirname, '../data/mock-rfqs.json')
    fs.writeFileSync(outputPath, JSON.stringify(mockRFQs, null, 2))
    console.log(`💾 Saved mock RFQs to: ${outputPath}`)
    
    // Generate statistics
    const stats = {
      totalRFQs: totalGenerated,
      byCategory: {},
      byType: { text: 0, voice: 0, video: 0 },
      byUrgency: { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 },
      byLocation: {},
      totalBudget: mockRFQs.reduce((sum, rfq) => sum + rfq.budget.min, 0)
    }
    
    mockRFQs.forEach(rfq => {
      // By category
      stats.byCategory[rfq.category] = (stats.byCategory[rfq.category] || 0) + 1
      
      // By type
      stats.byType[rfq.rfqType]++
      
      // By urgency
      stats.byUrgency[rfq.urgency]++
      
      // By location
      stats.byLocation[rfq.location] = (stats.byLocation[rfq.location] || 0) + 1
    })
    
    console.log('\n📊 Generation Statistics:')
    console.log(`Total RFQs: ${stats.totalRFQs}`)
    console.log(`Total Budget Value: ₹${(stats.totalBudget / 100000).toFixed(2)} Cr`)
    console.log(`By Type:`, stats.byType)
    console.log(`By Urgency:`, stats.byUrgency)
    console.log(`Top 5 Categories:`, Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5))
    console.log(`Top 5 Locations:`, Object.entries(stats.byLocation).sort((a, b) => b[1] - a[1]).slice(0, 5))
    
    // Save statistics
    const statsPath = path.join(__dirname, '../data/mock-rfqs-stats.json')
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2))
    console.log(`📈 Saved statistics to: ${statsPath}`)
    
    return mockRFQs
    
  } catch (error) {
    console.error('❌ Error generating mock RFQs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run generation if called directly
if (require.main === module) {
  generateMockRFQs()
    .then(() => {
      console.log('\n🎉 Mock RFQ generation completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Generation failed:', error)
      process.exit(1)
    })
}

module.exports = { generateMockRFQs }
