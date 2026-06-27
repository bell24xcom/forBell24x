/**
 * Map profile/product changes → BusinessLifeEvent records.
 */

import { recordLifeEventAsync } from './life-events';
import { companyLocationFromProfile, recordLocationEvent } from './location';
import type { SupplierPreferences } from '@/lib/supplier-products';

export function recordProfileLifeEvents(
  userId: string,
  before: {
    company?: string | null;
    gstNumber?: string | null;
    udyamNumber?: string | null;
    location?: string | null;
    preferences?: SupplierPreferences | null;
  },
  after: {
    company?: string | null;
    gstNumber?: string | null;
    udyamNumber?: string | null;
    location?: string | null;
    preferences?: SupplierPreferences | null;
  },
): void {
  if (!before.gstNumber && after.gstNumber) {
    recordLifeEventAsync({
      companyId: userId,
      eventType: 'gst_uploaded',
      actorId: userId,
      metadata: { gst: after.gstNumber },
      source: 'profile',
      confidence: 1,
    });
  }

  if (!before.udyamNumber && after.udyamNumber) {
    recordLifeEventAsync({
      companyId: userId,
      eventType: 'udyam_verified',
      actorId: userId,
      metadata: { udyam: after.udyamNumber },
      source: 'profile',
      confidence: 1,
    });
  }

  const beforeProducts = before.preferences?.products?.length ?? 0;
  const afterProducts = after.preferences?.products?.length ?? 0;
  if (afterProducts > beforeProducts) {
    const added = (after.preferences?.products ?? []).slice(beforeProducts);
    for (const p of added) {
      recordLifeEventAsync({
        companyId: userId,
        eventType: 'product_added',
        actorId: userId,
        category: typeof p === 'object' && p && 'category' in p ? String((p as { category?: string }).category) : undefined,
        metadata: {
          productName: typeof p === 'object' && p && 'name' in p ? String((p as { name: string }).name) : String(p),
        },
        source: 'profile',
      });
    }
  }

  const beforeLoc = (before.location ?? '').trim();
  const afterLoc = (after.location ?? '').trim();
  if (afterLoc && afterLoc !== beforeLoc) {
    const loc = companyLocationFromProfile(afterLoc, after.preferences?.state);
    if (loc) recordLocationEvent(userId, loc);
  }

  recordLifeEventAsync({
    companyId: userId,
    eventType: 'profile_updated',
    actorId: userId,
    metadata: {
      company: after.company,
      categories: after.preferences?.categories,
      productCount: afterProducts,
    },
    source: 'profile',
  });
}

export function recordProductLifeEvent(
  userId: string,
  eventType: 'product_added' | 'product_updated' | 'product_removed',
  product: { name: string; category?: string; slug?: string },
): void {
  recordLifeEventAsync({
    companyId: userId,
    eventType,
    actorId: userId,
    category: product.category,
    metadata: { productName: product.name, slug: product.slug },
    source: 'products',
  });
}
