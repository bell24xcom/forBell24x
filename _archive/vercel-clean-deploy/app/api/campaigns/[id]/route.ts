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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAgentFromRequest(request)
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const campaign = await CampaignService.getCampaignById(params.id)

    if (campaign) {
      return NextResponse.json({
        success: true,
        campaign
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAgentFromRequest(request)
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const data = await request.json()
    const campaign = await CampaignService.updateCampaign(params.id, data)

    if (campaign) {
      return NextResponse.json({
        success: true,
        campaign
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to update campaign'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await getAgentFromRequest(request)
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const success = await CampaignService.deleteCampaign(params.id)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Campaign deleted successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete campaign'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
