import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { normalizeProducts, type SupplierPreferences } from '@/src/lib/supplier-products';

export const dynamic = 'force-dynamic';

function getToken(request: NextRequest): string | null {
  return request.cookies.get('auth-token')?.value || null;
}

function authError() {
  return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return authError();

    let userId: string;
    try {
      userId = verifyToken(token).userId;
    } catch {
      return authError();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        location: true,
        gstNumber: true,
        udyamNumber: true,
        preferences: true,
        isVerified: true,
        trustScore: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const prefs = (user.preferences as SupplierPreferences) ?? {};
    const products = normalizeProducts(prefs.products);

    return NextResponse.json({
      success: true,
      profile: {
        companyName:     user.company        ?? '',
        email:           user.email          ?? '',
        phone:           user.phone          ?? '',
        city:            user.location       ?? '',
        gstNumber:       user.gstNumber      ?? '',
        udyamNumber:     user.udyamNumber    ?? '',
        businessType:    prefs.businessType    ?? '',
        yearsInBusiness:   prefs.yearsInBusiness ?? '',
        employees:         prefs.employees       ?? '',
        annualRevenue:     prefs.annualRevenue   ?? '',
        description:       prefs.description     ?? '',
        website:           prefs.website         ?? '',
        whatsapp:          prefs.whatsapp        ?? '',
        state:             prefs.state           ?? '',
        address:           prefs.address         ?? '',
        categories:        prefs.categories      ?? [],
        products,
        verified:        user.isVerified,
        trustScore:      user.trustScore,
      },
    });
  } catch (error) {
    console.error('[supplier/profile GET]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getToken(request);
    if (!token) return authError();

    let userId: string;
    try {
      userId = verifyToken(token).userId;
    } catch {
      return authError();
    }

    const {
      companyName, businessType, gstNumber, udyamNumber,
      yearsInBusiness, employees, annualRevenue, description,
      website, email, whatsapp, city, state, address, categories, products,
    } = await request.json();

    // Merge into existing preferences — never wipe fields not sent in this request
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { company: true, gstNumber: true, udyamNumber: true, location: true, preferences: true },
    });
    const existingPrefs = (existing?.preferences as SupplierPreferences) ?? {};

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(companyName  !== undefined && { company:     companyName  }),
        ...(email        !== undefined && { email:       email || undefined }),
        ...(city         !== undefined && { location:    city         }),
        ...(gstNumber    !== undefined && { gstNumber:   gstNumber || null }),
        ...(udyamNumber  !== undefined && { udyamNumber: udyamNumber || null }),
        preferences: {
          ...existingPrefs,
          ...(businessType    !== undefined && { businessType    }),
          ...(yearsInBusiness !== undefined && { yearsInBusiness }),
          ...(employees       !== undefined && { employees       }),
          ...(annualRevenue   !== undefined && { annualRevenue   }),
          ...(description     !== undefined && { description     }),
          ...(website         !== undefined && { website         }),
          ...(whatsapp        !== undefined && { whatsapp        }),
          ...(state           !== undefined && { state           }),
          ...(address         !== undefined && { address         }),
          ...(categories      !== undefined && { categories      }),
          ...(products        !== undefined && { products: normalizeProducts(products) }),
        },
      },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        location: true,
      },
    });

    const { recordProfileLifeEvents } = await import('@/src/lib/bom/profile-events');
    recordProfileLifeEvents(
      userId,
      {
        company: existing?.company,
        gstNumber: existing?.gstNumber,
        udyamNumber: existing?.udyamNumber,
        location: existing?.location,
        preferences: existingPrefs,
      },
      {
        company: companyName ?? existing?.company,
        gstNumber: gstNumber ?? existing?.gstNumber,
        udyamNumber: udyamNumber ?? existing?.udyamNumber,
        location: city ?? existing?.location,
        preferences: {
          ...existingPrefs,
          ...(state !== undefined && { state }),
          ...(categories !== undefined && { categories }),
          ...(products !== undefined && { products: normalizeProducts(products) }),
        },
      },
    );

    const { refreshCompanyDnaFromRfq } = await import('@/lib/memory-engine');
    refreshCompanyDnaFromRfq(userId).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: unknown) {
    // Unique constraint on email
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'That email address is already in use by another account' },
        { status: 409 },
      );
    }
    console.error('[supplier/profile PUT]', error);
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
  }
}
