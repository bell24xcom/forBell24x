import { AgentAuthService } from '@/lib/auth/agent-auth'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token required'
      }, { status: 400 })
    }

    const result = await AgentAuthService.verifyToken(token)

    if (result.success) {
      return NextResponse.json({
        success: true,
        agent: result.agent
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 401 })
    }

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
