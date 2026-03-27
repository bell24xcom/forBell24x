import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, extractToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Get message threads for user
    const threads = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, company: true } },
        recipient: { select: { id: true, name: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Group messages by thread
    const threadMap = new Map();
    threads.forEach((message) => {
      const threadId = message.senderId < message.recipientId 
        ? `${message.senderId}-${message.recipientId}` 
        : `${message.recipientId}-${message.senderId}`;

      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          id: threadId,
          participants: [
            { id: message.senderId, name: message.sender.name, company: message.sender.company },
            { id: message.recipientId, name: message.recipient.name, company: message.recipient.company },
          ],
          messages: [],
          lastMessage: message,
          unreadCount: 0,
        });
      }

      const thread = threadMap.get(threadId);
      thread.messages.push(message);
      if (message.recipientId === userId && !message.isRead) {
        thread.unreadCount++;
      }
      if (message.createdAt > thread.lastMessage.createdAt) {
        thread.lastMessage = message;
      }
    });

    const sortedThreads = Array.from(threadMap.values()).sort((a, b) => 
      b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    );

    return NextResponse.json({
      success: true,
      threads: sortedThreads.map((thread) => ({
        id: thread.id,
        participants: thread.participants,
        lastMessage: {
          id: thread.lastMessage.id,
          content: thread.lastMessage.content,
          senderId: thread.lastMessage.senderId,
          createdAt: thread.lastMessage.createdAt,
          isRead: thread.lastMessage.isRead,
        },
        unreadCount: thread.unreadCount,
      })),
    });
  } catch (error) {
    console.error('Error fetching message threads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract and verify token
    const token = extractToken(request.headers.get('authorization'), request.cookies.get('auth-token')?.value);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Parse request body
    const body = await request.json();
    const { recipientId, content } = body;

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId,
        content,
        isRead: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}