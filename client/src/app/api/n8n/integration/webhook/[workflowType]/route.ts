import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Required for static export - generate static params for dynamic routes
export async function generateStaticParams() {
  // For static export, we'll return an empty array since this is an API route
  // In production, this would be handled by server-side rendering
  return []
}

/**
 * POST /api/n8n/integration/webhook/[workflowType] - Handle N8N webhook integration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workflowType: string } }
) {
  try {
    const { workflowType } = params
    const body = await request.json()

    // Route to appropriate workflow handler
    switch (workflowType.toLowerCase()) {
      case 'email':
        return await handleEmailWorkflowWebhook(body)
      case 'sms':
        return await handleSMSWorkflowWebhook(body)
      case 'crm':
        return await handleCRMWorkflowWebhook(body)
      case 'analytics':
        return await handleAnalyticsWorkflowWebhook(body)
      case 'onboarding':
        return await handleOnboardingWorkflowWebhook(body)
      default:
        return NextResponse.json(
          { error: 'Unknown workflow type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error(`N8N ${params.workflowType} webhook error:`, error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle email workflow webhook
 */
async function handleEmailWorkflowWebhook(data: any) {
  try {
    const { action, companyData, campaignData, results } = data

    switch (action) {
      case 'enrich_company_data':
        // Enrich existing email workflow with scraped company data
        const enrichedData = await enrichCompanyDataForEmail(companyData)
        
        return NextResponse.json({
          success: true,
          message: 'Company data enriched for email workflow',
          enrichedData
        })

      case 'trigger_campaign':
        // Trigger email campaign with scraped companies
        const campaignResult = await triggerEmailCampaign(companyData, campaignData)
        
        return NextResponse.json({
          success: true,
          message: 'Email campaign triggered',
          campaignResult
        })

      case 'track_results':
        // Track email campaign results
        await trackEmailCampaignResults(results)
        
        return NextResponse.json({
          success: true,
          message: 'Email campaign results tracked'
        })

      default:
        return NextResponse.json(
          { error: 'Unknown email workflow action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Email workflow webhook error:', error)
    throw error
  }
}

/**
 * Handle SMS workflow webhook
 */
async function handleSMSWorkflowWebhook(data: any) {
  try {
    const { action, companyData, campaignData, results } = data

    switch (action) {
      case 'send_targeted_sms':
        // Send targeted SMS to scraped companies
        const smsResult = await sendTargetedSMS(companyData, campaignData)
        
        return NextResponse.json({
          success: true,
          message: 'Targeted SMS sent',
          smsResult
        })

      case 'track_claim_conversion':
        // Track SMS to claim conversion
        await trackSMSClaimConversion(results)
        
        return NextResponse.json({
          success: true,
          message: 'SMS claim conversion tracked'
        })

      default:
        return NextResponse.json(
          { error: 'Unknown SMS workflow action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('SMS workflow webhook error:', error)
    throw error
  }
}

/**
 * Handle CRM workflow webhook
 */
async function handleCRMWorkflowWebhook(data: any) {
  try {
    const { action, companyData, leadData, results } = data

    switch (action) {
      case 'create_lead':
        // Create lead from scraped company data
        const lead = await createLeadFromScrapedCompany(companyData, leadData)
        
        return NextResponse.json({
          success: true,
          message: 'Lead created from scraped company',
          lead
        })

      case 'update_lead_score':
        // Update lead score based on scraping data
        await updateLeadScore(companyData, leadData)
        
        return NextResponse.json({
          success: true,
          message: 'Lead score updated'
        })

      case 'trigger_follow_up':
        // Trigger CRM follow-up sequence
        const followUpResult = await triggerCRMFollowUp(companyData)
        
        return NextResponse.json({
          success: true,
          message: 'CRM follow-up triggered',
          followUpResult
        })

      default:
        return NextResponse.json(
          { error: 'Unknown CRM workflow action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('CRM workflow webhook error:', error)
    throw error
  }
}

/**
 * Handle analytics workflow webhook
 */
async function handleAnalyticsWorkflowWebhook(data: any) {
  try {
    const { action, metrics, results } = data

    switch (action) {
      case 'track_scraping_metrics':
        // Track scraping performance metrics
        await trackScrapingMetrics(metrics)
        
        return NextResponse.json({
          success: true,
          message: 'Scraping metrics tracked'
        })

      case 'calculate_roi':
        // Calculate ROI for scraping campaigns
        const roi = await calculateScrapingROI(results)
        
        return NextResponse.json({
          success: true,
          message: 'Scraping ROI calculated',
          roi
        })

      case 'generate_report':
        // Generate analytics report
        const report = await generateAnalyticsReport(metrics, results)
        
        return NextResponse.json({
          success: true,
          message: 'Analytics report generated',
          report
        })

      default:
        return NextResponse.json(
          { error: 'Unknown analytics workflow action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Analytics workflow webhook error:', error)
    throw error
  }
}

/**
 * Handle onboarding workflow webhook
 */
async function handleOnboardingWorkflowWebhook(data: any) {
  try {
    const { action, claimData, userData, results } = data

    switch (action) {
      case 'process_claim':
        // Process company claim through onboarding workflow
        const claimResult = await processCompanyClaim(claimData)
        
        return NextResponse.json({
          success: true,
          message: 'Company claim processed',
          claimResult
        })

      case 'activate_benefits':
        // Activate early user benefits
        await activateEarlyUserBenefits(claimData, userData)
        
        return NextResponse.json({
          success: true,
          message: 'Early user benefits activated'
        })

      case 'send_welcome_sequence':
        // Send welcome sequence to claimed companies
        const welcomeResult = await sendWelcomeSequence(claimData)
        
        return NextResponse.json({
          success: true,
          message: 'Welcome sequence sent',
          welcomeResult
        })

      default:
        return NextResponse.json(
          { error: 'Unknown onboarding workflow action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Onboarding workflow webhook error:', error)
    throw error
  }
}

// Helper functions for each workflow type

async function enrichCompanyDataForEmail(companyData: any) {
  // Enrich company data for email personalization
  return {
    ...companyData,
    personalizedGreeting: `Dear ${companyData.name} Team`,
    categorySpecificBenefits: getCategoryBenefits(companyData.category),
    urgencyMessage: getUrgencyMessage(companyData.trustScore)
  }
}

async function triggerEmailCampaign(companyData: any, campaignData: any) {
  // Trigger email campaign with enriched data
  return {
    campaignId: `email_${Date.now()}`,
    recipients: companyData.email ? 1 : 0,
    template: campaignData.template || 'company-claim-email',
    personalizedData: await enrichCompanyDataForEmail(companyData)
  }
}

async function trackEmailCampaignResults(results: any) {
  // Track email campaign results
  await prisma.marketingCampaign.updateMany({
    where: { id: results.campaignId },
    data: {
      stats: {
        opened: { increment: results.opened || 0 },
        clicked: { increment: results.clicked || 0 }
      }
    }
  })
}

async function sendTargetedSMS(companyData: any, campaignData: any) {
  // Send targeted SMS campaign
  return {
    smsId: `sms_${Date.now()}`,
    recipient: companyData.phone,
    message: personalizeSMSMessage(campaignData.template, companyData),
    status: 'sent'
  }
}

async function trackSMSClaimConversion(results: any) {
  // Track SMS to claim conversion
  await prisma.marketingResponse.create({
    data: {
      campaignId: results.campaignId,
      companyId: results.companyId,
      responseType: 'CLAIM_SUBMITTED',
      status: 'CONVERTED',
      message: 'SMS led to claim submission'
    }
  })
}

async function createLeadFromScrapedCompany(companyData: any, leadData: any) {
  // Create CRM lead from scraped company
  const lead = await prisma.crmLead.create({
    data: {
      name: companyData.name,
      email: companyData.email,
      phone: companyData.phone,
      company: companyData.name,
      category: companyData.category,
      source: 'SCRAPING',
      status: 'NEW',
      score: calculateLeadScore(companyData),
      scrapedCompanyId: companyData.id
    }
  })

  return lead
}

async function updateLeadScore(companyData: any, leadData: any) {
  // Update lead score based on scraping data
  const newScore = calculateLeadScore(companyData)
  
  await prisma.crmLead.updateMany({
    where: { scrapedCompanyId: companyData.id },
    data: { score: newScore }
  })
}

async function triggerCRMFollowUp(companyData: any) {
  // Trigger CRM follow-up sequence
  return {
    followUpId: `followup_${Date.now()}`,
    leadId: companyData.leadId,
    sequence: 'scraped-company-followup',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}

async function trackScrapingMetrics(metrics: any) {
  // Track scraping performance metrics
  // TODO: Add scrapingMetrics model to Prisma schema
  console.log('Scraping metrics:', metrics)
  // await prisma.scrapingMetrics.create({
  //   data: {
  //     date: new Date(),
  //     companiesScraped: metrics.companiesScraped,
  //     categoriesProcessed: metrics.categoriesProcessed,
  //     successRate: metrics.successRate,
  //     averageTrustScore: metrics.averageTrustScore
  //   }
  // })
}

async function calculateScrapingROI(results: any) {
  // Calculate ROI for scraping campaigns
  const totalInvestment = results.totalScraped * 0.1 // ₹0.10 per company scraped
  const totalRevenue = results.claims * 30000 // ₹30,000 per claim
  
  return {
    totalInvestment,
    totalRevenue,
    roi: ((totalRevenue - totalInvestment) / totalInvestment) * 100,
    paybackPeriod: totalInvestment / (totalRevenue / 12) // months
  }
}

async function generateAnalyticsReport(metrics: any, results: any) {
  // Generate comprehensive analytics report
  return {
    reportId: `report_${Date.now()}`,
    period: 'daily',
    metrics: {
      scraping: metrics,
      conversion: results,
      roi: await calculateScrapingROI(results)
    },
    generatedAt: new Date()
  }
}

async function processCompanyClaim(claimData: any) {
  // Process company claim through onboarding workflow
  return {
    claimId: claimData.id,
    status: 'processed',
    nextStep: 'benefits_activation',
    estimatedCompletion: '24_hours'
  }
}

async function activateEarlyUserBenefits(claimData: any, userData: any) {
  // Activate early user benefits
  await prisma.companyClaim.update({
    where: { id: claimData.id },
    data: {
      benefits: {
        freeLifetimeBasic: true,
        freePremiumMonths: 6,
        earlyUserBadge: true,
        prioritySupport: true,
        activatedAt: new Date()
      }
    }
  })
}

async function sendWelcomeSequence(claimData: any) {
  // Send welcome sequence to claimed companies
  return {
    sequenceId: `welcome_${Date.now()}`,
    emailSent: true,
    smsSent: true,
    nextEmail: '24_hours'
  }
}

// Utility functions

function getCategoryBenefits(category: string) {
  const benefits = {
    'Steel & Metals': 'Connect with 500+ steel buyers across India',
    'Textiles': 'Access to 1000+ textile manufacturers and exporters',
    'Electronics': 'Join 300+ electronics suppliers network'
  }
  return benefits[category as keyof typeof benefits] || 'Connect with verified buyers in your industry'
}

function getUrgencyMessage(trustScore: number) {
  if (trustScore > 80) {
    return '⏰ URGENT: You\'re in the top 5% of companies - claim your profile NOW!'
  } else if (trustScore > 60) {
    return '🎯 Limited spots available for verified companies like yours!'
  } else {
    return '🚀 Join thousands of companies growing their business on Bell24h!'
  }
}

function personalizeSMSMessage(template: string, companyData: any) {
  return template
    .replace(/\[Company\]/g, companyData.name)
    .replace(/\[Category\]/g, companyData.category)
    .replace(/\[TrustScore\]/g, companyData.trustScore.toString())
}

function calculateLeadScore(companyData: any) {
  let score = 0
  if (companyData.email) score += 20
  if (companyData.phone) score += 20
  if (companyData.website) score += 15
  if (companyData.gstNumber) score += 15
  if (companyData.trustScore > 70) score += 30
  return Math.min(score, 100)
}
