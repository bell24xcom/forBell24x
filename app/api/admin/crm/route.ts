/**
 * Admin CRM API — full user management with plan/role/status controls.
 * GET  /api/admin/crm?search=&role=&plan=&page=&limit=
 * PUT  /api/admin/crm  { userId, action: 'activate'|'deactivate'|'setPlan'|'setRole', value }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')   || '1'));
    const limit  = Math.min(100, parseInt(searchParams.get('limit') || '25'));
    const role   = searchParams.get('role');
    const plan   = searchParams.get('plan');
    const search = searchParams.get('search');
    const skip   = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role)   where.role = role;
    if (plan)   where.plan = plan;
    if (search) {
      where.OR = [
        { name:    { contains: search, mode: 'insensitive' } },
        { email:   { contains: search, mode: 'insensitive' } },
        { phone:   { contains: search } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ trustScore: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true, name: true, email: true, phone: true, company: true,
          role: true, plan: true, isActive: true, isVerified: true,
          gstNumber: true, udyamNumber: true, trustScore: true,
          location: true, lastLoginAt: true, createdAt: true,
          _count: { select: { rfqs: true, quotes: true } },
          wallet:  { select: { balance: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('CRM GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch CRM data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const { userId, action, value } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ success: false, message: 'userId and action required' }, { status: 400 });
    }

    let data: Record<string, unknown> = {};

    switch (action) {
      case 'activate':
        data = { isActive: true };
        break;
      case 'deactivate':
        data = { isActive: false };
        break;
      case 'setPlan':
        if (!['FREE', 'PRO', 'ENTERPRISE'].includes(value)) {
          return NextResponse.json({ success: false, message: 'Invalid plan. Use FREE, PRO, or ENTERPRISE' }, { status: 400 });
        }
        data = { plan: value };
        break;
      case 'setRole':
        if (!['SUPPLIER', 'BUYER', 'ADMIN', 'AGENT'].includes(value)) {
          return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
        }
        data = { role: value };
        break;
      case 'setVerified':
        data = { isVerified: Boolean(value) };
        break;
      default:
        return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, plan: true, isActive: true, isVerified: true, trustScore: true },
    });

    return NextResponse.json({ success: true, user, message: `Action "${action}" applied successfully` });
  } catch (error) {
    console.error('CRM PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to apply action' }, { status: 500 });
  }
}
