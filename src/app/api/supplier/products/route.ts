import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeProducts, slugifyProduct, type SupplierPreferences } from '@/lib/supplier-products';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

function getUserId(request: NextRequest): string | null {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  try {
    return verifyToken(token).userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: true, products: [] });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const prefs = (user?.preferences ?? {}) as SupplierPreferences;
    const products = normalizeProducts(prefs.products);

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching supplier products:', error);
    return NextResponse.json({ success: false, products: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, price, imageUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    const prefs = (user?.preferences ?? {}) as SupplierPreferences;
    const existing = normalizeProducts(prefs.products);

    const product = {
      id: `prod-${Date.now()}`,
      name: String(name).trim(),
      slug: slugifyProduct(String(name)),
      description: description ? String(description) : undefined,
      category: category ? String(category) : undefined,
      imageUrl: imageUrl ? String(imageUrl) : undefined,
      price: price != null ? parseFloat(price) : undefined,
    };

    const updated = [...existing, product];
    await prisma.user.update({
      where: { id: userId },
      data: { preferences: { ...prefs, products: updated } },
    });

    const { refreshCompanyDnaFromRfq } = await import('@/lib/memory-engine');
    refreshCompanyDnaFromRfq(userId).catch(() => {});

    return NextResponse.json({ success: true, product, message: 'Product created' });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const { id, name, description, category, price, imageUrl } = await request.json();
    if (!id) return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
    const prefs = (user?.preferences ?? {}) as SupplierPreferences;
    const products = normalizeProducts(prefs.products);
    const idx = products.findIndex(p => p.id === id);
    if (idx < 0) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    if (name) {
      products[idx].name = String(name).trim();
      products[idx].slug = slugifyProduct(products[idx].name);
    }
    if (description !== undefined) products[idx].description = description || undefined;
    if (category !== undefined) products[idx].category = category || undefined;
    if (imageUrl !== undefined) products[idx].imageUrl = imageUrl || undefined;
    if (price !== undefined) products[idx].price = parseFloat(price);

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: { ...prefs, products } },
    });

    const { refreshCompanyDnaFromRfq } = await import('@/lib/memory-engine');
    refreshCompanyDnaFromRfq(userId).catch(() => {});

    return NextResponse.json({ success: true, product: products[idx] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ success: false, message: 'Unauthorised' }, { status: 401 });

    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
    const prefs = (user?.preferences ?? {}) as SupplierPreferences;
    const products = normalizeProducts(prefs.products).filter(p => p.id !== id);

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: { ...prefs, products } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
  }
}
