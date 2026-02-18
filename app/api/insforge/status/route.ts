/**
 * GET /api/insforge/status
 *
 * Health check — tells you if InsForge is connected.
 * Test: visit https://www.bell24h.com/api/insforge/status
 */

import { NextResponse } from 'next/server';
import { isInsforgeConfigured } from '@/lib/insforge';

export async function GET() {
  if (!isInsforgeConfigured()) {
    return NextResponse.json(
      {
        connected: false,
        configured: false,
        message: 'InsForge is NOT configured yet.',
        fix: 'Open .env.production → paste your ik_ API key as INSFORGE_API_KEY → restart server',
      },
      { status: 503 }
    );
  }

  try {
    const url = process.env.INSFORGE_URL!;
    const apiKey = process.env.INSFORGE_API_KEY!;

    // Ping the InsForge server with the API key — any HTTP response means the server is up
    const response = await fetch(`${url.replace(/\/$/, '')}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'apikey': apiKey,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    // Any HTTP response (even 404) means the server is reachable
    const isReachable = response.status < 500;
    const statusText = `HTTP ${response.status}`;

    if (isReachable) {
      return NextResponse.json({
        connected: true,
        configured: true,
        message: 'InsForge server is reachable and API key is set.',
        server_status: statusText,
        url: url,
      });
    }

    return NextResponse.json(
      {
        connected: false,
        configured: true,
        message: `InsForge server returned ${statusText}`,
        hint: 'Server may be temporarily down. Try again in a moment.',
      },
      { status: 503 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = message.includes('timeout') || message.includes('abort');
    return NextResponse.json(
      {
        connected: false,
        configured: true,
        message: isTimeout
          ? 'InsForge server did not respond within 5 seconds (timeout)'
          : `Connection error: ${message}`,
      },
      { status: 500 }
    );
  }
}
