import fetch from 'node-fetch';

export type NegotiationInput = {
  rfqId: string;
  buyerId: string;
  supplierId: string;
  initialOffer: number;
  minAcceptable: number;
  maxAcceptable: number;
  deliveryTerms?: string;
  contractTerms?: string;
  context?: string;
};

export type NegotiationResult = {
  accepted: boolean;
  finalPrice: number;
  counterOffer?: number;
  explanation: string;
  negotiationHistory: Array<{party: string; offer: number; message: string}>;
};

/**
 * Simulate autonomous negotiation using OpenAI (or Hugging Face) and SHAP/LIME for transparency.
 */
export async function runNegotiation(input: NegotiationInput): Promise<NegotiationResult> {
  // Step 1: Compose prompt for negotiation
  const prompt = `A negotiation is taking place for RFQ ${input.rfqId}.\n\nBuyer initial offer: ${input.initialOffer}\nSupplier acceptable range: ${input.minAcceptable}-${input.maxAcceptable}\nDelivery terms: ${input.deliveryTerms || 'standard'}\nContract terms: ${input.contractTerms || 'standard'}\nContext: ${input.context || 'N/A'}\n\nNegotiate the best price and terms for both parties. Respond with a JSON object: {accepted, finalPrice, counterOffer, explanation, negotiationHistory}`;

  // Step 2: Call OpenAI/HuggingFace API (placeholder, replace with real call)
  // Here we simulate a negotiation
  const negotiationHistory = [
    { party: 'buyer', offer: input.initialOffer, message: 'Initial offer' },
    { party: 'supplier', offer: input.maxAcceptable, message: 'Counter offer' },
    { party: 'buyer', offer: (input.initialOffer + input.maxAcceptable) / 2, message: 'Midpoint offer' },
    { party: 'supplier', offer: (input.initialOffer + input.maxAcceptable) / 2, message: 'Accepted midpoint' }
  ];
  return {
    accepted: true,
    finalPrice: (input.initialOffer + input.maxAcceptable) / 2,
    counterOffer: undefined,
    explanation: 'Negotiation reached a fair midpoint based on buyer and supplier preferences. SHAP/LIME can be used to explain the rationale behind the final price.',
    negotiationHistory
  };
}

// (Optional) Add SHAP/LIME call for transparency
export async function getNegotiationExplanation(input: NegotiationInput, finalPrice: number) {
  const resp = await fetch('http://localhost:8008/explain/shap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `Negotiation for RFQ ${input.rfqId} with final price ${finalPrice}` })
  });
  return resp.ok ? await resp.json() : { error: 'Explainability service unavailable' };
}
