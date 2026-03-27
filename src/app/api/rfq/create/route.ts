import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/src/lib/auth-helpers';
import { z } from 'zod';

const CreateRFQSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10).optional(),
  category: z.string(),
  quantity: z.string(),
  unit: z.string().default('units'),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  location: z.string().optional(),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // 2. Authorize role (Buyer or Admin)
    if (!hasRole(user, ['BUYER', 'ADMIN'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only buyers can create RFQs' }, { status: 403 });
    }

    // 3. Validate request body
    const body = await req.json();
    const validatedData = CreateRFQSchema.parse(body);

    // 4. Create RFQ in database
    const rfq = await prisma.rFQ.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        minBudget: validatedData.minBudget,
        maxBudget: validatedData.maxBudget,
        location: validatedData.location,
        urgency: validatedData.urgency,
        status: 'ACTIVE',
        createdBy: user.id, // Real user ID from JWT
      },
    });

    return NextResponse.json({ success: true, rfq }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('RFQ Create Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
