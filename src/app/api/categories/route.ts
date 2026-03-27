import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/categories
 *
 * Query params:
 *   ?flat=true          → return all categories as a flat list
 *   ?level=1            → only main categories (no subcategories in response)
 *   ?parentId=xxx       → subcategories of a specific parent
 *   (no params)         → hierarchical tree: main categories with children[]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get('flat') === 'true';
    const levelFilter = searchParams.get('level');
    const parentId = searchParams.get('parentId');

    // ── Flat list of ALL categories ──────────────────────────────────────────
    if (flat) {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ priority: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          parentId: true,
          icon: true,
          priority: true,
        },
      });
      return NextResponse.json({ success: true, categories });
    }

    // ── Subcategories of a specific parent ───────────────────────────────────
    if (parentId) {
      const subcategories = await prisma.category.findMany({
        where: { parentId: parseInt(parentId), isActive: true },
        orderBy: [{ priority: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
        },
      });
      return NextResponse.json({ success: true, subcategories });
    }

    // ── Only level-1 main categories (parentId is null) ──────────────────────
    if (levelFilter === '1') {
      const categories = await prisma.category.findMany({
        where: { parentId: null, isActive: true },
        orderBy: [{ priority: 'asc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          _count: { select: { children: true, rfqs: true } },
        },
      });
      return NextResponse.json({ success: true, categories });
    }

    // ── Default: hierarchical tree (main categories with their subcategories) ─
    const mainCategories = await prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: [{ priority: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ priority: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            _count: { select: { rfqs: true } },
          },
        },
        _count: { select: { rfqs: true } },
      },
    });

    return NextResponse.json({ success: true, categories: mainCategories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
