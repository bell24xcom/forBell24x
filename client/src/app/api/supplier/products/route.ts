import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const supplierId = searchParams.get('supplierId');

    if (!supplierId) {
      return NextResponse.json(
        { error: 'Supplier ID required' },
        { status: 400 }
      );
    }

    // TODO: Fetch products from database
    // For now, return empty array
    const products = [];

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplierId,
      product_name,
      description,
      price_range,
      moq,
      unit,
    } = body;

    if (!supplierId || !product_name) {
      return NextResponse.json(
        { error: 'Supplier ID and product name required' },
        { status: 400 }
      );
    }

    // TODO: Create product in database
    // For now, return success with mock data
    const product = {
      id: `product-${Date.now()}`,
      supplierId,
      product_name,
      description,
      price_range,
      moq,
      unit,
      image_urls: [],
    };

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}

