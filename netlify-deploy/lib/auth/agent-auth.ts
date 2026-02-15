import { prisma } from '@/lib/db'
import { Agent, AgentRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export interface AgentAuthResult {
  success: boolean
  agent?: Agent
  token?: string
  error?: string
}

export interface CreateAgentData {
  name: string
  email: string
  password: string
  role?: AgentRole
}

export class AgentAuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private static readonly JWT_EXPIRES_IN = '7d'

  /**
   * Create a new agent
   */
  static async createAgent(data: CreateAgentData): Promise<AgentAuthResult> {
    try {
      // Check if agent already exists
      const existingAgent = await prisma.agent.findUnique({
        where: { email: data.email }
      })

      if (existingAgent) {
        return {
          success: false,
          error: 'Agent with this email already exists'
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12)

      // Create agent
      const agent = await prisma.agent.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: data.role || AgentRole.AGENT
        }
      })

      // Generate JWT token
      const token = jwt.sign(
        {
          agentId: agent.id,
          email: agent.email,
          role: agent.role
        },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      )

      // Create session
      await prisma.agentSession.create({
        data: {
          agentId: agent.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      })

      // Update last login
      await prisma.agent.update({
        where: { id: agent.id },
        data: { lastLogin: new Date() }
      })

      return {
        success: true,
        agent: {
          ...agent,
          password: '' // Don't return password
        } as Agent,
        token
      }
    } catch (error) {
      console.error('Error creating agent:', error)
      return {
        success: false,
        error: 'Failed to create agent'
      }
    }
  }

  /**
   * Authenticate agent login
   */
  static async loginAgent(email: string, password: string): Promise<AgentAuthResult> {
    try {
      // Find agent
      const agent = await prisma.agent.findUnique({
        where: { email }
      })

      if (!agent) {
        return {
          success: false,
          error: 'Invalid email or password'
        }
      }

      if (!agent.isActive) {
        return {
          success: false,
          error: 'Agent account is deactivated'
        }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, agent.password)
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid email or password'
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          agentId: agent.id,
          email: agent.email,
          role: agent.role
        },
        this.JWT_SECRET,
        { expiresIn: this.JWT_EXPIRES_IN }
      )

      // Create session
      await prisma.agentSession.create({
        data: {
          agentId: agent.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      })

      // Update last login
      await prisma.agent.update({
        where: { id: agent.id },
        data: { lastLogin: new Date() }
      })

      return {
        success: true,
        agent: {
          ...agent,
          password: '' // Don't return password
        } as Agent,
        token
      }
    } catch (error) {
      console.error('Error authenticating agent:', error)
      return {
        success: false,
        error: 'Authentication failed'
      }
    }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<AgentAuthResult> {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, this.JWT_SECRET) as any

      // Check if session exists and is valid
      const session = await prisma.agentSession.findFirst({
        where: {
          token,
          expiresAt: { gt: new Date() }
        },
        include: {
          agent: true
        }
      })

      if (!session || !session.agent.isActive) {
        return {
          success: false,
          error: 'Invalid or expired session'
        }
      }

      // Update last used
      await prisma.agentSession.update({
        where: { id: session.id },
        data: { lastUsed: new Date() }
      })

      return {
        success: true,
        agent: {
          ...session.agent,
          password: '' // Don't return password
        } as Agent
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      return {
        success: false,
        error: 'Invalid token'
      }
    }
  }

  /**
   * Logout agent
   */
  static async logoutAgent(token: string): Promise<boolean> {
    try {
      await prisma.agentSession.deleteMany({
        where: { token }
      })
      return true
    } catch (error) {
      console.error('Error logging out agent:', error)
      return false
    }
  }

  /**
   * Get agent by ID
   */
  static async getAgentById(agentId: string): Promise<Agent | null> {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId }
      })

      if (agent) {
        return {
          ...agent,
          password: '' // Don't return password
        } as Agent
      }

      return null
    } catch (error) {
      console.error('Error getting agent:', error)
      return null
    }
  }

  /**
   * Update agent
   */
  static async updateAgent(agentId: string, data: Partial<CreateAgentData>): Promise<Agent | null> {
    try {
      const updateData: any = { ...data }

      // Hash password if provided
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 12)
      }

      const agent = await prisma.agent.update({
        where: { id: agentId },
        data: updateData
      })

      return {
        ...agent,
        password: '' // Don't return password
      } as Agent
    } catch (error) {
      console.error('Error updating agent:', error)
      return null
    }
  }

  /**
   * Delete agent
   */
  static async deleteAgent(agentId: string): Promise<boolean> {
    try {
      await prisma.agent.delete({
        where: { id: agentId }
      })
      return true
    } catch (error) {
      console.error('Error deleting agent:', error)
      return false
    }
  }

  /**
   * List all agents
   */
  static async listAgents(): Promise<Agent[]> {
    try {
      const agents = await prisma.agent.findMany({
        orderBy: { createdAt: 'desc' }
      })

      return agents.map(agent => ({
        ...agent,
        password: '' // Don't return passwords
      })) as Agent[]
    } catch (error) {
      console.error('Error listing agents:', error)
      return []
    }
  }
}
