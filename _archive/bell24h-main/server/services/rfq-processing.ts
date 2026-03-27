import { VideoRFQModel } from '../models/VideoRFQ';
import { SupplierModel } from '../models/Supplier';
import { NotificationService } from './notification';
import { AIMatchingService } from './ai-matching';
import { VideoAnalysisService } from './video-analysis';
import { CloudinaryService } from '../utils/cloudinary';

export class RFQProcessingService {
  /**
   * Process a video RFQ by analyzing the video content and finding matching suppliers
   */
  static async processVideoRFQ(rfqId: string) {
    try {
      const videoRFQ = await VideoRFQModel.findById(rfqId);
      if (!videoRFQ) {
        throw new Error('Video RFQ not found');
      }

      // Step 1: Analyze video content
      const videoAnalysis = await VideoAnalysisService.analyze(videoRFQ.videoUrl);

      // Step 2: Extract key requirements and specifications
      const extractedData = {
        productType: videoAnalysis.productType,
        specifications: videoAnalysis.specifications,
        quantities: videoAnalysis.quantities,
        qualityRequirements: videoAnalysis.qualityRequirements,
        timeline: videoAnalysis.timeline
      };

      // Step 3: Find matching suppliers using AI
      const matches = await AIMatchingService.findMatches({
        category: videoRFQ.category,
        requirements: [...videoRFQ.requirements, ...extractedData.specifications],
        budget: videoRFQ.budget,
        quantity: extractedData.quantities,
        timeline: extractedData.timeline
      });

      // Step 4: Update RFQ with matches and extracted data
      videoRFQ.matches = matches.map(match => match.supplierId);
      videoRFQ.status = 'active';
      await videoRFQ.save();

      // Step 5: Notify matched suppliers
      await Promise.all(matches.map(match => 
        NotificationService.notifySupplier(match.supplierId, {
          type: 'new_rfq_match',
          rfqId: videoRFQ.id,
          matchScore: match.score,
          message: 'New video RFQ matching your capabilities'
        })
      ));

      // Step 6: Generate video thumbnail and preview
      await CloudinaryService.generateThumbnail(videoRFQ.videoPublicId);

      return {
        success: true,
        matches: matches.length,
        extractedData
      };

    } catch (error) {
      console.error('Error processing video RFQ:', error);
      
      // Update RFQ status to indicate processing error
      await VideoRFQModel.findByIdAndUpdate(rfqId, {
        status: 'draft',
        processingError: error.message
      });

      throw error;
    }
  }

  /**
   * Re-process an existing video RFQ to find new matches
   */
  static async reprocessRFQ(rfqId: string) {
    try {
      const videoRFQ = await VideoRFQModel.findById(rfqId);
      if (!videoRFQ) {
        throw new Error('Video RFQ not found');
      }

      // Clear existing matches
      videoRFQ.matches = [];
      videoRFQ.status = 'processing';
      await videoRFQ.save();

      // Re-process the RFQ
      return await this.processVideoRFQ(rfqId);

    } catch (error) {
      console.error('Error reprocessing video RFQ:', error);
      throw error;
    }
  }

  /**
   * Update RFQ status and notify relevant parties
   */
  static async updateRFQStatus(rfqId: string, status: string, reason?: string) {
    try {
      const videoRFQ = await VideoRFQModel.findById(rfqId);
      if (!videoRFQ) {
        throw new Error('Video RFQ not found');
      }

      videoRFQ.status = status;
      await videoRFQ.save();

      // Notify buyer of status change
      await NotificationService.notifyUser(videoRFQ.userId, {
        type: 'rfq_status_update',
        rfqId: videoRFQ.id,
        status,
        reason
      });

      return videoRFQ;

    } catch (error) {
      console.error('Error updating RFQ status:', error);
      throw error;
    }
  }
} 