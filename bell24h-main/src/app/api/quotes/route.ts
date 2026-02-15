import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rfqId, supplierId, price, description, deliveryTime } = body
    if (!rfqId || !supplierId) {
      return NextResponse.json({ error: 'rfqId and supplierId required' }, { status: 400 })
    }

    const quote = await prisma.$transaction(async (tx) => {
      const created = await tx.quote.create({
        data: {
          rfqId: Number(rfqId),
          supplierId: Number(supplierId),
          price: price != null ? price : undefined,
          description: description || undefined,
          deliveryTime: deliveryTime || undefined,
        },
      })
      await tx.rfq.update({
        where: { id: Number(rfqId) },
        data: { quotesCount: { increment: 1 } },
      })
      return created
    })

    await prisma.webhook.create({ data: { eventType: 'quote.submitted', payload: quote, status: 'pending' } })

    return NextResponse.json(quote, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit quote' }, { status: 500 })
  }
}
