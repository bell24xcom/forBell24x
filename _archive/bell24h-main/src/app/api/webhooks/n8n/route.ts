import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { eventType = 'n8n.received', payload = {} } = body || {}

    const record = await prisma.webhook.create({
      data: { eventType, payload, status: 'received' }
    })

    return NextResponse.json({ success: true, id: record.id })
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
