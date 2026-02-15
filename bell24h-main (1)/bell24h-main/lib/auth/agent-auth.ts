// Agent authentication functionality
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface Agent {
  id: string;
  email: string;
  name: string;
  role: 'agent' | 'admin';
  createdAt: Date;
}

export interface AuthToken {
  agentId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AgentAuth {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

  static generateToken(agent: Agent): string {
    return jwt.sign(
      {
        agentId: agent.id,
        email: agent.email,
        role: agent.role,
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token: string): AuthToken | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as AuthToken;
    } catch (error) {
      return null;
    }
  }

  static authenticateRequest(request: NextRequest): AuthToken | null {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return this.verifyToken(token);
  }

  static createAuthResponse(agent: Agent): NextResponse {
    const token = this.generateToken(agent);
    
    return NextResponse.json({
      success: true,
      token,
      agent: {
        id: agent.id,
        email: agent.email,
        name: agent.name,
        role: agent.role,
      },
    });
  }

  static createErrorResponse(message: string, status: number = 401): NextResponse {
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }

  // Complete authenticateAgent method implementation
  static async authenticateAgent(email: string, password: string): Promise<{ success: boolean; message?: string; agent?: Agent }> {
    try {
      // Validate input
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Mock authentication with proper validation
      const mockAgents = [
        {
          id: 'agent-1',
          email: 'admin@bell24h.com',
          password: 'admin123',
          name: 'Admin Agent',
          role: 'admin' as const,
          createdAt: new Date()
        },
        {
          id: 'agent-2', 
          email: 'support@bell24h.com',
          password: 'support123',
          name: 'Support Agent',
          role: 'agent' as const,
          createdAt: new Date()
        }
      ];

      // Find agent by email (case-insensitive)
      const agent = mockAgents.find(a => 
        a.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      
      if (!agent) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Verify password
      if (agent.password !== password) {
        return {
          success: false,
          message: 'Invalid credentials'
        };
      }

      // Return successful authentication
      return {
        success: true,
        message: 'Authentication successful',
        agent: {
          id: agent.id,
          email: agent.email,
          name: agent.name,
          role: agent.role,
          createdAt: agent.createdAt
        }
      };

    } catch (error) {
      console.error('AgentAuth.authenticateAgent error:', error);
      return {
        success: false,
        message: 'Authentication failed due to server error'
      };
    }
  }
}

export const agentAuth = AgentAuth;

// Export for compatibility
export const AgentAuthService = AgentAuth;