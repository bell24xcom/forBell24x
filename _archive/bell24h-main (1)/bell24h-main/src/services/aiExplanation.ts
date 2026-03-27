import {
  AIExplanation,
  ExplanationRequest,
  ExplanationResponse,
  AIExplanationConfig,
  RealTimeExplanationUpdate,
} from '@/types/aiExplanation';

class AIExplanationService {
  private config: AIExplanationConfig;
  private cache: Map<string, { data: AIExplanation; timestamp: number }>;
  private wsConnection: WebSocket | null = null;
  private listeners: Set<(update: RealTimeExplanationUpdate) => void>;

  constructor(config: Partial<AIExplanationConfig> = {}) {
    this.config = {
      maxExplanations: 1000,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      retryAttempts: 3,
      accessibilityMode: false,
      enableRealTime: true,
      maxFeatureImportance: 10,
      ...config,
    };
    this.cache = new Map();
    this.listeners = new Set();
  }

  /**
   * Generate AI explanation for a decision
   */
  async generateExplanation(request: ExplanationRequest): Promise<ExplanationResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);

    try {
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          explanation: cached,
          metadata: {
            processingTime: Date.now() - startTime,
            cacheHit: true,
            modelVersion: cached.metadata?.modelVersion || 'unknown',
          },
        };
      }

      // Generate new explanation
      const explanation = await this.callAIExplanationAPI(request);

      // Cache the result
      this.setCache(cacheKey, explanation);

      // Send real-time update if enabled
      if (this.config.enableRealTime) {
        this.broadcastUpdate({
          type: 'new_explanation',
          explanation,
          timestamp: new Date(),
        });
      }

      return {
        success: true,
        explanation,
        metadata: {
          processingTime: Date.now() - startTime,
          cacheHit: false,
          modelVersion: explanation.metadata?.modelVersion || 'unknown',
        },
      };
    } catch (error) {
      console.error('AI Explanation generation failed:', error);
      return {
        success: false,
        error: {
          code: 'EXPLANATION_GENERATION_FAILED',
          message: 'Failed to generate AI explanation',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get explanation history with pagination and filtering
   */
  async getExplanationHistory(
    page: number = 1,
    pageSize: number = 20,
    filters?: any
  ): Promise<{ explanations: AIExplanation[]; totalCount: number; hasMore: boolean }> {
    try {
      const response = await fetch(`/api/ai/explanations?page=${page}&pageSize=${pageSize}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        explanations: data.explanations,
        totalCount: data.totalCount,
        hasMore: data.hasMore,
      };
    } catch (error) {
      console.error('Failed to fetch explanation history:', error);
      throw error;
    }
  }

  /**
   * Get explanation by ID
   */
  async getExplanationById(id: string): Promise<AIExplanation | null> {
    try {
      const response = await fetch(`/api/ai/explanations/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch explanation by ID:', error);
      throw error;
    }
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  initializeRealTimeUpdates(userId?: string): void {
    if (!this.config.enableRealTime) return;

    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/ai-explanations`;
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('AI Explanation WebSocket connected');
        if (userId) {
          this.wsConnection?.send(JSON.stringify({ type: 'subscribe', userId }));
        }
      };

      this.wsConnection.onmessage = event => {
        try {
          const update: RealTimeExplanationUpdate = JSON.parse(event.data);
          this.broadcastUpdate(update);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = error => {
        console.error('AI Explanation WebSocket error:', error);
      };

      this.wsConnection.onclose = () => {
        console.log('AI Explanation WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.config.enableRealTime) {
            this.initializeRealTimeUpdates(userId);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
    }
  }

  /**
   * Subscribe to real-time updates
   */
  subscribeToUpdates(callback: (update: RealTimeExplanationUpdate) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIExplanationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIExplanationConfig {
    return { ...this.config };
  }

  // Private helper methods

  private async callAIExplanationAPI(request: ExplanationRequest): Promise<AIExplanation> {
    const response = await fetch('/api/ai/generate-explanation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private generateCacheKey(request: ExplanationRequest): string {
    return `${request.decisionType}_${JSON.stringify(request.inputData)}_${
      request.detailLevel || 'basic'
    }`;
  }

  private getFromCache(key: string): AIExplanation | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.config.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, explanation: AIExplanation): void {
    // Implement LRU cache eviction if needed
    if (this.cache.size >= this.config.maxExplanations) {
      const oldestKey = this.cache.keys().next().value;
      if (typeof oldestKey === 'string') {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data: explanation,
      timestamp: Date.now(),
    });
  }

  private broadcastUpdate(update: RealTimeExplanationUpdate): void {
    this.listeners.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('Error in update callback:', error);
      }
    });
  }
}

// Export singleton instance
export const aiExplanationService = new AIExplanationService();

// Export class for testing
export { AIExplanationService };
