import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Bulk Import Suppliers API
 * Item 22: Scrape supplier data - Import 50,000 profiles
 * 
 * Accepts bulk supplier data and imports to database
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { suppliers, source } = body;

    if (!suppliers || !Array.isArray(suppliers)) {
      return NextResponse.json(
        { error: 'Suppliers array is required' },
        { status: 400 }
      );
    }

    if (suppliers.length === 0) {
      return NextResponse.json(
        { error: 'Suppliers array cannot be empty' },
        { status: 400 }
      );
    }

    // Validate and clean supplier data
    const validatedSuppliers = suppliers
      .filter(supplier => supplier.name && supplier.phone)
      .map(supplier => ({
        name: supplier.name.trim(),
        category: supplier.category || 'General',
        city: supplier.city || null,
        state: supplier.state || null,
        email: supplier.email?.toLowerCase().trim() || null,
        phone: supplier.phone.replace(/\D/g, '').slice(-10), // Last 10 digits
        website: supplier.website || null,
        address: supplier.address || null,
        description: supplier.description || null,
        trustScore: supplier.rating ? Math.round(supplier.rating * 10) : 50,
        claimStatus: 'UNCLAIMED' as const,
        source: source || 'manual',
        scrapedAt: new Date()
      }))
      .filter(supplier => supplier.phone.length === 10); // Valid phone number

    if (validatedSuppliers.length === 0) {
      return NextResponse.json(
        { error: 'No valid suppliers after validation' },
        { status: 400 }
      );
    }

    // Bulk insert suppliers (in batches of 1000)
    const batchSize = 1000;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < validatedSuppliers.length; i += batchSize) {
      const batch = validatedSuppliers.slice(i, i + batchSize);
      
      try {
        // Use createMany with skipDuplicates to avoid errors
        await prisma.scrapedCompany.createMany({
          data: batch,
          skipDuplicates: true
        });
        imported += batch.length;
      } catch (error) {
        console.error(`Error importing batch ${i / batchSize + 1}:`, error);
        skipped += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: suppliers.length,
        validated: validatedSuppliers.length,
        imported,
        skipped,
        source: source || 'manual'
      },
      message: `Successfully imported ${imported} suppliers`
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Failed to import suppliers' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check import status
 */
export async function GET(request: NextRequest) {
  try {
    const totalSuppliers = await prisma.scrapedCompany.count();
    const unclaimedSuppliers = await prisma.scrapedCompany.count({
      where: { claimStatus: 'UNCLAIMED' }
    });
    const claimedSuppliers = await prisma.scrapedCompany.count({
      where: { claimStatus: 'CLAIMED' }
    });

    return NextResponse.json({
      success: true,
      stats: {
        total: totalSuppliers,
        unclaimed: unclaimedSuppliers,
        claimed: claimedSuppliers,
        target: 50000,
        progress: ((totalSuppliers / 50000) * 100).toFixed(2) + '%'
      }
    });

  } catch (error) {
    console.error('Get import status error:', error);
    return NextResponse.json(
      { error: 'Failed to get import status' },
      { status: 500 }
    );
  }
}

