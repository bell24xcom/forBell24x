import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, hasRole } from '@/src/lib/auth-helpers';
import { z } from 'zod';

const CreateQuoteSchema = z.object({
  rfqId: z.string(),
  price: z.number(),
  quantity: z.string(),
  description: z.string().optional(),
  terms: z.string().optional(),
  deliveryDays: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = getAuthenticatedUser(req);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    // 2. Authorize role (Supplier or Admin)
    if (!hasRole(user, ['SUPPLIER', 'ADMIN'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Only suppliers can create quotes' }, { status: 403 });
    }

    // 3. Validate request body
    const body = await req.json();
    const validatedData = CreateQuoteSchema.parse(body);

    // 4. Create quote in database
    const quote = await prisma.quote.create({
      data: {
        rfqId: validatedData.rfqId,
        supplierId: user.id, // Real user ID from JWT
        price: validatedData.price,
        quantity: validatedData.quantity,
        description: validatedData.description,
        terms: validatedData.terms,
        deliveryDays: validatedData.deliveryDays,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, quote }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Quote Create Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
