import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.min(100, parseInt(searchParams.get('limit') || '20'));
    const role   = searchParams.get('role') as string | null;
    const search = searchParams.get('search');
    const plan   = searchParams.get('plan') as string | null;
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
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, plan: true, isActive: true, isVerified: true,
          company: true, gstNumber: true, udyamNumber: true,
          trustScore: true, location: true, lastLoginAt: true,
          createdAt: true,
          _count: { select: { rfqs: true, quotes: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const [totalBuyers, totalSuppliers, activeUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'BUYER'    } }),
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.user.count({ where: { isActive: true   } }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { totalUsers: await prisma.user.count(), totalBuyers, totalSuppliers, activeUsers },
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const { userId, updates } = await request.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId required' }, { status: 400 });
    }

    // Whitelist safe fields only
    const allowed = ['name', 'role', 'plan', 'isActive', 'isVerified', 'company', 'location'];
    const safeUpdates = Object.fromEntries(
      Object.entries(updates ?? {}).filter(([k]) => allowed.includes(k))
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: safeUpdates,
      select: { id: true, name: true, email: true, phone: true, role: true, plan: true, isActive: true, isVerified: true, trustScore: true },
    });

    return NextResponse.json({ success: true, user, message: 'User updated' });
  } catch (error) {
    console.error('Admin users PUT error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const userId = new URL(request.url).searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId required' }, { status: 400 });
    }

    // Soft delete — deactivate, never hard-delete
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json({ success: true, user, message: 'User deactivated' });
  } catch (error) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to deactivate user' }, { status: 500 });
  }
}
