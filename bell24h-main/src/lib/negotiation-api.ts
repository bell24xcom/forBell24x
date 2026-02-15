/**
 * Negotiation API Integration
 * Connects frontend to existing backend negotiation services
 */

export interface NegotiationInput {
  rfqId: string;
  initialOffer: number;
  minAcceptable: number;
  maxAcceptable: number;
  deliveryTerms?: string;
  contractTerms?: string;
  context?: string;
}

export interface NegotiationResult {
  accepted: boolean;
  finalPrice: number;
  counterOffer?: number;
  explanation: string;
  negotiationHistory: Array<{
    party: string;
    offer: number;
    message: string;
  }>;
}

export interface NegotiationMessage {
  id: string;
  sender: 'buyer' | 'supplier' | 'ai';
  message: string;
  offer?: number;
  timestamp: string;
  isAISuggestion?: boolean;
}

export interface Negotiation {
  id: string;
  rfqId: string;
  buyerId: string;
  supplierId: string;
  status: 'active' | 'completed' | 'cancelled';
  currentOffer: number;
  counterOffer?: number;
  messages: NegotiationMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Run AI-powered negotiation
 */
export async function runNegotiation(input: NegotiationInput): Promise<NegotiationResult> {
  try {
    const response = await fetch('/api/negotiation/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error running negotiation:', error);
    throw new Error('Failed to run negotiation');
  }
}

/**
 * Get negotiation explanation
 */
export async function getNegotiationExplanation(
  input: NegotiationInput, 
  finalPrice: number
): Promise<string> {
  try {
    const response = await fetch('/api/negotiation/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...input, finalPrice }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.explanation || 'No explanation available';
  } catch (error) {
    console.error('Error getting negotiation explanation:', error);
    return 'Failed to get explanation';
  }
}

/**
 * Get all negotiations for a user
 */
export async function getNegotiations(userId: string): Promise<Negotiation[]> {
  try {
    const response = await fetch(`/api/negotiation/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.negotiations || [];
  } catch (error) {
    console.error('Error getting negotiations:', error);
    return [];
  }
}

/**
 * Get specific negotiation by ID
 */
export async function getNegotiation(negotiationId: string): Promise<Negotiation | null> {
  try {
    const response = await fetch(`/api/negotiation/${negotiationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.negotiation || null;
  } catch (error) {
    console.error('Error getting negotiation:', error);
    return null;
  }
}

/**
 * Send a message in negotiation
 */
export async function sendNegotiationMessage(
  negotiationId: string,
  message: string,
  offer?: number
): Promise<NegotiationMessage> {
  try {
    const response = await fetch(`/api/negotiation/${negotiationId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, offer }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.message;
  } catch (error) {
    console.error('Error sending negotiation message:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Accept an offer in negotiation
 */
export async function acceptOffer(negotiationId: string, offer: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/negotiation/${negotiationId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ offer }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error accepting offer:', error);
    return false;
  }
}

/**
 * Reject an offer in negotiation
 */
export async function rejectOffer(negotiationId: string, reason?: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/negotiation/${negotiationId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error rejecting offer:', error);
    return false;
  }
}

/**
 * Create a new negotiation
 */
export async function createNegotiation(
  rfqId: string,
  buyerId: string,
  supplierId: string,
  initialOffer: number
): Promise<Negotiation | null> {
  try {
    const response = await fetch('/api/negotiation/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rfqId,
        buyerId,
        supplierId,
        initialOffer,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.negotiation || null;
  } catch (error) {
    console.error('Error creating negotiation:', error);
    return null;
  }
}

/**
 * Get AI suggestions for negotiation
 */
export async function getAISuggestions(
  negotiationId: string,
  context: string
): Promise<{
  suggestion: string;
  recommendedOffer?: number;
  confidence: number;
}> {
  try {
    const response = await fetch(`/api/negotiation/${negotiationId}/ai-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.suggestion || {
      suggestion: 'No AI suggestions available',
      confidence: 0
    };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return {
      suggestion: 'Failed to get AI suggestions',
      confidence: 0
    };
  }
}
