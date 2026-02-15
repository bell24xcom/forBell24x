/**
 * API Server
 * Provides HTTP endpoints for oracle service control and monitoring
 */
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../utils/logger');
const { loadConfig } = require('../utils/config');
const pauseService = require('./pauseService');
const packageInfo = require('../../package.json');

const config = loadConfig();
let taskQueueService = null;
let server = null;
let tradeEscrowContract = null;

// Middleware
app.use(bodyParser.json());

// Basic authentication middleware
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== config.apiKey) {
    logger.warn('Unauthorized API access attempt', { 
      ip: req.ip, 
      endpoint: req.path 
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

/**
 * Create and configure an Express API server
 * @param {Object} config - Configuration object
 * @param {Object} pauseServiceInstance - Pause service instance
 * @param {Object} taskQueue - Task queue service instance
 * @returns {Object} Object with app and server properties
 */
function createApiServer(config, pauseServiceInstance = pauseService, taskQueue = null) {
  const app = express();
  
  // Middleware
  app.use(bodyParser.json());
  
  // Store task queue reference
  taskQueueService = taskQueue;
  
  return { app, server: null };
}

/**
 * Initialize the API server
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {Object} taskQueue - Task queue service instance
 * @returns {Promise<void>}
 */
async function initializeApiServer(tradeEscrow, taskQueue = null) {
  if (!config.enableApi) {
    logger.info('API server disabled in configuration');
    return;
  }
  
  // Store task queue reference
  taskQueueService = taskQueue;
  
  tradeEscrowContract = tradeEscrow;
  
  // Root endpoint (no auth required)
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Bell24H Oracle API',
      version: packageInfo.version || '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
  
  // Health check endpoint (no auth required)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      paused: pauseService.isPausedState(),
      timestamp: new Date().toISOString()
    });
  });
  
  // Status endpoint (requires auth)
  app.get('/status', authenticateRequest, (req, res) => {
    res.status(200).json({
      status: 'OK',
      paused: pauseService.isPausedState(),
      pauseStatus: pauseService.getPauseStatus(),
      config: {
        networkName: config.networkName,
        contractAddress: config.tradeEscrowAddress,
        oracleAddress: config.oracleAddress,
        useMsgQueue: config.useMsgQueue
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Pause endpoints
  app.post('/pause', authenticateRequest, async (req, res) => {
    const reason = req.body.reason || 'Manual pause via API';
    
    logger.info(`API pause request received: ${reason}`);
    
    try {
      const success = await pauseService.pause(reason, 'api');
      
      if (success) {
        const status = pauseService.getPauseStatus();
        res.status(200).json({
          paused: true,
          reason: reason,
          timestamp: status.timestamp,
          source: 'api',
          message: 'Oracle service paused successfully'
        });
      } else {
        // Already paused case
        const status = pauseService.getPauseStatus();
        res.status(200).json({
          paused: true,
          reason: status.reason,
          timestamp: status.timestamp,
          source: status.source,
          message: 'Oracle service was already paused'
        });
      }
    } catch (error) {
      logger.error(`Error in pause endpoint: ${error.message}`, { error });
      res.status(500).json({
        status: 'error',
        message: `Failed to pause oracle service: ${error.message}`
      });
    }
  });
  
  app.post('/unpause', authenticateRequest, async (req, res) => {
    const reason = req.body.reason || 'Manual unpause via API';
    
    logger.info(`API unpause request received: ${reason}`);
    
    try {
      const success = await pauseService.unpause(reason, 'api');
      
      if (success) {
        res.status(200).json({
          paused: false,
          reason: reason,
          timestamp: Date.now(),
          source: 'api',
          message: 'Oracle service unpaused successfully'
        });
      } else {
        // Already unpaused case
        res.status(200).json({
          paused: false,
          reason: reason,
          timestamp: Date.now(),
          source: 'api',
          message: 'Oracle service was already unpaused'
        });
      }
    } catch (error) {
      logger.error(`Error in unpause endpoint: ${error.message}`, { error });
      res.status(500).json({
        status: 'error',
        message: `Failed to unpause oracle service: ${error.message}`
      });
    }
  });
  
  // Admin endpoints
  app.get('/admin/active-tasks', authenticateRequest, (req, res) => {
    if (!taskQueueService) {
      return res.status(200).json({
        queued: [],
        processing: [],
        failed: [],
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      queued: taskQueueService.getTasksInQueue() || [],
      processing: taskQueueService.getProcessingTasks() || [],
      failed: taskQueueService.getFailedTasks() || [],
      timestamp: new Date().toISOString()
    });
  });
  
  // Start the server
  const port = config.apiPort || 3000;
  server = app.listen(port, () => {
    logger.info(`API server listening on port ${port}`);
  });
  
  // Handle server errors
  server.on('error', (error) => {
    logger.error(`API server error: ${error.message}`, { error });
  });
}

/**
 * Stop the API server
 * @returns {Promise<void>}
 */
function stopApiServer() {
  return new Promise((resolve) => {
    if (server) {
      logger.info('Stopping API server');
      server.close(() => {
        logger.info('API server stopped');
        resolve();
      });
    } else {
      logger.info('API server not running');
      resolve();
    }
  });
}

module.exports = {
  createApiServer,
  initializeApiServer,
  stopApiServer
};
