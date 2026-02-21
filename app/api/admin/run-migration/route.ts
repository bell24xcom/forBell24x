import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ONE-TIME migration endpoint — DELETE THIS FILE after running once
// Call with: POST /api/admin/run-migration
// Body: { "secret": "<MIGRATION_SECRET from env>" }

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json()

    const expected = process.env.MIGRATION_SECRET || process.env.NEXTAUTH_SECRET
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: string[] = []

    // Add phone column to users if missing
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
    `)
    results.push('users.phone column: OK')

    // Add unique index if missing
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename = 'users' AND indexname = 'users_phone_key'
        ) THEN
          CREATE UNIQUE INDEX users_phone_key ON users(phone) WHERE phone IS NOT NULL;
        END IF;
      END $$;
    `)
    results.push('users.phone unique index: OK')

    // Create otp_verifications table if missing
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id TEXT PRIMARY KEY,
        phone TEXT NOT NULL,
        otp TEXT NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        attempts INT NOT NULL DEFAULT 0,
        "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    results.push('otp_verifications table: OK')

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes
          WHERE tablename = 'otp_verifications' AND indexname = 'otp_verifications_phone_key'
        ) THEN
          CREATE UNIQUE INDEX otp_verifications_phone_key ON otp_verifications(phone);
        END IF;
      END $$;
    `)
    results.push('otp_verifications.phone unique index: OK')

    return NextResponse.json({ success: true, results })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
