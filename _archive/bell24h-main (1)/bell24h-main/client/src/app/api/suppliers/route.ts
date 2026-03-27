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
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}
