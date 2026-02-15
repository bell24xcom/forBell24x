import { AgentAuth } from '@/lib/auth/agent-auth'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Mock agent data for testing
const MOCK_AGENTS = [
  {
    id: 'agent-1',
    email: 'admin@bell24h.com',
    password: 'admin123', // In production, this would be hashed
    name: 'Admin Agent',
    role: 'admin',
    isActive: true
  },
  {
    id: 'agent-2', 
    email: 'support@bell24h.com',
    password: 'support123',
    name: 'Support Agent',
    role: 'support',
    isActive: true
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    if (action === 'register') {
      // Mock registration - check if agent already exists
      const existingAgent = MOCK_AGENTS.find(agent => agent.email === email)
      
      if (existingAgent) {
        return NextResponse.json({
          success: false,
          error: 'Agent with this email already exists'
        }, { status: 409 })
      }

      // Create new agent (mock)
      const newAgent = {
        id: `agent-${Date.now()}`,
        email,
        password,
        name: email.split('@')[0],
        role: 'agent',
        isActive: true
      }

      return AgentAuth.createAuthResponse(newAgent)
    } else if (action === 'login') {
      // Use the proper authenticateAgent method
      const result = await AgentAuth.authenticateAgent(email, password)
      
      if (result.success && result.agent) {
        return AgentAuth.createAuthResponse(result.agent)
      } else {
        return NextResponse.json({
          success: false,
          error: result.message || 'Authentication failed'
        }, { status: 401 })
      }
    } else {
      // Default login logic (fallback)
      const agent = MOCK_AGENTS.find(a => a.email === email && a.password === password)
      
      if (!agent) {
        return NextResponse.json({
          success: false,
          error: 'Invalid email or password'
        }, { status: 401 })
      }

      if (!agent.isActive) {
        return NextResponse.json({
          success: false,
          error: 'Agent account is inactive'
        }, { status: 403 })
      }

      return AgentAuth.createAuthResponse(agent)
    }

  } catch (error) {
    console.error('Agent auth error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
