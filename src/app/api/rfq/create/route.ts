import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { onRFQCreated } from '@/lib/orchestration';
import { getAuthenticatedUser, hasRole } from '@/src/lib/auth-helpers';
import { storeRFQ, extractRFQMeta } from '@/lib/memory-engine';
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

    // 2. Authorize role (any authenticated user — on Bell24h, suppliers are also buyers)
    if (!hasRole(user, ['SUPPLIER', 'BUYER', 'ADMIN'])) {
      return NextResponse.json({ success: false, error: 'Forbidden: Authentication required' }, { status: 403 });
    }

    // 3. Validate request body
    const body = await req.json();
    const validatedData = CreateRFQSchema.parse(body);

    // 3b. Resolve categoryId FK from the free-text category name so the RFQ
    //     joins cleanly to /categories/[slug] listings. Best-effort — if the
    //     name doesn't match a row we save without the FK and fall back to
    //     the existing free-text column.
    let categoryId: number | undefined;
    try {
      const cat = await prisma.category.findFirst({
        where: {
          isActive: true,
          OR: [
            { name: { equals: validatedData.category, mode: 'insensitive' } },
            { name: { contains: validatedData.category, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });
      if (cat) categoryId = cat.id;
    } catch (e) {
      console.warn('[RFQ Create] categoryId lookup failed (non-fatal):', e);
    }

    // 4. Create RFQ in database
    const rfq = await prisma.rFQ.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        categoryId,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        minBudget: validatedData.minBudget,
        maxBudget: validatedData.maxBudget,
        location: validatedData.location,
        urgency: validatedData.urgency,
        status: 'ACTIVE',
        createdBy: user.id, // Real user ID from JWT
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // 5. Fire orchestration: supplier matching, in-app notifications,
    //    buyer confirm, n8n webhook, email. Awaited so DB writes
    //    complete before the serverless function ends; errors are
    //    swallowed because the RFQ is already saved at this point.
    if (rfq.user) {
      try {
        await onRFQCreated(
          { id: rfq.id, title: rfq.title, category: rfq.category, location: rfq.location },
          { id: rfq.user.id, name: rfq.user.name, email: rfq.user.email },
        );
      } catch (orchErr) {
        console.error('[RFQ Create] onRFQCreated failed:', orchErr);
      }
    }

    // Elephant Memory + Business Life Event
    try {
      const meta = extractRFQMeta({
        id: rfq.id,
        title: rfq.title,
        category: rfq.category,
        description: rfq.description,
        quantity: rfq.quantity,
        location: rfq.location,
        maxBudget: rfq.maxBudget,
        minBudget: rfq.minBudget,
      });
      await storeRFQ({
        ...meta,
        companyId: user.id,
        metadata: { ...meta.metadata, via: 'text', source: 'rfq_create' },
      });
    } catch (memErr) {
      console.error('[RFQ Create] memory error:', memErr);
    }

    return NextResponse.json({ success: true, rfq }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('RFQ Create Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
