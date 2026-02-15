import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch supplier profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!supplierId && !slug) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID or slug required' },
        { status: 400 }
      );
    }

    // Fetch supplier profile
    const supplier = await prisma.company.findFirst({
      where: {
        id: supplierId || undefined
      },
      include: {
        products: true,
        users: true,
        rfqs: true
      }
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          description: supplier.description,
          logo: supplier.logo,
          website: supplier.website,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          city: supplier.city,
          state: supplier.state,
          pincode: supplier.pincode,
          category: supplier.category,
          subcategory: supplier.subcategory,
          annualTurnover: supplier.annualTurnover,
          employeeCount: supplier.employeeCount,
          size: supplier.size,
          type: supplier.type,
          establishedYear: supplier.establishedYear,
          gstNumber: supplier.gstNumber,
          panNumber: supplier.panNumber,
          isVerified: supplier.isVerified,
          isActive: supplier.isActive,
          products: supplier.products,
          users: supplier.users,
          rfqs: supplier.rfqs,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Fetch supplier profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supplier profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update supplier profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { supplierId, updates } = body;

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const allowedFields = [
      'name', 'description', 'logo', 'website', 'phone', 'email',
      'address', 'city', 'state', 'pincode', 'category', 'subcategory',
      'turnover', 'employees', 'establishedYear', 'gstNumber', 'panNumber',
      'msmeNumber', 'services', 'capabilities', 'gallery'
    ];

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    // Update supplier profile
    const updatedSupplier = await prisma.company.update({
      where: { id: supplierId },
      data: {
        ...filteredUpdates,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Supplier profile updated: ${updatedSupplier.name}`);

    return NextResponse.json({
      success: true,
      message: 'Supplier profile updated successfully',
      data: {
        supplier: updatedSupplier
      }
    });

  } catch (error) {
    console.error('❌ Update supplier profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update supplier profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new supplier profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      category, 
      subcategory, 
      phone, 
      email, 
      address, 
      city, 
      state, 
      pincode,
      gstNumber,
      panNumber,
      userId 
    } = body;

    // Validate required fields
    if (!name || !category || !phone || !email || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
=======
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
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create supplier profile
    const newSupplier = await prisma.company.create({
      data: {
        name,
        description: description || '',
        category,
        subcategory: subcategory || '',
        phone,
        email,
        address: address || '',
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        gstNumber: gstNumber || '',
        panNumber: panNumber || '',
        isVerified: false,
        isActive: true
      }
    });

    console.log(`✅ New supplier profile created: ${newSupplier.name}`);

    return NextResponse.json({
      success: true,
      message: 'Supplier profile created successfully',
      data: {
        supplier: newSupplier
      }
    });

  } catch (error) {
    console.error('❌ Create supplier profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create supplier profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
=======
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
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
      { status: 500 }
    );
  }
}
<<<<<<< HEAD
=======

>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
