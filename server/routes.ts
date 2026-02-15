import { Express, Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { storage } from './storage.js';
import { setupAuth } from './auth.js';
import { processVoiceRFQ, analyzeSupplierRisk, generateMarketInsights, analyzeRFQ } from './openai.js';
import { createRFQBlockchainRecord, createContractBlockchainRecord, createPaymentBlockchainRecord, getBlockchainTransactionDetails, verifyBlockchainRecord } from './blockchain.js';
import { insertRfqSchema, insertBidSchema, insertContractSchema, insertMessageSchema, insertTransactionSchema } from '../shared/schema';
import analyticsRoutes from './routes/analytics.js';
import analyticsExportRoutes from './routes/analytics-export.js';
import voiceAnalyticsRoutes from './routes/voice-analytics';
import organizationRoutes from './routes/organizations';
import permissionRoutes from './routes/permissions';
import aclRoutes from './routes/acl';
import metricsRoutes from './routes/metrics';
import { handleVideoRFQ, uploadVideoToCloudinary, getSignedUploadParams } from './api/video-rfq';
import { trackVideoActivity, getVideoAnalytics, generateAdaptiveStreaming, generateThumbnail, optimizeVideo, validateVideo } from './api/video-analytics';
import { handleProductShowcase, getProductShowcases, getProductShowcaseById } from './api/product-showcase';
import { registerRoutesSync } from './routes/index';
import { db } from './db';
import { transactions } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { securityMiddleware } from './middleware/securityMiddleware';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Set up analytics routes
  app.use('/api/analytics', analyticsRoutes);

  // Set up analytics export routes
  app.use('/api', analyticsExportRoutes);

  // Register Prometheus metrics endpoint
  app.use('/api', metricsRoutes);

  // Set up voice analytics routes
  app.use('/api', voiceAnalyticsRoutes);

  // Set up organization and team routes
  app.use(organizationRoutes);

  // Set up permission routes
  app.use(permissionRoutes);

  // Set up ACL routes
  app.use('/api/acl', aclRoutes);

  // ===== Video Analytics Routes =====
  app.post('/api/video-rfq/track', async (req, res, next) => {
    try {
      await trackVideoActivity(req, res);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/video-rfq/analytics/:id', async (req, res, next) => {
    try {
      await getVideoAnalytics(req, res);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/video-analytics/generate-streaming', async (req, res, next) => {
    try {
      await generateAdaptiveStreaming(req, res);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/video-analytics/generate-thumbnail', async (req, res, next) => {
    try {
      await generateThumbnail(req, res);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/video-analytics/optimize', async (req, res, next) => {
    try {
      await optimizeVideo(req, res);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/video-analytics/validate', async (req, res, next) => {
    try {
      await validateVideo(req, res);
    } catch (err) {
      next(err);
    }
  });

  // ===== RFQ Routes =====
  app.get('/api/rfqs', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const rfqs = await storage.getAllRFQs();
      res.json(rfqs);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/rfqs/:id', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const rfq = await storage.getRFQ(parseInt(req.params.id));
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      res.json(rfq);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/rfqs', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = insertRfqSchema.parse(req.body);
      const rfq = await storage.createRFQ({
        ...validatedData,
        user_id: req.user!.id
      });

      // Create blockchain record for the RFQ
      if (rfq) {
        try {
          const blockchainHash = await createRFQBlockchainRecord(rfq);
          // Update RFQ with blockchain hash
          await storage.updateRFQ(rfq.id, { blockchain_hash: blockchainHash });
          rfq.blockchain_hash = blockchainHash;
        } catch (blockchainError) {
          console.error('Error creating blockchain record for RFQ:', blockchainError);
          // Continue with the RFQ creation even if blockchain fails
        }
      }

      res.status(201).json(rfq);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/rfqs/:id', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const rfq = await storage.getRFQ(parseInt(req.params.id));
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      // Only allow updates by the RFQ creator
      if (rfq.user_id !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to update this RFQ' });
      }

      const updatedRFQ = await storage.updateRFQ(parseInt(req.params.id), req.body);
      res.json(updatedRFQ);
    } catch (err) {
      next(err);
    }
  });

  // ===== Voice RFQ Route =====
  // Video RFQ and Product Showcase routes
  app.post('/api/rfqs/video', handleVideoRFQ);
  app.post('/api/upload/video', uploadVideoToCloudinary);
  app.get('/api/upload/signed-params', getSignedUploadParams);

  app.post('/api/product-showcase', handleProductShowcase);
  app.get('/api/product-showcase', getProductShowcases);
  app.get('/api/product-showcase/:id', getProductShowcaseById);

  app.post('/api/rfqs/voice', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.body.audioBase64) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      // Extract request parameters
      const {
        audioBase64,
        languagePreference = 'auto',
        enhanceAudio = false
      } = req.body;

      // Process voice RFQ with multilingual support
      const result = await processVoiceRFQ(audioBase64, languagePreference);

      // Create RFQ from the extracted information
      const rfqData = {
        title: result.extractedInfo.title || 'Untitled RFQ',
        description: result.extractedInfo.description || '',
        category: result.extractedInfo.category || 'Other',
        quantity: result.extractedInfo.quantity ? parseInt(result.extractedInfo.quantity, 10) : 1,
        budget: result.extractedInfo.budget ? parseFloat(result.extractedInfo.budget) : null,
        delivery_deadline: result.extractedInfo.deliveryDeadline ? new Date(result.extractedInfo.deliveryDeadline) : null,
        status: 'draft',
        user_id: req.user!.id,
        blockchain_hash: null,
        video_url: null
      } as const;

      const rfq = await storage.createRFQ(rfqData);

      res.status(201).json({
        rfq,
        transcription: result.text,
        detectedLanguage: result.detectedLanguage,
        translatedText: result.translatedText
      });
    } catch (err) {
      next(err);
    }
  });

  // Voice RFQ Processing API (no authentication, for testing purposes)
  app.post('/api/voice-rfq/process', async (req, res) => {
    try {
      // Extract audio data 
      let audioData;
      let languagePreference = 'auto';
      let enhanceAudio = false;

      // Handle form-data upload
      if (req.files && req.files.audio) {
        const audioFile = req.files.audio;
        audioData = audioFile.data.toString('base64');

        // Get other parameters
        languagePreference = req.body.languagePreference || 'auto';
        enhanceAudio = req.body.enhanceAudio === 'true';
      }
      // Handle base64 direct upload
      else if (req.body.audioBase64) {
        audioData = req.body.audioBase64;
        languagePreference = req.body.languagePreference || 'auto';
        enhanceAudio = req.body.enhanceAudio === true;
      } else {
        return res.status(400).json({
          success: false,
          error: 'No audio data provided. Send either form-data with audio file or JSON with audioBase64'
        });
      }

      // Process voice RFQ with multilingual support
      const result = await processVoiceRFQ(audioData, languagePreference);

      // Return successful response
      res.json({
        success: true,
        transcript: result.text,
        detectedLanguage: result.detectedLanguage,
        translatedText: result.translatedText,
        analyzedRfq: result.extractedInfo
      });
    } catch (error) {
      console.error('Error processing voice RFQ:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process voice RFQ'
      });
    }
  });

  // Voice RFQ Listing API for test script
  app.get('/api/voice-rfq', async (req, res) => {
    try {
      // Get RFQs with voice metadata
      const rfqs = await storage.getAllRFQs();
      const voiceRfqs = rfqs.filter(rfq =>
        rfq.metadata &&
        (rfq.metadata.detected_language || rfq.metadata.original_text)
      );

      res.json({
        success: true,
        rfqs: voiceRfqs
      });
    } catch (error) {
      console.error('Error fetching voice RFQs:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch voice RFQs'
      });
    }
  });

  // ===== Bid Routes =====
  app.get('/api/bids', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const rfqId = req.query.rfqId ? parseInt(req.query.rfqId as string) : undefined;
      const supplierId = req.query.supplierId ? parseInt(req.query.supplierId as string) : undefined;

      const bids = await storage.getBids(rfqId, supplierId);
      res.json(bids);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/bids', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Ensure user is a supplier
      if (req.user!.user_type !== 'supplier' && req.user!.user_type !== 'both') {
        return res.status(403).json({ error: 'Only suppliers can create bids' });
      }

      const validatedData = insertBidSchema.parse(req.body);

      // Check if RFQ exists and is open
      const rfq = await storage.getRFQ(validatedData.rfq_id);
      if (!rfq) {
        return res.status(404).json({ error: 'RFQ not found' });
      }

      if (rfq.status !== 'open') {
        return res.status(400).json({ error: 'This RFQ is not open for bids' });
      }

      // Create the bid
      const bid = await storage.createBid({
        ...validatedData,
        supplier_id: req.user!.id
      });

      res.status(201).json(bid);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/bids/:id/status', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.body.status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const bid = await storage.getBid(parseInt(req.params.id));
      if (!bid) {
        return res.status(404).json({ error: 'Bid not found' });
      }

      // Get the RFQ to check permissions
      const rfq = await storage.getRFQ(bid.rfq_id);
      if (!rfq) {
        return res.status(404).json({ error: 'Associated RFQ not found' });
      }

      // Only the RFQ creator can accept/reject bids
      // Only the bid supplier can withdraw their bid
      const isAuthorized =
        (req.body.status === 'accepted' || req.body.status === 'rejected')
          ? rfq.user_id === req.user!.id
          : req.body.status === 'withdrawn'
            ? bid.supplier_id === req.user!.id
            : false;

      if (!isAuthorized) {
        return res.status(403).json({ error: 'Not authorized to update this bid status' });
      }

      // If accepting a bid, update RFQ status to awarded
      if (req.body.status === 'accepted') {
        await storage.updateRFQ(rfq.id, { status: 'awarded' });
      }

      const updatedBid = await storage.updateBidStatus(parseInt(req.params.id), req.body.status);
      res.json(updatedBid);
    } catch (err) {
      next(err);
    }
  });

  // ===== Contract Routes =====
  app.get('/api/contracts', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const contracts = await storage.getUserContracts(req.user!.id);
      res.json(contracts);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/contracts', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = insertContractSchema.parse(req.body);

      // Check if this user is authorized to create this contract
      const rfq = await storage.getRFQ(validatedData.rfq_id);
      const bid = validatedData.bid_id ? await storage.getBid(validatedData.bid_id) : null;

      if (rfq && rfq.user_id !== req.user!.id && validatedData.buyer_id !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to create this contract' });
      }

      const contract = await storage.createContract(validatedData);

      // Create blockchain record for the contract
      if (contract) {
        try {
          const blockchainHash = await createContractBlockchainRecord(contract);
          // Update contract with blockchain hash
          await storage.updateContractStatus(contract.id, contract.status);
          contract.blockchain_hash = blockchainHash;
        } catch (blockchainError) {
          console.error('Error creating blockchain record for contract:', blockchainError);
          // Continue with the contract creation even if blockchain fails
        }
      }

      res.status(201).json(contract);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/contracts/:id/status', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.body.status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const contract = await storage.getContract(parseInt(req.params.id));
      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }

      // Check if user is authorized to update this contract
      const isParticipant =
        contract.buyer_id === req.user!.id ||
        contract.supplier_id === req.user!.id;

      if (!isParticipant) {
        return res.status(403).json({ error: 'Not authorized to update this contract' });
      }

      const updatedContract = await storage.updateContractStatus(parseInt(req.params.id), req.body.status);
      res.json(updatedContract);
    } catch (err) {
      next(err);
    }
  });

  // ===== Message Routes =====
  app.get('/api/messages', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const otherUserId = req.query.otherUserId ? parseInt(req.query.otherUserId as string) : undefined;
      const rfqId = req.query.rfqId ? parseInt(req.query.rfqId as string) : undefined;
      const bidId = req.query.bidId ? parseInt(req.query.bidId as string) : undefined;

      const messages = await storage.getUserMessages(req.user!.id, otherUserId, rfqId, bidId);
      res.json(messages);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/messages', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = insertMessageSchema.parse(req.body);

      // Ensure sender is the current user
      if (validatedData.sender_id !== req.user!.id) {
        return res.status(403).json({ error: 'You can only send messages as yourself' });
      }

      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/messages/:id/status', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.body.status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const message = await storage.getMessage(parseInt(req.params.id));
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Only recipient can mark message as read/delivered
      if (message.recipient_id !== req.user!.id) {
        return res.status(403).json({ error: 'Not authorized to update this message status' });
      }

      const updatedMessage = await storage.updateMessageStatus(parseInt(req.params.id), req.body.status);
      res.json(updatedMessage);
    } catch (err) {
      next(err);
    }
  });

  // ===== Transaction Routes =====
  app.get('/api/transactions', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const transactions = await storage.getUserTransactions(req.user!.id);
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/transactions', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = insertTransactionSchema.parse(req.body);

      // Ensure user is the transaction creator
      if (validatedData.user_id !== req.user!.id) {
        return res.status(403).json({ error: 'You can only create transactions for yourself' });
      }

      // Generate reference number
      const reference = `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // Create transaction
      const transaction = await storage.createTransaction({
        ...validatedData,
        reference_number: reference
      });

      // Update user wallet balance
      const user = await storage.getUser(req.user!.id);
      if (user) {
        let newBalance = user.wallet_balance;

        if (validatedData.type === 'deposit' || validatedData.type === 'refund') {
          newBalance += parseFloat(validatedData.amount.toString());
        } else if (validatedData.type === 'withdrawal' || validatedData.type === 'payment' || validatedData.type === 'fee') {
          newBalance -= parseFloat(validatedData.amount.toString());
        }

        await storage.updateUserWalletBalance(req.user!.id, newBalance);
      }

      // Create blockchain record for the transaction
      if (transaction) {
        try {
          const blockchainHash = await createPaymentBlockchainRecord(transaction);
          // Update transaction with blockchain hash
          const [updatedTransaction] = await db
            .update(transactions)
            .set({ blockchain_hash: blockchainHash })
            .where(eq(transactions.id, transaction.id))
            .returning();

          transaction.blockchain_hash = blockchainHash;
        } catch (blockchainError) {
          console.error('Error creating blockchain record for transaction:', blockchainError);
          // Continue with the transaction even if blockchain fails
        }
      }

      res.status(201).json(transaction);
    } catch (err) {
      next(err);
    }
  });

  // ===== Analytics and AI Routes =====
  app.post('/api/analytics/supplier-risk', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.body.supplier_id) {
        return res.status(400).json({ error: 'Supplier ID is required' });
      }

      // Get supplier data - in a real implementation, this would fetch actual supplier data
      const supplierData = {
        supplier: `Supplier ${req.body.supplier_id}`,
        company: 'Sample Company Ltd.',
        industry: req.body.industry || 'Manufacturing',
        years_in_business: req.body.years_in_business || 5,
        previous_contracts: req.body.previous_contracts || 12,
        delivery_performance: req.body.delivery_performance || 85,
      };

      const riskAnalysis = await analyzeSupplierRisk(supplierData);

      // If this is a real supplier in the database, update their risk score
      try {
        const supplier = await storage.getSupplierByUserId(parseInt(req.body.supplier_id));
        if (supplier) {
          await storage.updateSupplierRiskScore(supplier.id, riskAnalysis.risk_score);
        }
      } catch (err) {
        console.error('Error updating supplier risk score:', err);
        // Continue even if updating the score fails
      }

      res.json(riskAnalysis);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/analytics/market-insights/:industry', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const industry = req.params.industry;
      const insights = await generateMarketInsights(industry);

      res.json(insights);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/analytics/analyze-rfq', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.body.rfq_text) {
        return res.status(400).json({ error: 'RFQ text is required' });
      }

      const analysis = await analyzeRFQ(req.body.rfq_text);

      res.json(analysis);
    } catch (err) {
      next(err);
    }
  });

  // ===== GSTIN Blockchain Verification API =====
  app.post('/api/verification/submit', async (req, res, next) => {
    try {
      const { gstin, businessAddress, metadataURI } = req.body;
      if (!gstin || !businessAddress) {
        return res.status(400).json({ success: false, error: 'GSTIN and businessAddress are required.' });
      }
      // Import utility inline to avoid circular deps
      const { submitGSTINForBlockchainVerification } = require('./utils/gstValidation');
      const result = await submitGSTINForBlockchainVerification(gstin, businessAddress, metadataURI || '');
      if (result.success) {
        res.json({ success: true, transactionHash: result.transactionHash });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/verification/status', async (req, res, next) => {
    try {
      const { gstin, address } = req.query;
      if (!gstin || !address) {
        return res.status(400).json({ error: 'gstin and address are required as query params.' });
      }
      // Import utility inline to avoid circular deps
      const { checkGSTINBlockchainVerification } = require('./utils/gstValidation');
      const status = await checkGSTINBlockchainVerification(gstin as string, address as string);
      res.json(status);
    } catch (err) {
      next(err);
    }
  });

  // ===== Blockchain Verification Routes =====
  app.get('/api/blockchain/:hash', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const details = await getBlockchainTransactionDetails(req.params.hash);
      res.json(details);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/blockchain/verify', async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!req.body.hash || !req.body.data) {
        return res.status(400).json({ error: 'Hash and data are required' });
      }

      const verified = await verifyBlockchainRecord(req.body.hash, req.body.data);
      res.json({ verified });
    } catch (err) {
      next(err);
    }
  });

  // Apply security middleware to all authenticated routes
  app.use('/api', (req, res, next) => {
    if (req.isAuthenticated()) {
      securityMiddleware.checkDeviceRisk(req, res, () => {
        securityMiddleware.verifyDeviceAndMFA(req, res, next);
      });
    } else {
      next();
    }
  });

  // Apply transaction validation middleware to transaction routes
  app.use('/api/transactions', (req, res, next) => {
    if (req.isAuthenticated()) {
      securityMiddleware.validateTransaction(req, res, next);
    } else {
      next();
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}