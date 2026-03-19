/**
 * Messenger Agent — WhatsApp Outreach
 * ─────────────────────────────────
 * Generates and sends personalized WhatsApp messages to suppliers.
 *
 * RULES:
 * - Never contact same supplier twice in 7 days
 * - Never contact supplier who already quoted
 * - Skip suppliers with trustScore < 30
 * - Log every message sent to InteractionMemory
 */

import { prisma } from '@/lib/prisma';
import { storeInteraction } from '@/lib/memory-engine';

export interface OutreachTarget {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  trustScore: number;
  score: number;
}

export interface MessageResult {
  supplierId: string;
  sent: boolean;
  messageId?: string;
  error?: string;
}

/**
 * buildMessage — generates personalized outreach message
 */
function buildMessage(
  rfq: { title: string; category: string; quantity: string; maxBudget?: number | null; timeline?: string; urgency: string; id: string },
  supplier: OutreachTarget
): string {
  const budget = rfq.maxBudget ? `₹${Number(rfq.maxBudget).toLocaleString('en-IN')}` : 'competitive';
  const urgencyPrefix = rfq.urgency === 'URGENT' ? 'URGENT — ' : '';

  return `Hi ${supplier.name ?? supplier.company},

${urgencyPrefix}A new buyer on Bell24h needs:

📦 ${rfq.title}
📍 ${rfq.category}
📊 Qty: ${rfq.quantity}
💰 Budget: ${budget}
⏱️ Timeline: ${rfq.timeline ?? 'Flexible'}

View details & submit your quote:
https://www.bell24h.com/rfq/${rfq.id}

— Bell24h Marketplace
India's fastest B2B RFQ platform`;
}

/**
 * shouldContact — checks if we should contact this supplier
 */
async function shouldContact(supplierId: string, rfqId: string): Promise<boolean> {
  // Check if already quoted
  const existingQuote = await prisma.quote.findFirst({
    where: { rfqId, supplierId },
  });
  if (existingQuote) return false;

  // Check if contacted in last 7 days
  const recentContact = await prisma.interactionMemory.findFirst({
    where: {
      rfqId,
      userId: supplierId,
      actionType: 'outreach_sent',
      createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
    },
  });
  if (recentContact) return false;

  return true;
}

/**
 * sendOutreach — main entry point
 * Returns results for each supplier
 */
export async function sendOutreach(
  rfq: { id: string; title: string; category: string; quantity: string; maxBudget?: number | null; timeline?: string; urgency: string },
  suppliers: OutreachTarget[]
): Promise<MessageResult[]> {
  const results: MessageResult[] = [];

  for (const supplier of suppliers) {
    // Skip low-trust suppliers
    if (supplier.trustScore < 30) {
      results.push({ supplierId: supplier.id, sent: false, error: 'trustScore < 30' });
      continue;
    }

    // Check outreach history
    const canContact = await shouldContact(supplier.id, rfq.id).catch(() => false);
    if (!canContact) {
      results.push({ supplierId: supplier.id, sent: false, error: 'already-contacted-or-quoted' });
      continue;
    }

    // Build message
    const message = buildMessage(rfq, supplier);

    // Log the outreach attempt (fire-and-forget)
    storeInteraction({
      rfqId: rfq.id,
      userId: supplier.id,
      actionType: 'outreach_sent',
      source: 'whatsapp',
      metadata: {
        company: supplier.company,
        trustScore: supplier.trustScore,
        messageLength: message.length,
      },
    }).catch(() => {});

    // In production: integrate with WhatsApp Business API (wa.me links or WhatsApp Cloud API)
    // For now: log to console + InteractionMemory
    const waLink = supplier.phone
      ? `https://wa.me/91${supplier.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
      : null;

    if (waLink) {
      console.log(`[Messenger] Would send to ${supplier.company} (${supplier.phone}):`, waLink);
    }

    results.push({
      supplierId: supplier.id,
      sent: !!waLink,
      messageId: waLink ? `wa_${Date.now()}_${supplier.id.slice(-6)}` : undefined,
      error: waLink ? undefined : 'no-phone',
    });
  }

  return results;
}
