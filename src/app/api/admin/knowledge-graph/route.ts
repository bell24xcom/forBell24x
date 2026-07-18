import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { buildKnowledgeGraph, getKnowledgeGraphStats } from '@/src/lib/knowledge-graph';
import type { GraphQueryRoot } from '@/src/lib/knowledge-graph/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const type = request.nextUrl.searchParams.get('type');
  const slug = request.nextUrl.searchParams.get('slug');
  const userId = request.nextUrl.searchParams.get('userId');

  if (!type) {
    return NextResponse.json({ success: true, stats: await getKnowledgeGraphStats() });
  }

  let query: GraphQueryRoot | null = null;
  if (type === 'product' && slug) query = { type: 'product', slug };
  else if (type === 'industry' && slug) query = { type: 'industry', slug };
  else if (type === 'cluster' && slug) query = { type: 'cluster', slug };
  else if (type === 'company' && userId) query = { type: 'company', userId };

  if (!query) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const graph = await buildKnowledgeGraph(query);
  if (!graph) return NextResponse.json({ error: 'Graph not found' }, { status: 404 });

  return NextResponse.json({ success: true, graph, stats: await getKnowledgeGraphStats() });
}
