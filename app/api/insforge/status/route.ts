/**
 * GET /api/insforge/status
 *
 * Health check to verify InsForge connection is working.
 * Visit this URL in browser or test with curl after adding credentials.
 *
 * Returns:
 *   - connected: true/false
 *   - configured: true/false (env vars present)
 *   - error: error message if any
 */

import { NextResponse } from 'next/server';
import { getInsforgeAdmin } from '@/lib/insforge';

export async function GET() {
  const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  const serviceKey = process.env.INSFORGE_SERVICE_ROLE_KEY;

  const isConfigured =
    !!insforgeUrl &&
    !!anonKey &&
    !insforgeUrl.includes('YOUR_PROJECT_ID') &&
    !anonKey.includes('YOUR_ANON');

  if (!isConfigured) {
    return NextResponse.json(
      {
        connected: false,
        configured: false,
        message:
          'InsForge is NOT configured. Open .env.production and replace placeholder values with your real InsForge credentials.',
        steps: [
          '1. Go to InsForge Dashboard → Your Project → Settings → API',
          '2. Copy Project URL → paste as NEXT_PUBLIC_INSFORGE_BASE_URL',
          '3. Copy anon/public key → paste as NEXT_PUBLIC_INSFORGE_ANON_KEY',
          '4. Copy service_role key → paste as INSFORGE_SERVICE_ROLE_KEY',
          '5. Restart your dev server',
        ],
      },
      { status: 503 }
    );
  }

  // Try to connect
  try {
    const admin = getInsforgeAdmin();
    if (!admin) {
      return NextResponse.json(
        {
          connected: false,
          configured: true,
          message: 'InsForge admin client failed to initialize. Check service role key.',
        },
        { status: 503 }
      );
    }

    // Minimal ping — list users with limit 1
    const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          configured: true,
          message: `InsForge connection failed: ${error.message}`,
          hint: 'Verify your Project URL and service_role key are correct.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      connected: true,
      configured: true,
      message: 'InsForge is connected and working!',
      projectUrl: insforgeUrl,
      hasServiceKey: !!serviceKey && !serviceKey.includes('YOUR_SERVICE'),
    });
  } catch (err) {
    return NextResponse.json(
      {
        connected: false,
        configured: true,
        message: `InsForge connection error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
