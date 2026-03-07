import { NextRequest } from 'next/server';

export function verifyCronSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-cron-secret') ||
                 request.nextUrl.searchParams.get('secret');
  return secret === process.env.CRON_SECRET;
}
