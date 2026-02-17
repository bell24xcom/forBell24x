/**
 * GET /api/insforge/status
 *
 * Health check — tells you if InsForge is connected.
 * Test: visit https://www.bell24h.com/api/insforge/status
 */

import { NextResponse } from 'next/server';
import { getInsforge, isInsforgeConfigured } from '@/lib/insforge';

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
    const client = getInsforge();
    if (!client) {
      return NextResponse.json(
        { connected: false, configured: true, message: 'InsForge client failed to initialize' },
        { status: 503 }
      );
    }

    // Quick ping — list 1 user to confirm connection works
    const { error } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          configured: true,
          message: `InsForge responded with error: ${error.message}`,
          hint: 'Check if your ik_ API key is correct in .env.production',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      connected: true,
      configured: true,
      message: 'InsForge is connected and working!',
      url: process.env.INSFORGE_URL,
    });
  } catch (err) {
    return NextResponse.json(
      {
        connected: false,
        configured: true,
        message: `Connection error: ${err instanceof Error ? err.message : 'Unknown'}`,
      },
      { status: 500 }
    );
  }
}
