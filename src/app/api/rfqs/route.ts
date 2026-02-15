import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const rfqs = await prisma.rfq.findMany({
    orderBy: { createdAt: 'desc' },
    include: { categoryRel: true, user: true }
  })
  return NextResponse.json(rfqs)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, categoryId, title, description, type, location, quantity } = body

    if (!userId || !title || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rfq = await prisma.rfq.create({
      data: {
        createdBy: userId,
        categoryId: categoryId || undefined,
        title,
        description: description || '',
        type: type || undefined,
        status: 'ACTIVE',
        location,
        quantity: quantity || '1',
        category: type || 'general',
        timeline: 'TBD',
        unit: 'units'
      }
    })

    await prisma.webhook.create({
      data: { eventType: 'rfq.created', payload: rfq as object, status: 'pending' }
    })

    return NextResponse.json(rfq, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create RFQ' }, { status: 500 })
  }
}
