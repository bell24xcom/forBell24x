<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const {
  PGHOST,
  PGPORT,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  DATABASE_URL,
  NODE_ENV,
} = process.env as Record<string, string | undefined>;

const pool =
  PGHOST || PGUSER || PGPASSWORD || PGDATABASE
    ? new Pool({
        host: PGHOST,
        port: Number(PGPORT || 5432),
        user: PGUSER,
        password: PGPASSWORD,
        database: PGDATABASE,
        ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      })
    : new Pool({
        connectionString: DATABASE_URL,
        ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      } as any);

export async function GET() {
  try {
    const { rows } = await pool.query(
      'select id, company_name, email, phone, city, state, category, slug from suppliers where coalesce(is_claimed,false)=false limit 50'
    );
    return NextResponse.json(rows);
=======
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Query the scraped_companies table (ScrapedCompany model)
    // Convert the fields to match expected API response
    const companies = await prisma.scrapedCompany.findMany({
      where: {
        claimStatus: 'UNCLAIMED' // Only show unclaimed companies
      },
      select: {
        id: true,
        name: true, // This is the company name in ScrapedCompany
        email: true,
        phone: true,
        city: true,
        state: true,
        category: true,
        status: true,
        trustScore: true
      },
      take: 50
    });

    // Transform the data to match expected API response format
    const suppliers = companies.map(company => ({
      id: company.id,
      company_name: company.name, // Map name to company_name for API compatibility
      email: company.email,
      phone: company.phone,
      city: company.city,
      state: company.state,
      category: company.category,
      slug: company.id, // Use id as slug since there's no slug field
      is_claimed: false, // All filtered companies are unclaimed
      trust_score: company.trustScore
    }));

    return NextResponse.json(suppliers);
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
