import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import {
  listProducts,
  getProduct,
  searchProducts,
  buildProductGraph,
  catalogStats,
} from '@/src/lib/product-intelligence';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const slug = request.nextUrl.searchParams.get('slug');
  const q = request.nextUrl.searchParams.get('q');
  const pageParam = request.nextUrl.searchParams.get('page');
  const pageSizeParam = request.nextUrl.searchParams.get('pageSize');

  if (q) {
    return NextResponse.json({ success: true, products: await searchProducts(q) });
  }

  if (slug) {
    const product = await getProduct(slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    const graph = await buildProductGraph(slug);
    return NextResponse.json({ success: true, product, graph });
  }

  const page = pageParam ? Number(pageParam) : NaN;
  const pageSize = pageSizeParam ? Number(pageSizeParam) : NaN;
  if (Number.isInteger(page) && page > 0 && Number.isInteger(pageSize) && pageSize > 0) {
    const paginated = await listProducts({ page, pageSize });
    return NextResponse.json({ success: true, ...paginated, stats: await catalogStats() });
  }

  return NextResponse.json({ success: true, products: await listProducts(), stats: await catalogStats() });
}
