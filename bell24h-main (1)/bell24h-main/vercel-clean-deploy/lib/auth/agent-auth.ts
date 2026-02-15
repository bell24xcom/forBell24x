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
}

export const agentAuth = AgentAuth;