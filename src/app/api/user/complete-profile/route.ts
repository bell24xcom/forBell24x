import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('auth-token')?.value ?? null;
    const authHeader = req.headers.get('authorization');
    const token = extractToken(authHeader, cookieToken);

    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    let payload: { userId: string };
    try {
      payload = verifyToken(token) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }

    const body = await req.json();
    const { name, role, company } = body;

    const updateData: Record<string, unknown> = {};
    if (name && typeof name === 'string') updateData.name = name.trim().slice(0, 100);
    if (role === 'BUYER' || role === 'SUPPLIER') updateData.role = role;
    if (company && typeof company === 'string') updateData.company = company.trim().slice(0, 200);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: { id: true, name: true, role: true, company: true, phone: true, isVerified: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
