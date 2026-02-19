import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

// GET — fetch message threads for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    const userId = payload.userId;

    const { searchParams } = new URL(request.url);
    const withUserId = searchParams.get('with');
    const rfqId = searchParams.get('rfqId');

    const where: Parameters<typeof prisma.message.findMany>[0]['where'] = {
      OR: [{ fromId: userId }, { toId: userId }],
    };
    if (withUserId) {
      where.OR = [
        { fromId: userId, toId: withUserId },
        { fromId: withUserId, toId: userId },
      ];
    }
    if (rfqId) where.rfqId = rfqId;

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        from: { select: { id: true, name: true, company: true, avatar: true } },
        to:   { select: { id: true, name: true, company: true, avatar: true } },
      },
      take: 100,
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { toId: userId, isRead: false },
      data: { isRead: true },
    }).catch(() => {});

    // Build thread list — group by the other participant
    const threadMap = new Map<string, { partner: typeof messages[0]['from']; messages: typeof messages; lastMessage: typeof messages[0]; unread: number }>();
    for (const msg of messages) {
      const partnerId = msg.fromId === userId ? msg.toId : msg.fromId;
      const partner   = msg.fromId === userId ? msg.to : msg.from;
      if (!threadMap.has(partnerId)) {
        threadMap.set(partnerId, { partner, messages: [], lastMessage: msg, unread: 0 });
      }
      const thread = threadMap.get(partnerId)!;
      thread.messages.push(msg);
      thread.lastMessage = msg;
      if (!msg.isRead && msg.toId === userId) thread.unread += 1;
    }

    const threads = Array.from(threadMap.values());

    return NextResponse.json({ success: true, threads, messages });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load messages' }, { status: 500 });
  }
}

// POST — send a new message
export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    const userId = payload.userId;

    const { toId, content, rfqId } = await request.json();
    if (!toId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'toId and content are required' }, { status: 400 });
    }
    if (toId === userId) {
      return NextResponse.json({ success: false, error: 'Cannot message yourself' }, { status: 400 });
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({ where: { id: toId }, select: { id: true } });
    if (!recipient) return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 });

    const message = await prisma.message.create({
      data: { fromId: userId, toId, content: content.trim(), rfqId: rfqId || null },
      include: {
        from: { select: { id: true, name: true, company: true } },
        to:   { select: { id: true, name: true, company: true } },
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
