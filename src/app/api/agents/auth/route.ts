import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Agent authentication is not available in this version.
// Admin access is managed directly via Neon dashboard and Vercel environment variables.
export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Agent authentication is not available.'
  }, { status: 503 })
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Agent authentication is not available.'
  }, { status: 503 })
}
