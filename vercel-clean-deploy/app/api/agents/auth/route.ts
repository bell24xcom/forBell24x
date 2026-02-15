import { AgentAuthService } from '@/lib/auth/agent-auth'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (action === 'login') {
      const result = await AgentAuthService.loginAgent(email, password)

      if (result.success) {
        return NextResponse.json({
          success: true,
          agent: result.agent,
          token: result.token
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 401 })
      }
    } else if (action === 'register') {
      const { name, role } = await request.json()

      const result = await AgentAuthService.createAgent({
        name,
        email,
        password,
        role
      })

      if (result.success) {
        return NextResponse.json({
          success: true,
          agent: result.agent,
          token: result.token
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Agent auth error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
