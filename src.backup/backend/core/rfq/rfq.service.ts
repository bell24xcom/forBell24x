import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFQ } from '../entities/rfq.entity';
import { Supplier } from '../entities/supplier.entity';
import { AIMatchingService } from './ai-matching.service';
import { DocumentEncryptionService } from './document-encryption.service';
import { WorkflowService } from './workflow.service';
import { NotificationService } from './notification.service';
import { EventService } from '../services/event.service';

@Injectable()
export class RFQService {
  private readonly logger = new Logger(RFQService.name);

  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly aiMatchingService: AIMatchingService,
    private readonly documentEncryptionService: DocumentEncryptionService,
    private readonly workflowService: WorkflowService,
    private readonly notificationService: NotificationService,
    private readonly eventService: EventService,
  ) {}

  /**
   * Create a new RFQ
   */
  async createRFQ(data: {
    title: string;
    description: string;
    requirements: any[];
    documents: any[];
    deadline: Date;
    budget?: number;
    category: string;
    createdBy: string;
  }): Promise<RFQ> {
    try {
      // Encrypt sensitive documents
      const encryptedDocuments = await Promise.all(
        data.documents.map(async (doc) => ({
          ...doc,
          content: await this.documentEncryptionService.encrypt(doc.content),
        })),
      );

      // Create RFQ
      const rfq = this.rfqRepository.create({
        ...data,
        documents: encryptedDocuments,
        status: 'DRAFT',
        workflowStage: 'CREATION',
      });

      const savedRFQ = await this.rfqRepository.save(rfq);

      // Start workflow
      await this.workflowService.startWorkflow(savedRFQ.id, 'RFQ_CREATION');

      // Notify relevant stakeholders
      await this.notificationService.notifyRFQCreated(savedRFQ);

      // Send event to n8n
      await this.eventService.sendRFQCreated(savedRFQ.id, {
        title: savedRFQ.title,
        description: savedRFQ.description,
        status: savedRFQ.status,
        createdBy: savedRFQ.createdBy,
      });

      return savedRFQ;
    } catch (error) {
      this.logger.error('Error creating RFQ:', error);
      throw error;
    }
  }

  /**
   * Find matching suppliers for an RFQ
   */
  async findMatchingSuppliers(rfqId: string): Promise<Supplier[]> {
    try {
      const rfq = await this.rfqRepository.findOneOrFail({
        where: { id: rfqId },
        relations: ['documents'],
      });

      // Get all active suppliers in the category
      const suppliers = await this.supplierRepository.find({
        where: { status: 'active' },
        relations: ['categories', 'performance_metrics'],
      });

      // Use AI to match suppliers
      const matches = await this.aiMatchingService.findMatches(rfq, suppliers);

      // Update RFQ with matches
      await this.rfqRepository.update(rfqId, {
        matchedSuppliers: matches.map((m) => m.supplierId),
        matchingScore: matches.map((m) => m.score),
      });

      // Notify matched suppliers
      await this.notificationService.notifyMatchedSuppliers(rfq, matches);

      return matches.map((m) => m.supplier);
    } catch (error) {
      this.logger.error('Error finding matching suppliers:', error);
      throw error;
    }
  }

  /**
   * Submit a proposal for an RFQ
   */
  async submitProposal(data: {
    rfqId: string;
    supplierId: string;
    proposal: any;
    documents: any[];
    price: number;
    deliveryTime: number;
  }): Promise<void> {
    try {
      // Encrypt proposal documents
      const encryptedDocuments = await Promise.all(
        data.documents.map(async (doc) => ({
          ...doc,
          content: await this.documentEncryptionService.encrypt(doc.content),
        })),
      );

      // Create proposal
      const proposal = {
        ...data,
        documents: encryptedDocuments,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      };

      // Update RFQ with proposal
      await this.rfqRepository.update(data.rfqId, {
        proposals: () => `proposals || '${JSON.stringify(proposal)}'::jsonb`,
      });

      // Advance workflow
      await this.workflowService.advanceWorkflow(data.rfqId, 'PROPOSAL_SUBMITTED');

      // Notify relevant stakeholders
      await this.notificationService.notifyProposalSubmitted(data.rfqId, proposal);
    } catch (error) {
      this.logger.error('Error submitting proposal:', error);
      throw error;
    }
  }

  /**
   * Evaluate proposals for an RFQ
   */
  async evaluateProposals(rfqId: string): Promise<any> {
    try {
      const rfq = await this.rfqRepository.findOneOrFail({
        where: { id: rfqId },
        relations: ['proposals'],
      });

      // Score proposals using AI
      const scoredProposals = await this.aiMatchingService.scoreProposals(rfq);

      // Update RFQ with scores
      await this.rfqRepository.update(rfqId, {
        proposalScores: scoredProposals,
        status: 'EVALUATED',
      });

      // Advance workflow
      await this.workflowService.advanceWorkflow(rfqId, 'PROPOSALS_EVALUATED');

      // Notify relevant stakeholders
      await this.notificationService.notifyProposalsEvaluated(rfqId, scoredProposals);

      return scoredProposals;
    } catch (error) {
      this.logger.error('Error evaluating proposals:', error);
      throw error;
    }
  }

  /**
   * Get RFQ details
   */
  async getRFQDetails(rfqId: string): Promise<RFQ> {
    try {
      const rfq = await this.rfqRepository.findOneOrFail({
        where: { id: rfqId },
        relations: ['documents', 'proposals', 'matchedSuppliers'],
      });

      // Decrypt documents if user has permission
      if (rfq.documents) {
        rfq.documents = await Promise.all(
          rfq.documents.map(async (doc) => ({
            ...doc,
            content: await this.documentEncryptionService.decrypt(doc.content),
          })),
        );
      }

      return rfq;
    } catch (error) {
      this.logger.error('Error getting RFQ details:', error);
      throw error;
    }
  }

  /**
   * Update RFQ status
   */
  async updateRFQStatus(rfqId: string, status: string): Promise<void> {
    try {
      await this.rfqRepository.update(rfqId, { status });

      // Advance workflow
      await this.workflowService.advanceWorkflow(rfqId, `STATUS_${status}`);

      // Notify relevant stakeholders
      await this.notificationService.notifyRFQStatusChanged(rfqId, status);
    } catch (error) {
      this.logger.error('Error updating RFQ status:', error);
      throw error;
    }
  }

  async updateRFQ(id: string, data: Partial<RFQ>): Promise<RFQ> {
    try {
      await this.rfqRepository.update(id, data);
      const updatedRFQ = await this.rfqRepository.findOne({ where: { id } });

      // Send event to n8n
      await this.eventService.sendRFQUpdated(id, {
        title: updatedRFQ.title,
        description: updatedRFQ.description,
        status: updatedRFQ.status,
        updatedBy: updatedRFQ.updatedBy,
      });

      return updatedRFQ;
    } catch (error) {
      this.logger.error(`Error updating RFQ: ${error.message}`, error.stack);
      throw error;
    }
  }

  async completeRFQ(id: string): Promise<RFQ> {
    try {
      await this.rfqRepository.update(id, { status: 'completed' });
      const completedRFQ = await this.rfqRepository.findOne({ where: { id } });

      // Send event to n8n
      await this.eventService.sendRFQCompleted(id, {
        title: completedRFQ.title,
        description: completedRFQ.description,
        status: completedRFQ.status,
        completedBy: completedRFQ.updatedBy,
        completedAt: completedRFQ.updatedAt,
      });

      return completedRFQ;
    } catch (error) {
      this.logger.error(`Error completing RFQ: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRFQ(id: string): Promise<RFQ> {
    try {
      return await this.rfqRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error(`Error getting RFQ: ${error.message}`, error.stack);
      throw error;
    }
  }

  async listRFQs(): Promise<RFQ[]> {
    try {
      return await this.rfqRepository.find();
    } catch (error) {
      this.logger.error(`Error listing RFQs: ${error.message}`, error.stack);
      throw error;
    }
  }
} 