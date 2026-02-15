import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const rfqs = await prisma.rfq.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true, user: true }
  })
  return NextResponse.json(rfqs)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, categoryId, title, description, type, location, quantity } = body

    if (!userId || !categoryId || !title || !type || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rfq = await prisma.rfq.create({
      data: { userId, categoryId, title, description: description || '', type, status: 'active', location, quantity },
    })

    // Log webhook event for n8n
    await prisma.webhook.create({
      data: { eventType: 'rfq.created', payload: rfq, status: 'pending' }
    })

    return NextResponse.json(rfq, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 })
  }
}
