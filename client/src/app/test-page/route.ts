import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Test page is working',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
} 
