import { NextRequest, NextResponse } from 'next/server'
// NextAuth removed - using mobile OTP authentication
import { prisma } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

// Validation schemas
const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['BUYER', 'SUPPLIER', 'MODERATOR']).default('BUYER'),
  companyId: z.string().optional(),
})

const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['ADMIN', 'BUYER', 'SUPPLIER', 'MODERATOR']).optional(),
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
})

/**
 * GET /api/users - Get all users (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const { allowed, response } = await rateLimit(request, { windowMs: 60000, max: 100 })
    if (!allowed) return response!

    // Check authentication
    // Check authentication (simplified for mobile OTP)
    // TODO: Implement proper mobile OTP authentication check

    // Check admin role
    const isAdmin = true; // Mock admin check for now
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              rfqs: true,
              quotes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    // Remove sensitive data
    const safeUsers = users.map(user => ({
      ...user,
      password: undefined,
    }))

    return NextResponse.json({
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users - Create new user (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { allowed, response } = await rateLimit(request, { windowMs: 60000, max: 10 })
    if (!allowed) return response!

    // Check authentication
    // Check authentication (simplified for mobile OTP)
    // TODO: Implement proper mobile OTP authentication check

    // Check admin role
    const isAdmin = true; // Mock admin check for now
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
        companyId: validatedData.companyId,
        isActive: true,
        isVerified: false,
      },
      include: {
        profile: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Log user creation
    await prisma.auditLog.create({
      data: {
        userId: 'admin-user-id', // Mock admin user ID
        action: 'USER_CREATED',
        details: {
          createdUserId: user.id,
          userEmail: user.email,
          userRole: user.role,
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Remove sensitive data
    const { password, ...safeUser } = user

    return NextResponse.json(
      { user: safeUser, message: 'User created successfully' },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
