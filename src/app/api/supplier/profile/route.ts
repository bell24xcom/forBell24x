import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

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

    const prefs = (user.preferences as Record<string, unknown>) ?? {};

    return NextResponse.json({
      success: true,
      profile: {
        companyName:     user.company        ?? '',
        email:           user.email          ?? '',
        phone:           user.phone          ?? '',
        city:            user.location       ?? '',
        gstNumber:       user.gstNumber      ?? '',
        udyamNumber:     user.udyamNumber    ?? '',
        businessType:    (prefs.businessType    as string) ?? '',
        yearsInBusiness: (prefs.yearsInBusiness as string) ?? '',
        employees:       (prefs.employees       as string) ?? '',
        annualRevenue:   (prefs.annualRevenue   as string) ?? '',
        description:     (prefs.description     as string) ?? '',
        website:         (prefs.website         as string) ?? '',
        whatsapp:        (prefs.whatsapp        as string) ?? '',
        state:           (prefs.state           as string) ?? '',
        address:         (prefs.address         as string) ?? '',
        categories:      (prefs.categories      as string[]) ?? [],
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
      website, email, whatsapp, city, state, address, categories,
    } = await request.json();

    // Merge into existing preferences — never wipe fields not sent in this request
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const existingPrefs = (existing?.preferences as Record<string, unknown>) ?? {};

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
