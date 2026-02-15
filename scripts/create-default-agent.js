
import { PrismaClient, AgentRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDefaultAgent() {
  try {
    // Check if admin agent already exists
    const existingAgent = await prisma.agent.findUnique({
      where: { email: 'admin@bell24h.com' }
    })

    if (existingAgent) {
      console.log('✅ Admin agent already exists')
      return
    }

    // Create default admin agent
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminAgent = await prisma.agent.create({
      data: {
        name: 'Admin Agent',
        email: 'admin@bell24h.com',
        password: hashedPassword,
        role: AgentRole.ADMIN,
        isActive: true
      }
    })

    console.log('✅ Default admin agent created:')
    console.log('   Email: admin@bell24h.com')
    console.log('   Password: admin123')
    console.log('   Role: ADMIN')
    
  } catch (error) {
    console.error('❌ Error creating default agent:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultAgent()
