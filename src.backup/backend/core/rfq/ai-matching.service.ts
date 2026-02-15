import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RFQ } from '../entities/rfq.entity';
import { Supplier } from '../entities/supplier.entity';
import { OpenAIService } from '../services/openai.service';
import { VectorStoreService } from '../services/vector-store.service';

@Injectable()
export class AIMatchingService {
  private readonly logger = new Logger(AIMatchingService.name);
  private readonly config: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly openAIService: OpenAIService,
    private readonly vectorStoreService: VectorStoreService,
  ) {
    this.config = this.configService.get('ai');
  }

  /**
   * Find matching suppliers for an RFQ
   */
  async findMatches(rfq: RFQ, suppliers: Supplier[]): Promise<Array<{ supplier: Supplier; score: number }>> {
    try {
      // Generate embeddings for RFQ
      const rfqEmbedding = await this.openAIService.generateEmbedding(
        this.prepareRFQForEmbedding(rfq),
      );

      // Get supplier embeddings from vector store
      const supplierEmbeddings = await this.vectorStoreService.getSupplierEmbeddings(
        suppliers.map((s) => s.id),
      );

      // Calculate similarity scores
      const matches = await Promise.all(
        suppliers.map(async (supplier) => {
          const supplierEmbedding = supplierEmbeddings[supplier.id];
          const score = await this.calculateSimilarityScore(
            rfqEmbedding,
            supplierEmbedding,
          );

          // Apply business rules and adjustments
          const adjustedScore = await this.adjustScore(score, {
            rfq,
            supplier,
          });

          return {
            supplier,
            score: adjustedScore,
          };
        }),
      );

      // Sort by score and filter by threshold
      return matches
        .filter((match) => match.score >= this.config.matchingThreshold)
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      this.logger.error('Error finding matching suppliers:', error);
      throw error;
    }
  }

  /**
   * Score proposals for an RFQ
   */
  async scoreProposals(rfq: RFQ): Promise<Array<{ proposalId: string; score: number; details: any }>> {
    try {
      const scores = await Promise.all(
        rfq.proposals.map(async (proposal) => {
          // Generate proposal embedding
          const proposalEmbedding = await this.openAIService.generateEmbedding(
            this.prepareProposalForEmbedding(proposal),
          );

          // Generate RFQ embedding
          const rfqEmbedding = await this.openAIService.generateEmbedding(
            this.prepareRFQForEmbedding(rfq),
          );

          // Calculate base score
          const baseScore = await this.calculateSimilarityScore(
            rfqEmbedding,
            proposalEmbedding,
          );

          // Evaluate proposal against criteria
          const criteriaScores = await this.evaluateProposalCriteria(proposal, rfq);

          // Calculate final score
          const finalScore = this.calculateFinalScore(baseScore, criteriaScores);

          return {
            proposalId: proposal.id,
            score: finalScore,
            details: {
              baseScore,
              criteriaScores,
              adjustments: this.getScoreAdjustments(proposal, rfq),
            },
          };
        }),
      );

      return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
      this.logger.error('Error scoring proposals:', error);
      throw error;
    }
  }

  /**
   * Prepare RFQ text for embedding generation
   */
  private prepareRFQForEmbedding(rfq: RFQ): string {
    return `
      Title: ${rfq.title}
      Description: ${rfq.description}
      Requirements: ${rfq.requirements.join(', ')}
      Category: ${rfq.category}
      Budget: ${rfq.budget || 'Not specified'}
    `.trim();
  }

  /**
   * Prepare proposal text for embedding generation
   */
  private prepareProposalForEmbedding(proposal: any): string {
    return `
      Proposal: ${proposal.proposal}
      Price: ${proposal.price}
      Delivery Time: ${proposal.deliveryTime}
      Additional Notes: ${proposal.additionalNotes || ''}
    `.trim();
  }

  /**
   * Calculate similarity score between two embeddings
   */
  private async calculateSimilarityScore(
    embedding1: number[],
    embedding2: number[],
  ): Promise<number> {
    try {
      // Use cosine similarity
      const dotProduct = embedding1.reduce(
        (sum, val, i) => sum + val * embedding2[i],
        0,
      );
      const magnitude1 = Math.sqrt(
        embedding1.reduce((sum, val) => sum + val * val, 0),
      );
      const magnitude2 = Math.sqrt(
        embedding2.reduce((sum, val) => sum + val * val, 0),
      );

      return dotProduct / (magnitude1 * magnitude2);
    } catch (error) {
      this.logger.error('Error calculating similarity score:', error);
      throw error;
    }
  }

  /**
   * Adjust score based on business rules
   */
  private async adjustScore(
    baseScore: number,
    context: { rfq: RFQ; supplier: Supplier },
  ): Promise<number> {
    let adjustedScore = baseScore;

    // Adjust based on supplier performance
    const performanceAdjustment = await this.calculatePerformanceAdjustment(
      context.supplier,
    );
    adjustedScore += performanceAdjustment;

    // Adjust based on category match
    const categoryAdjustment = this.calculateCategoryAdjustment(
      context.rfq,
      context.supplier,
    );
    adjustedScore += categoryAdjustment;

    // Apply any other business rules
    const businessRuleAdjustments = await this.applyBusinessRules(
      context.rfq,
      context.supplier,
    );
    adjustedScore += businessRuleAdjustments;

    // Normalize score to 0-1 range
    return Math.max(0, Math.min(1, adjustedScore));
  }

  /**
   * Calculate performance adjustment based on supplier history
   */
  private async calculatePerformanceAdjustment(supplier: Supplier): Promise<number> {
    // Implementation for performance-based adjustments
    return 0;
  }

  /**
   * Calculate category match adjustment
   */
  private calculateCategoryAdjustment(rfq: RFQ, supplier: Supplier): number {
    // Implementation for category-based adjustments
    return 0;
  }

  /**
   * Apply business rules for score adjustment
   */
  private async applyBusinessRules(
    rfq: RFQ,
    supplier: Supplier,
  ): Promise<number> {
    // Implementation for business rule-based adjustments
    return 0;
  }

  /**
   * Evaluate proposal against criteria
   */
  private async evaluateProposalCriteria(
    proposal: any,
    rfq: RFQ,
  ): Promise<{ [key: string]: number }> {
    // Implementation for criteria evaluation
    return {};
  }

  /**
   * Calculate final score from components
   */
  private calculateFinalScore(
    baseScore: number,
    criteriaScores: { [key: string]: number },
  ): number {
    // Implementation for final score calculation
    return baseScore;
  }

  /**
   * Get score adjustments based on proposal and RFQ
   */
  private getScoreAdjustments(proposal: any, rfq: RFQ): any {
    // Implementation for score adjustments
    return {};
  }
} 