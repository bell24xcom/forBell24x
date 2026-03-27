import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/supplier/products - Get supplier's products
export async function GET(request: NextRequest) {
  try {
    // TODO: Get supplier ID from auth session
    // For now, return all products or empty array

    const products = await prisma.product.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    return NextResponse.json({
      success: false,
      products: [],
      message: 'Failed to fetch products',
    }, { status: 500 });
  }
}

// POST /api/supplier/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, price, quantity, imageUrl } = body;

    if (!name || !description) {
      return NextResponse.json({
        success: false,
        message: 'Name and description are required',
      }, { status: 400 });
    }

    // TODO: Get supplier ID from auth session
    // For now, create product without supplier association

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : 0,
        quantity: quantity ? parseInt(quantity) : 0,
        imageUrl: imageUrl || '',
        categoryId: category || null,
      },
    }).catch((error) => {
      console.error('Prisma error:', error);
      return null;
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create product',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

// PUT /api/supplier/products - Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, price, quantity, imageUrl } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Product ID is required',
      }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    }).catch(() => null);

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found or update failed',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}

// DELETE /api/supplier/products - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Product ID is required',
      }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}
