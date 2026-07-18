/**
 * Morning Business Brief — reads only company's own BOM (no generic chatbot).
 */

import { prisma } from '@/lib/prisma';
import { projectBomFromLifeEvents } from './projections';
import { computeBusinessGenome } from './genome-score';
import { lifeEventLabel } from './life-events';
import { callSeoLlm } from '@/src/lib/seo-llm';
import { resolveAreaKey, getArea } from './location';
import { getAreaPulse } from './business-pulse';
import { searchProducts } from '@/src/lib/product-intelligence/search';

export interface BriefInsight {
  type: 'reminder' | 'alert' | 'opportunity' | 'trust' | 'activity' | 'recommendation';
  text: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MorningBrief {
  companyId: string;
  companyName: string;
  generatedAt: string;
  greeting: string;
  genomeOverall: number;
  insights: BriefInsight[];
  aiPolish?: string[];
  dataSource: 'bom_only';
}

export async function generateMorningBrief(companyId: string, useAi = false): Promise<MorningBrief> {
  const user = await prisma.user.findUnique({
    where: { id: companyId },
    select: { company: true, name: true, trustScore: true, gstNumber: true, udyamNumber: true, location: true },
  });

  if (!user) throw new Error('Company not found');

  const companyName = user.company || user.name || 'there';
  const projection = await projectBomFromLifeEvents(companyId);
  const genome = computeBusinessGenome(projection);
  const insights: BriefInsight[] = [];

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? `Good morning, ${companyName}.`
      : hour < 17
        ? `Good afternoon, ${companyName}.`
        : `Good evening, ${companyName}.`;

  if (projection.eventCount === 0) {
    insights.push({
      type: 'recommendation',
      text: 'No business life events yet. Complete your profile, add products, or post your first RFQ to start your Business Genome.',
      priority: 'high',
    });
  } else {
    insights.push({
      type: 'activity',
      text: `${projection.eventCount} business life events recorded. Business Genome: ${genome.overall}%.`,
      priority: 'medium',
    });
  }

  const recentRfqs = projection.layers.procurementMemory?.recentRfqs ?? [];
  if (recentRfqs.length > 0) {
    insights.push({
      type: 'reminder',
      text: `Latest procurement: "${recentRfqs[0].title}" (${recentRfqs[0].category}).`,
      priority: 'medium',
    });
  }

  const rfqEvents = projection.eventCount;
  const quoteEvents = projection.layers.procurementMemory?.quotationCount ?? 0;
  if (rfqEvents > 0 && quoteEvents === 0) {
    insights.push({
      type: 'alert',
      text: 'You have RFQs without quotes yet — follow up with suppliers or broaden categories.',
      priority: 'high',
    });
  }

  if (!user.gstNumber) {
    insights.push({
      type: 'trust',
      text: 'Upload GST to improve Trade Confidence and unlock verified supplier matching.',
      priority: 'high',
    });
  } else {
    insights.push({
      type: 'trust',
      text: `Trade Confidence baseline: ${user.trustScore}/100. GST on file.`,
      priority: 'low',
    });
  }

  if (projection.productNames.length > 0) {
    const intelMatches = await searchProducts(projection.productNames[0], 1);
    if (intelMatches.length > 0) {
      insights.push({
        type: 'opportunity',
        text: `Product Intelligence linked: ${intelMatches[0].name} (${intelMatches[0].completenessScore}% complete) — HS ${intelMatches[0].commercial.hsCode ?? 'pending'}.`,
        priority: 'low',
      });
    }
    insights.push({
      type: 'opportunity',
      text: `${projection.productNames.length} product(s) listed — SEO pages live at /supplier/${companyId}/products/…`,
      priority: 'low',
    });
  }

  const areaKey = resolveAreaKey(user.location);
  if (areaKey) {
    const area = getArea(areaKey);
    const pulse = await getAreaPulse(areaKey, 7);
    if (pulse.hasActivity && area) {
      const parts: string[] = [];
      if (pulse.summary.newRfqs > 0) parts.push('new requirements');
      if (pulse.summary.quotes > 0) parts.push('quotes flowing');
      if (pulse.summary.dealsClosed > 0) parts.push('deals closing');
      if (pulse.trendingCategories.length > 0) {
        parts.push(`trending: ${pulse.trendingCategories.slice(0, 2).join(', ')}`);
      }
      insights.push({
        type: 'activity',
        text: parts.length
          ? `Around ${area.name}: ${parts.join(', ')} this week.`
          : `Trade activity detected in ${area.name} this week.`,
        priority: 'medium',
      });
    } else if (area) {
      insights.push({
        type: 'opportunity',
        text: `${area.name} cluster is onboarding verified suppliers — complete your profile to appear in local matching.`,
        priority: 'low',
      });
    }
  }

  if (projection.intents.length > 0) {
    insights.push({
      type: 'activity',
      text: `Recent intent pattern: ${projection.intents.slice(0, 2).join(', ')}.`,
      priority: 'medium',
    });
  }

  const lastEvent = projection.timeline[projection.timeline.length - 1];
  if (lastEvent) {
    insights.push({
      type: 'activity',
      text: `Last business event: ${lastEvent.label} (${lastEvent.year}).`,
      priority: 'low',
    });
  }

  insights.push({
    type: 'recommendation',
    text: genome.headline,
    priority: 'medium',
  });

  let aiPolish: string[] | undefined;
  if (useAi && insights.length > 0) {
    const llm = await callSeoLlm(
      'You write concise Morning Business Briefs for Indian MSME owners. Use ONLY the facts provided. Return JSON: { "lines": ["...", "..."] } max 5 lines.',
      JSON.stringify({ companyName, genome: genome.overall, insights, events: projection.timeline.slice(-5) }),
      400,
    );
    if (llm) {
      try {
        const parsed = JSON.parse(llm.content.replace(/```json\n?|\n?```/g, ''));
        aiPolish = parsed.lines;
      } catch {
        aiPolish = [llm.content.slice(0, 300)];
      }
    }
  }

  return {
    companyId,
    companyName,
    generatedAt: new Date().toISOString(),
    greeting,
    genomeOverall: genome.overall,
    insights: insights.slice(0, 8),
    aiPolish,
    dataSource: 'bom_only',
  };
}
