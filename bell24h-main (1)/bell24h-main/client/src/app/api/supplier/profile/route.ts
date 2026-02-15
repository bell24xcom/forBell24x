import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      companyName,
      email,
      phone,
      city,
      state,
      category,
      description,
    } = body;

    // TODO: Get supplier ID from session/auth
    // For now, using companyId from body
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID required' },
        { status: 400 }
      );
    }

    // Update company profile
    const updated = await prisma.scrapedCompany.update({
      where: { id: companyId },
      data: {
        name: companyName,
        email,
        phone,
        city,
        state,
        category,
        // Add description field if it exists in schema
        // description,
      },
    });

    return NextResponse.json({
      success: true,
      company: updated,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    );
  }
}

