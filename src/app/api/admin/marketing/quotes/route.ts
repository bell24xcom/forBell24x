import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const stub = () => NextResponse.json({ error: 'Feature coming soon' }, { status: 501 });

export async function GET(_req: NextRequest) { return stub(); }
