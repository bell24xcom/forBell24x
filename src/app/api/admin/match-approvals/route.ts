/**
 * Marketplace Safety Framework (Option B — Founder Approval Required).
 *
 * GET  /api/admin/match-approvals            — list + Founder Cockpit summary counts
 * GET  /api/admin/match-approvals?id=xxx     — single detail, incl. full candidate pool
 * POST /api/admin/match-approvals            — { action: 'approve' | 'reject', id, ... }
 *
 * A single admin dispatcher route (action-in-body, not one file per action)
 * per CLAUDE.md's serverless function count constraint — see
 * src/app/api/admin/discovery/* for the same convention elsewhere in this repo.
 *
 * See lib/orchestration.ts (createPendingMatchApproval, releaseApprovedNotifications)
 * for where MatchApproval rows are created and how approval release notifies
 * suppliers. This route is the ONLY caller of releaseApprovedNotifications,
 * and only after the atomic PENDING_FOUNDER_APPROVAL → APPROVED transition
 * below has already succeeded — no other code path may notify a supplier
 * for an RFQ that fell into the low-confidence-match branch.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { releaseApprovedNotifications } from '@/lib/orchestration';

export const dynamic = 'force-dynamic';

function logMatchApprovalEvent(actionType: string, metadata: Record<string, unknown>) {
  prisma.interactionMemory
    .create({ data: { actionType, source: 'match_approval', metadata: metadata as Prisma.InputJsonValue } })
    .catch((err) => console.error(`[MatchApproval] ${actionType} audit log failed:`, err));
}

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const approval = await prisma.matchApproval.findUnique({
        where: { id },
        include: { rfq: { select: { id: true, title: true, category: true, location: true, createdAt: true } } },
      });
      if (!approval) {
        return NextResponse.json({ success: false, error: 'Match approval not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, approval });
    }

    const statusParam = req.nextUrl.searchParams.get('status');
    const where = statusParam && statusParam !== 'ALL'
      ? { status: statusParam as 'PENDING_FOUNDER_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED' }
      : { status: 'PENDING_FOUNDER_APPROVAL' as const };

    const [approvals, pending, approved, rejected, released, certificationTests] = await Promise.all([
      prisma.matchApproval.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: { rfq: { select: { id: true, title: true, category: true, location: true, createdAt: true } } },
      }),
      prisma.matchApproval.count({ where: { status: 'PENDING_FOUNDER_APPROVAL' } }),
      prisma.matchApproval.count({ where: { status: 'APPROVED' } }),
      prisma.matchApproval.count({ where: { status: 'REJECTED' } }),
      prisma.matchApproval.count({ where: { notificationReleasedAt: { not: null } } }),
      prisma.matchApproval.count({ where: { isCertificationTest: true } }),
    ]);

    return NextResponse.json({
      success: true,
      approvals,
      // Founder Cockpit — Marketplace Safety Panel metrics
      counts: {
        pendingApprovalRfqs: pending,
        approvedRfqs: approved,
        rejectedRfqs: rejected,
        notificationsReleased: released,
        certificationTests,
      },
    });
  } catch (error) {
    console.error('[MatchApproval] GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load match approvals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json().catch(() => ({}));
    const { action, id } = body as { action?: string; id?: string };

    if (!id || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json(
        { success: false, error: "Body must include { action: 'approve' | 'reject', id }" },
        { status: 400 }
      );
    }

    if (action === 'reject') {
      const rejectionReason = typeof body.rejectionReason === 'string' ? body.rejectionReason.slice(0, 500) : null;

      // Atomic guard — only a still-PENDING approval can be rejected, so a
      // concurrent approve/reject can only ever have one winner.
      const result = await prisma.matchApproval.updateMany({
        where: { id, status: 'PENDING_FOUNDER_APPROVAL' },
        data: {
          status: 'REJECTED',
          reviewedBy: auth.userId,
          reviewedAt: new Date(),
          rejectionReason,
        },
      });

      if (result.count === 0) {
        return NextResponse.json(
          { success: false, error: 'Match approval not found, or already reviewed' },
          { status: 409 }
        );
      }

      logMatchApprovalEvent('match_approval_rejected', { matchApprovalId: id, reviewedBy: auth.userId, rejectionReason });

      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    // action === 'approve'
    const selectedSupplierIds: string[] = Array.isArray(body.selectedSupplierIds)
      ? body.selectedSupplierIds.filter((v: unknown) => typeof v === 'string')
      : [];
    const isCertificationTest = body.isCertificationTest === true;

    if (selectedSupplierIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'selectedSupplierIds must include at least one supplier to approve' },
        { status: 400 }
      );
    }

    // Atomic guard — same principle as consumeClaimInvitation(): only a
    // still-PENDING approval can transition, so a concurrent double-approve
    // (or an approve racing a reject) can only ever have one winner.
    const transition = await prisma.matchApproval.updateMany({
      where: { id, status: 'PENDING_FOUNDER_APPROVAL' },
      data: {
        status: 'APPROVED',
        selectedSupplierIds,
        isCertificationTest,
        reviewedBy: auth.userId,
        reviewedAt: new Date(),
      },
    });

    if (transition.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Match approval not found, or already reviewed' },
        { status: 409 }
      );
    }

    const approval = await prisma.matchApproval.findUniqueOrThrow({
      where: { id },
      include: { rfq: { select: { id: true, title: true, category: true, location: true } } },
    });

    // Only the founder-selected suppliers, fetched fresh (not from the
    // candidatePool snapshot) so contact details reflect their current state.
    const suppliers = await prisma.user.findMany({
      where: { id: { in: selectedSupplierIds } },
      select: { id: true, name: true, email: true, phone: true },
    });

    const candidatePool = Array.isArray(approval.candidatePool) ? (approval.candidatePool as any[]) : [];
    const scoreById = new Map(candidatePool.map((c) => [c.id, c.score]));

    await releaseApprovedNotifications(
      approval.rfq,
      suppliers.map((s) => ({ ...s, score: scoreById.get(s.id) }))
    );

    await prisma.matchApproval.update({
      where: { id },
      data: { notificationReleasedAt: new Date() },
    });

    logMatchApprovalEvent('match_approval_approved', {
      matchApprovalId: id,
      rfqId: approval.rfqId,
      reviewedBy: auth.userId,
      selectedSupplierIds,
      isCertificationTest,
    });
    logMatchApprovalEvent('match_approval_notification_released', {
      matchApprovalId: id,
      rfqId: approval.rfqId,
      notifiedSupplierIds: suppliers.map((s) => s.id),
    });

    return NextResponse.json({ success: true, status: 'APPROVED', notifiedSuppliers: suppliers.length });
  } catch (error) {
    console.error('[MatchApproval] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process match approval action' }, { status: 500 });
  }
}
