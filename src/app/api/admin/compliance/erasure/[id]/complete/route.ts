import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  const { id } = params;

  try {
    const erasureReq = await prisma.erasureRequest.findUnique({ where: { id } });
    if (!erasureReq) {
      return NextResponse.json({ error: 'Erasure request not found' }, { status: 404 });
    }
    if (erasureReq.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Already completed' }, { status: 400 });
    }

    const body  = await req.json().catch(() => ({}));
    const notes = body.notes ? String(body.notes).slice(0, 2000) : erasureReq.notes;

    // Log this data-access action before deleting
    await prisma.dataAccessLog.create({
      data: {
        adminUserId: auth.userId,
        action:      'DELETE',
        entity:      'ErasureRequest',
        entityId:    id,
      },
    });

    // If we have a resolved userId, delete their personal data
    if (erasureReq.userId) {
      const userId = erasureReq.userId;

      await prisma.$transaction(async (tx) => {
        // Delete notification, interaction, and memory data
        await tx.notification.deleteMany({ where: { userId } });
        await tx.interactionMemory.deleteMany({ where: { userId } });

        // Anonymise RFQs instead of hard-deleting (preserves market stats)
        await tx.rFQ.updateMany({
          where: { createdBy: userId },
          data: {
            title:       '[Deleted]',
            description: null,
            requirements: null,
            location:    null,
            isPublic:    false,
          },
        });

        // Mark quotes as deleted
        await tx.quote.updateMany({
          where: { supplierId: userId },
          data: { notes: null, description: null, terms: null },
        });

        // Null out personal fields on the user record (retain id for FK integrity)
        await tx.user.update({
          where: { id: userId },
          data: {
            name:        '[Deleted]',
            email:       null,
            phone:       null,
            company:     null,
            gstNumber:   null,
            udyamNumber: null,
            location:    null,
            avatar:      null,
            preferences: null,
            isActive:    false,
          },
        });

        await tx.dataAccessLog.create({
          data: {
            adminUserId: auth.userId,
            action:      'DELETE',
            entity:      'User',
            entityId:    userId,
          },
        });
      });
    }

    // Stamp the erasure request as completed
    const updated = await prisma.erasureRequest.update({
      where: { id },
      data: {
        status:      'COMPLETED',
        completedAt: new Date(),
        handledBy:   auth.email ?? auth.userId,
        notes,
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error('[admin/compliance/erasure/complete]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
