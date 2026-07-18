/**
 * Public Knowledge Graph API — structured graph for AI reasoning (no LLM).
 *
 * GET /api/knowledge-graph?type=product&slug=fabric-sample-books
 * GET /api/knowledge-graph?type=industry&slug=fabric-sampling-industry
 * GET /api/knowledge-graph?type=cluster&slug=bhiwandi-textile-cluster
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { buildKnowledgeGraph, getKnowledgeGraphStats } from '@/src/lib/knowledge-graph';
import type { GraphQueryRoot } from '@/src/lib/knowledge-graph/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const statsOnly = searchParams.get('stats') === '1';

  if (statsOnly) {
    return NextResponse.json({ success: true, stats: await getKnowledgeGraphStats() });
  }

  const type = searchParams.get('type');
  const slug = searchParams.get('slug');
  const userId = searchParams.get('userId');

  let query: GraphQueryRoot | null = null;
  if (type === 'product' && slug) query = { type: 'product', slug };
  else if (type === 'industry' && slug) query = { type: 'industry', slug };
  else if (type === 'cluster' && slug) query = { type: 'cluster', slug };
  else if (type === 'company' && userId) query = { type: 'company', userId };

  if (!query) {
    return NextResponse.json(
      {
        success: false,
        error: 'Provide type=product|industry|cluster|company with slug or userId. Or stats=1.',
        stats: await getKnowledgeGraphStats(),
      },
      { status: 400 },
    );
  }

  const graph = await buildKnowledgeGraph(query);
  if (!graph) {
    return NextResponse.json({ success: false, error: 'Graph not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, graph });
}
