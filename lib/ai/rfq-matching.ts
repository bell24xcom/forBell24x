/**
 * RFQ Matching Service
 * Uses DeepSeek V3.2 via NVIDIA for intelligent RFQ-to-Supplier matching.
 * Replaces: keyword-based algorithmic matching
 * Cost: 90% cheaper than OpenAI GPT-4 embeddings
 */
import { aiClient } from '@/lib/ai-client';

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity?: number;
  unit?: string;
  deadline?: string;
  specifications?: Record<string, any>;
  budget?: number;
  location?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  specialties: string[];
  capabilities: string[];
  location?: string;
  certifications?: string[];
  minOrderValue?: number;
  maxOrderValue?: number;
  rating?: number;
  completedOrders?: number;
}

export interface MatchScore {
  supplierId: string;
  supplierName: string;
  score: number; // 0-100
  reasons: string[];
  categoryMatch: boolean;
  capabilityMatch: boolean;
  locationMatch: boolean;
  budgetMatch: boolean;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export class RFQMatchingService {
  /**
   * Find best matching suppliers for an RFQ using NVIDIA DeepSeek V3.2
   */
  async findMatchingSuppliers(
    rfq: RFQ,
    suppliers: Supplier[],
    options?: { topN?: number; minScore?: number; useEmbeddings?: boolean }
  ): Promise<MatchScore[]> {
    const topN = options?.topN ?? 10;
    const minScore = options?.minScore ?? 60;

    try {
      return await this.nvidiaSemanticMatch(rfq, suppliers, topN, minScore);
    } catch (err) {
      console.warn('[RFQMatchingService] NVIDIA unavailable, using fallback:', err);
      return this.algorithmicMatch(rfq, suppliers, topN, minScore);
    }
  }

  private async nvidiaSemanticMatch(
    rfq: RFQ,
    suppliers: Supplier[],
    topN: number,
    minScore: number
  ): Promise<MatchScore[]> {
    const supplierList = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      specialties: s.specialties,
      capabilities: s.capabilities,
      location: s.location,
      certifications: s.certifications,
      rating: s.rating,
      completedOrders: s.completedOrders,
    }));

    const prompt = `You are a B2B procurement expert for Bell24h.com (India's AI-powered marketplace).
Rank these ${suppliers.length} suppliers for the given RFQ. Respond ONLY with a JSON array.

RFQ:
- Title: ${rfq.title}
- Description: ${rfq.description}
- Category: ${rfq.category}
- Budget: ₹${rfq.budget || 'Not specified'}
- Location: ${rfq.location || 'Not specified'}
- Quantity: ${rfq.quantity ? `${rfq.quantity} ${rfq.unit || 'units'}` : 'Not specified'}
- Specifications: ${rfq.specifications ? JSON.stringify(rfq.specifications) : 'None'}

Suppliers:
${JSON.stringify(supplierList, null, 2)}

Return JSON array (score 0-100, include all with score > ${minScore}):
[{"supplierId":"1","score":92,"reasons":["reason1","reason2"],"categoryMatch":true,"capabilityMatch":true,"locationMatch":false,"budgetMatch":true,"confidenceLevel":"high"}]`;

    const response = await aiClient.createChatCompletion(
      'rfq-matching',
      [{ role: 'user', content: prompt }],
      { temperature: 0.2, maxTokens: 2000 }
    );

    const content = response.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');

    const results: any[] = JSON.parse(jsonMatch[0]);
    return results
      .map(r => {
        const supplier = suppliers.find(s => s.id === r.supplierId);
        if (!supplier) return null;
        return {
          supplierId: supplier.id,
          supplierName: supplier.name,
          score: Math.round(r.score || 50),
          reasons: r.reasons || ['AI semantic match'],
          categoryMatch: r.categoryMatch ?? false,
          capabilityMatch: r.capabilityMatch ?? false,
          locationMatch: r.locationMatch ?? false,
          budgetMatch: r.budgetMatch ?? true,
          confidenceLevel: r.confidenceLevel || (r.score >= 80 ? 'high' : r.score >= 60 ? 'medium' : 'low'),
        } as MatchScore;
      })
      .filter((r): r is MatchScore => r !== null)
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  private algorithmicMatch(rfq: RFQ, suppliers: Supplier[], topN: number, minScore: number): MatchScore[] {
    return suppliers
      .map(s => {
        const categoryMatch = s.category.toLowerCase() === rfq.category.toLowerCase();
        const locationMatch = !rfq.location || !s.location
          ? false
          : rfq.location.toLowerCase() === s.location.toLowerCase();
        const budgetMatch = !rfq.budget || !s.minOrderValue
          ? true
          : rfq.budget >= s.minOrderValue && (!s.maxOrderValue || rfq.budget <= s.maxOrderValue);

        const capabilityKeywords = [...(s.specialties || []), ...(s.capabilities || [])];
        const rfqWords = `${rfq.title} ${rfq.description}`.toLowerCase();
        const capMatch = capabilityKeywords.some(k => rfqWords.includes(k.toLowerCase()));

        let score = 0;
        if (categoryMatch) score += 40;
        else score += 15;
        if (locationMatch) score += 15;
        if (budgetMatch) score += 15;
        if (capMatch) score += 20;
        if (s.rating && s.rating >= 4) score += 10;

        const reasons: string[] = [];
        if (categoryMatch) reasons.push(`Category match: ${s.category}`);
        if (locationMatch) reasons.push(`Same location: ${s.location}`);
        if (capMatch) reasons.push('Capability match found');
        if (s.rating && s.rating >= 4) reasons.push(`High rating: ${s.rating}/5`);

        return {
          supplierId: s.id,
          supplierName: s.name,
          score,
          reasons,
          categoryMatch,
          capabilityMatch: capMatch,
          locationMatch,
          budgetMatch,
          confidenceLevel: score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low',
        } as MatchScore;
      })
      .filter(r => r.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  /**
   * Explain why a supplier matched an RFQ using NVIDIA DeepSeek
   */
  async explainMatch(rfq: RFQ, supplier: Supplier, score: MatchScore): Promise<string> {
    try {
      const response = await aiClient.createChatCompletion(
        'rfq-matching',
        [{
          role: 'user',
          content: `Explain in 2-3 sentences why this supplier is a good match for this RFQ:
RFQ: ${rfq.title} | Category: ${rfq.category}
Supplier: ${supplier.name} | Specialties: ${supplier.specialties.join(', ')}
Match Score: ${score.score}/100 | Reasons: ${score.reasons.join('; ')}
Write for a business buyer.`
        }],
        { temperature: 0.7, maxTokens: 200 }
      );
      return response.choices[0]?.message?.content || 'This supplier matches your requirements.';
    } catch {
      return `${supplier.name} matches your ${rfq.category} RFQ with a ${score.score}% match score.`;
    }
  }
}

export const rfqMatchingService = new RFQMatchingService();
