import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [rfqCount, supplierCount, activeUserCount] = await Promise.all([
      prisma.rFQ.count(),
      prisma.user.count({ where: { role: 'SUPPLIER' } }),
      prisma.user.count({ where: { isActive: true } }),
    ])

    return NextResponse.json({
      success: true,
      rfqCount,
      supplierCount,
      activeUserCount,
    })
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}