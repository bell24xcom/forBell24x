// Mock CampaignService without Prisma dependency
export type CampaignStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'

export interface Agent {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
}

export interface Campaign {
  id: string
  name: string
  description?: string
  supplierId?: string
  productName?: string
  targetMarket?: string
  channels: string[]
  budget?: number
  spent?: number
  status: CampaignStatus
  startDate?: Date
  endDate?: Date
  content?: any
  metrics?: any
  aiInsights?: any
  agentId?: string
  createdAt: Date
  updatedAt: Date
}

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

// Mock campaign storage
const mockCampaigns = new Map<string, Campaign>()
const mockCampaignEvents = new Map<string, any[]>()

export class CampaignService {
  /**
   * Create a new campaign
   */
  static async createCampaign(data: CreateCampaignData): Promise<Campaign | null> {
    try {
      const campaign: Campaign = {
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        description: data.description,
        supplierId: data.supplierId,
        productName: data.productName,
        targetMarket: data.targetMarket,
        channels: data.channels,
        budget: data.budget,
        spent: 0,
        startDate: data.startDate,
        endDate: data.endDate,
        agentId: data.agentId,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockCampaigns.set(campaign.id, campaign)
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
      const campaign = mockCampaigns.get(id)
      if (!campaign) return null

      return {
        ...campaign,
        agent: campaign.agentId ? {
          id: campaign.agentId,
          email: 'agent@bell24h.com',
          name: 'Mock Agent',
          role: 'agent',
          isActive: true
        } : null
      }
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
      const campaign = mockCampaigns.get(id)
      if (!campaign) return null

      const updatedCampaign = {
        ...campaign,
        ...data,
        updatedAt: new Date()
      }

      mockCampaigns.set(id, updatedCampaign)
      return updatedCampaign
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
      mockCampaigns.delete(id)
      mockCampaignEvents.delete(id)
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
      let campaigns = Array.from(mockCampaigns.values())

      // Apply filters
      if (filters?.agentId) {
        campaigns = campaigns.filter(c => c.agentId === filters.agentId)
      }
      if (filters?.status) {
        campaigns = campaigns.filter(c => c.status === filters.status)
      }

      // Sort by created date (desc)
      campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      // Apply pagination
      const limit = filters?.limit || 50
      const offset = filters?.offset || 0
      campaigns = campaigns.slice(offset, offset + limit)

      // Add agent data
      return campaigns.map(campaign => ({
        ...campaign,
        agent: campaign.agentId ? {
          id: campaign.agentId,
          email: 'agent@bell24h.com',
          name: 'Mock Agent',
          role: 'agent',
          isActive: true
        } : null
      }))
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
      const events = mockCampaignEvents.get(campaignId) || []

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
      const events = mockCampaignEvents.get(campaignId) || []
      events.push({
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        campaignId,
        eventType,
        eventData,
        timestamp: new Date()
      })
      mockCampaignEvents.set(campaignId, events)

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
      const campaign = mockCampaigns.get(id)
      if (!campaign) return null

      const updatedCampaign = {
        ...campaign,
        status,
        updatedAt: new Date()
      }

      mockCampaigns.set(id, updatedCampaign)
      return updatedCampaign
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
      const campaigns = Array.from(mockCampaigns.values())
        .filter(c => c.agentId === agentId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return campaigns.map(campaign => ({
        ...campaign,
        agent: {
          id: campaign.agentId!,
          email: 'agent@bell24h.com',
          name: 'Mock Agent',
          role: 'agent',
          isActive: true
        }
      }))
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
      const campaigns = Array.from(mockCampaigns.values())
      
      const totalCampaigns = campaigns.length
      const activeCampaigns = campaigns.filter(c => c.status === 'PUBLISHED').length
      const draftCampaigns = campaigns.filter(c => c.status === 'DRAFT').length
      const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED').length
      const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0)

      return {
        totalCampaigns,
        activeCampaigns,
        draftCampaigns,
        completedCampaigns,
        totalSpent
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
      const campaigns = Array.from(mockCampaigns.values())
        .filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.productName?.toLowerCase().includes(query.toLowerCase()) ||
          c.targetMarket?.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      return campaigns.map(campaign => ({
        ...campaign,
        agent: campaign.agentId ? {
          id: campaign.agentId,
          email: 'agent@bell24h.com',
          name: 'Mock Agent',
          role: 'agent',
          isActive: true
        } : null
      }))
    } catch (error) {
      console.error('Error searching campaigns:', error)
      return []
    }
  }
}
