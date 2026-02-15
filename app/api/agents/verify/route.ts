import { AgentAuth } from '@/lib/auth/agent-auth'
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

    // Use AgentAuth.verifyToken which returns null on failure
    const authToken = AgentAuth.verifyToken(token)

    if (authToken) {
      return NextResponse.json({
        success: true,
        agent: {
          id: authToken.agentId,
          email: authToken.email,
          role: authToken.role
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
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
