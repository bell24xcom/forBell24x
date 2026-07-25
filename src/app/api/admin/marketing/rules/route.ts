import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const rules = await prisma.campaignRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ rules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await req.json();
    const rule = await prisma.campaignRule.create({
      data: {
        category:     body.category,
        urgency:      String(body.urgency ?? 'NORMAL').toUpperCase(),
        templateText: body.template_text ?? body.templateText,
        actionType:   body.action_type   ?? body.actionType ?? 'whatsapp',
        isActive:     body.is_active     ?? body.isActive   ?? true,
      },
    });
    return NextResponse.json({ success: true, data: rule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (isErrorResponse(auth)) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('Missing ID');

    await prisma.campaignRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
