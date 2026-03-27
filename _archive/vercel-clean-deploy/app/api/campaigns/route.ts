import { AgentAuthService } from '@/lib/auth/agent-auth'
import { CampaignService } from '@/lib/services/campaign-service'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Helper function to get agent from request
async function getAgentFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const result = await AgentAuthService.verifyToken(token)
  return result.success ? result.agent : null
}

export async function GET(request: NextRequest) {
  try {
    const agent = await getAgentFromRequest(request)
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const campaigns = await CampaignService.listCampaigns({
      agentId: agentId || undefined,
      status: status as any,
      limit,
      offset
    })

    return NextResponse.json({
      success: true,
      campaigns
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const agent = await getAgentFromRequest(request)
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const data = await request.json()
    const campaign = await CampaignService.createCampaign({
      ...data,
      agentId: agent.id
    })

    if (campaign) {
      return NextResponse.json({
        success: true,
        campaign
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to create campaign'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
