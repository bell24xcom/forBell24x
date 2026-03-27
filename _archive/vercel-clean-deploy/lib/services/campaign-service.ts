import { prisma } from '@/lib/db'
import { Agent, Campaign, CampaignStatus } from '@prisma/client'

export interface CreateCampaignData {
  name: string
  description?: string
  supplierId?: string
  productName?: string
  targetMarket?: string
  channels: string[]
  budget?: number
  startDate?: Date
  endDate?: Date
  agentId?: string
}

export interface UpdateCampaignData {
  name?: string
  description?: string
  supplierId?: string
  productName?: string
  targetMarket?: string
  channels?: string[]
  budget?: number
  spent?: number
  status?: CampaignStatus
  startDate?: Date
  endDate?: Date
  content?: any
  metrics?: any
  aiInsights?: any
}

export interface CampaignWithAgent extends Campaign {
  agent?: Agent | null
}

export class CampaignService {
  /**
   * Create a new campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<Campaign | null> {
    try {
      const campaign = await prisma.campaign.create({
        data: {
          name: data.name,
          description: data.description,
          supplierId: data.supplierId,
          productName: data.productName,
          targetMarket: data.targetMarket,
          channels: data.channels,
          budget: data.budget,
          startDate: data.startDate,
          endDate: data.endDate,
          agentId: data.agentId,
          status: CampaignStatus.DRAFT
        }
      })

      return campaign
    } catch (error) {
      console.error('Error creating campaign:', error)
      return null
    }
  }

  /**
   * Get campaign by ID
   */
  static async getCampaignById(id: string): Promise<CampaignWithAgent | null> {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          agent: true
        }
      })

      return campaign
    } catch (error) {
      console.error('Error getting campaign:', error)
      return null
    }
  }

  /**
   * Update campaign
   */
  static async updateCampaign(id: string, data: UpdateCampaignData): Promise<Campaign | null> {
    try {
      const campaign = await prisma.campaign.update({
        where: { id },
        data
      })

      return campaign
    } catch (error) {
      console.error('Error updating campaign:', error)
      return null
    }
  }

  /**
   * Delete campaign
   */
  static async deleteCampaign(id: string): Promise<boolean> {
    try {
      await prisma.campaign.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Error deleting campaign:', error)
      return false
    }
  }

  /**
   * List campaigns with optional filters
   */
  static async listCampaigns(filters?: {
    agentId?: string
    status?: CampaignStatus
    limit?: number
    offset?: number
  }): Promise<CampaignWithAgent[]> {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          ...(filters?.agentId && { agentId: filters.agentId }),
          ...(filters?.status && { status: filters.status })
        },
        include: {
          agent: true
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0
      })

      return campaigns
    } catch (error) {
      console.error('Error listing campaigns:', error)
      return []
    }
  }

  /**
   * Get campaign metrics
   */
  static async getCampaignMetrics(campaignId: string): Promise<any> {
    try {
      const events = await prisma.campaignEvent.findMany({
        where: { campaignId },
        orderBy: { timestamp: 'desc' }
      })

      // Calculate metrics
      const metrics = {
        impressions: events.filter(e => e.eventType === 'impression').length,
        clicks: events.filter(e => e.eventType === 'click').length,
        conversions: events.filter(e => e.eventType === 'conversion').length,
        totalEvents: events.length,
        ctr: 0, // Will be calculated
        conversionRate: 0 // Will be calculated
      }

      // Calculate CTR
      if (metrics.impressions > 0) {
        metrics.ctr = (metrics.clicks / metrics.impressions) * 100
      }

      // Calculate conversion rate
      if (metrics.clicks > 0) {
        metrics.conversionRate = (metrics.conversions / metrics.clicks) * 100
      }

      return metrics
    } catch (error) {
      console.error('Error getting campaign metrics:', error)
      return null
    }
  }

  /**
   * Add campaign event
   */
  static async addCampaignEvent(campaignId: string, eventType: string, eventData?: any): Promise<boolean> {
    try {
      await prisma.campaignEvent.create({
        data: {
          campaignId,
          eventType,
          eventData
        }
      })

      return true
    } catch (error) {
      console.error('Error adding campaign event:', error)
      return false
    }
  }

  /**
   * Update campaign status
   */
  static async updateCampaignStatus(id: string, status: CampaignStatus): Promise<Campaign | null> {
    try {
      const campaign = await prisma.campaign.update({
        where: { id },
        data: { status }
      })

      return campaign
    } catch (error) {
      console.error('Error updating campaign status:', error)
      return null
    }
  }

  /**
   * Get campaigns by agent
   */
  static async getCampaignsByAgent(agentId: string): Promise<CampaignWithAgent[]> {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: { agentId },
        include: {
          agent: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return campaigns
    } catch (error) {
      console.error('Error getting campaigns by agent:', error)
      return []
    }
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(): Promise<any> {
    try {
      const totalCampaigns = await prisma.campaign.count()
      const activeCampaigns = await prisma.campaign.count({
        where: { status: CampaignStatus.PUBLISHED }
      })
      const draftCampaigns = await prisma.campaign.count({
        where: { status: CampaignStatus.DRAFT }
      })
      const completedCampaigns = await prisma.campaign.count({
        where: { status: CampaignStatus.COMPLETED }
      })

      const totalSpent = await prisma.campaign.aggregate({
        _sum: { spent: true }
      })

      return {
        totalCampaigns,
        activeCampaigns,
        draftCampaigns,
        completedCampaigns,
        totalSpent: totalSpent._sum.spent || 0
      }
    } catch (error) {
      console.error('Error getting campaign stats:', error)
      return null
    }
  }

  /**
   * Search campaigns
   */
  static async searchCampaigns(query: string): Promise<CampaignWithAgent[]> {
    try {
      const campaigns = await prisma.campaign.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { productName: { contains: query, mode: 'insensitive' } },
            { targetMarket: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          agent: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return campaigns
    } catch (error) {
      console.error('Error searching campaigns:', error)
      return []
    }
  }
}
