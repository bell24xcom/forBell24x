import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET - Fetch supplier content for all sections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');
    const section = searchParams.get('section'); // 'services', 'capabilities', 'reviews', 'products'

    if (!supplierId) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID required' },
        { status: 400 }
      );
    }

    // Fetch supplier with all content
    const supplier = await prisma.company.findUnique({
      where: { id: supplierId },
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

    // Return specific section or all content
    if (section) {
      const sectionData = getSectionData(supplier, section);
      return NextResponse.json({
        success: true,
        data: {
          section,
          content: sectionData
        }
      });
    }

    // Return all content
    return NextResponse.json({
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          website: supplier.website,
          description: supplier.description,
          category: supplier.category,
          subcategory: supplier.subcategory,
          address: supplier.address,
          city: supplier.city,
          state: supplier.state,
          country: supplier.country,
          products: supplier.products,
          users: supplier.users,
          rfqs: supplier.rfqs
        }
      }
    });

  } catch (error) {
    console.error('❌ Fetch supplier content error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supplier content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update supplier content sections
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      supplierId, 
      section, 
      content,
      action // 'add', 'update', 'delete'
    } = body;

    if (!supplierId || !section || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate section
    const validSections = ['services', 'capabilities', 'gallery', 'products', 'reviews'];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section' },
        { status: 400 }
      );
    }

    // Get current supplier data
    const supplier = await prisma.company.findUnique({
      where: { id: supplierId }
    });

    if (!supplier) {
      return NextResponse.json(
        { success: false, error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Update section content based on action
    let updatedContent = {};
    
    if (section === 'services') {
      updatedContent = await updateServices(supplier, content, action);
    } else if (section === 'capabilities') {
      updatedContent = await updateCapabilities(supplier, content, action);
    } else if (section === 'gallery') {
      updatedContent = await updateGallery(supplier, content, action);
    }

    // Update supplier record
    const updatedSupplier = await prisma.company.update({
      where: { id: supplierId },
      data: updatedContent
    });

    console.log(`✅ Supplier ${section} content updated: ${supplier.name}`);

    return NextResponse.json({
      success: true,
      message: `${section} content updated successfully`,
      data: {
        section,
        content: updatedContent,
        supplier: updatedSupplier
      }
    });

  } catch (error) {
    console.error('❌ Update supplier content error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update supplier content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions for updating different sections
function getSectionData(supplier: any, section: string) {
  switch (section) {
    case 'services':
      return supplier.services || [];
    case 'capabilities':
      return supplier.capabilities || [];
    case 'gallery':
      return supplier.gallery || [];
    case 'products':
      return supplier.products || [];
    case 'reviews':
      return supplier.reviews || [];
    default:
      return null;
  }
}

async function updateServices(supplier: any, content: any, action: string) {
  const currentServices = supplier.services || [];
  let newServices = [...currentServices];

  if (action === 'add') {
    const newService = {
      id: Date.now().toString(),
      title: content.title,
      description: content.description,
      category: content.category,
      price: content.price,
      duration: content.duration,
      features: content.features || [],
      createdAt: new Date().toISOString()
    };
    newServices.push(newService);
  } else if (action === 'update') {
    const index = newServices.findIndex((s: any) => s.id === content.id);
    if (index !== -1) {
      newServices[index] = { ...newServices[index], ...content };
    }
  } else if (action === 'delete') {
    newServices = newServices.filter((s: any) => s.id !== content.id);
  }

  return { services: newServices };
}

async function updateCapabilities(supplier: any, content: any, action: string) {
  const currentCapabilities = supplier.capabilities || [];
  let newCapabilities = [...currentCapabilities];

  if (action === 'add') {
    const newCapability = {
      id: Date.now().toString(),
      name: content.name,
      description: content.description,
      category: content.category,
      level: content.level, // 'beginner', 'intermediate', 'advanced', 'expert'
      certifications: content.certifications || [],
      experience: content.experience, // years
      createdAt: new Date().toISOString()
    };
    newCapabilities.push(newCapability);
  } else if (action === 'update') {
    const index = newCapabilities.findIndex((c: any) => c.id === content.id);
    if (index !== -1) {
      newCapabilities[index] = { ...newCapabilities[index], ...content };
    }
  } else if (action === 'delete') {
    newCapabilities = newCapabilities.filter((c: any) => c.id !== content.id);
  }

  return { capabilities: newCapabilities };
}

async function updateGallery(supplier: any, content: any, action: string) {
  const currentGallery = supplier.gallery || [];
  let newGallery = [...currentGallery];

  if (action === 'add') {
    const newImage = {
      id: Date.now().toString(),
      url: content.url,
      thumbnailUrl: content.thumbnailUrl,
      caption: content.caption,
      type: content.type, // 'product', 'facility', 'certificate', 'award'
      category: content.category,
      createdAt: new Date().toISOString()
    };
    newGallery.push(newImage);
  } else if (action === 'update') {
    const index = newGallery.findIndex((g: any) => g.id === content.id);
    if (index !== -1) {
      newGallery[index] = { ...newGallery[index], ...content };
    }
  } else if (action === 'delete') {
    newGallery = newGallery.filter((g: any) => g.id !== content.id);
  }

  return { gallery: newGallery };
}
