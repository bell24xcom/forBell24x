/**
 * Task Queue Service
 * Provides functionality for queuing tasks using a message queue or in-memory queue
 * for better scalability and distribution of oracle tasks
 */
const amqplib = require('amqplib');
const logger = require('../utils/logger');
const { loadConfig } = require('../utils/config');
const pauseService = require('./pauseService');

const config = loadConfig();

// In-memory queue for simpler deployments
const inMemoryQueue = {
  gstVerification: [],
  deliveryTracking: []
};

// Connection to message broker
let connection = null;
let channel = null;

/**
 * Initialize the message queue connection
 * @returns {Promise<void>}
 */
async function initializeMessageQueue() {
  if (!config.useMsgQueue) {
    logger.info('Message queue disabled, using in-memory queue');
    return;
  }
  
  try {
    logger.info(`Connecting to message queue at ${config.msgQueueUrl}`);
    
    connection = await amqplib.connect(config.msgQueueUrl);
    channel = await connection.createChannel();
    
    // Define queues with durability for task persistence
    await channel.assertQueue('gst-verification', { durable: true });
    await channel.assertQueue('delivery-tracking', { durable: true });
    
    logger.info('Message queue connection established');
    
    // Set up error handling and reconnection
    connection.on('error', async (err) => {
      logger.error(`Message queue connection error: ${err.message}`);
      await reconnectMessageQueue();
    });
    
    connection.on('close', async () => {
      logger.warn('Message queue connection closed, attempting to reconnect');
      await reconnectMessageQueue();
    });
    
  } catch (error) {
    logger.error(`Failed to connect to message queue: ${error.message}`);
    logger.info('Falling back to in-memory queue');
  }
}

/**
 * Attempt to reconnect to the message queue
 * @returns {Promise<void>}
 */
async function reconnectMessageQueue() {
  // Implement exponential backoff
  let retryDelay = 1000; // Start with 1 second
  const maxRetries = 10;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempting to reconnect to message queue (attempt ${attempt}/${maxRetries})`);
      
      // Clean up any existing connections
      if (channel) {
        try { await channel.close(); } catch (e) { /* ignore */ }
      }
      if (connection) {
        try { await connection.close(); } catch (e) { /* ignore */ }
      }
      
      // Try to establish new connection
      connection = await amqplib.connect(config.msgQueueUrl);
      channel = await connection.createChannel();
      
      // Re-assert queues
      await channel.assertQueue('gst-verification', { durable: true });
      await channel.assertQueue('delivery-tracking', { durable: true });
      
      logger.info('Successfully reconnected to message queue');
      
      // Set up error handlers again
      connection.on('error', async (err) => {
        logger.error(`Message queue connection error: ${err.message}`);
        await reconnectMessageQueue();
      });
      
      connection.on('close', async () => {
        logger.warn('Message queue connection closed, attempting to reconnect');
        await reconnectMessageQueue();
      });
      
      return;
    } catch (error) {
      logger.error(`Failed to reconnect (attempt ${attempt}): ${error.message}`);
      
      if (attempt < maxRetries) {
        // Wait before next attempt with exponential backoff
        logger.info(`Waiting ${retryDelay}ms before next reconnection attempt`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay = Math.min(retryDelay * 2, 60000); // Double delay up to max 1 minute
      } else {
        logger.error(`Max reconnection attempts reached. Falling back to in-memory queue.`);
        // We'll continue without a message queue, using in-memory
      }
    }
  }
}

/**
 * Queue a GST verification task
 * @param {string} tradeId The trade identifier
 * @param {string} buyer The buyer's Ethereum address
 * @param {string} seller The seller's Ethereum address
 * @returns {Promise<boolean>} Whether the task was successfully queued
 */
async function queueGSTVerificationTask(tradeId, buyer, seller) {
  // Check if service is paused before queueing new tasks
  if (pauseService.isPausedState()) {
    logger.debug(`GST verification task for trade ${tradeId} not queued - service is paused`);
    return false;
  }
  
  const task = {
    tradeId,
    buyer,
    seller,
    timestamp: Date.now()
  };
  
  try {
    if (config.useMsgQueue && channel) {
      // Use message queue
      await channel.sendToQueue(
        'gst-verification',
        Buffer.from(JSON.stringify(task)),
        { persistent: true }
      );
      logger.debug(`GST verification task queued for trade ${tradeId} in message queue`);
    } else {
      // Use in-memory queue
      inMemoryQueue.gstVerification.push(task);
      logger.debug(`GST verification task queued for trade ${tradeId} in memory`);
      
      // For in-memory queue, we might want to process it immediately in a non-blocking way
      setTimeout(() => {
        processInMemoryGSTVerificationTask(task);
      }, 100);
    }
    
    return true;
  } catch (error) {
    logger.error(`Failed to queue GST verification task: ${error.message}`, { tradeId, error });
    return false;
  }
}

/**
 * Queue a delivery tracking task
 * @param {string} tradeId The trade identifier
 * @param {Object} trackingInfo Tracking information
 * @returns {Promise<boolean>} Whether the task was successfully queued
 */
async function queueDeliveryTrackingTask(tradeId, trackingInfo) {
  // Check if service is paused before queueing new tasks
  if (pauseService.isPausedState()) {
    logger.debug(`Delivery tracking task for trade ${tradeId} not queued - service is paused`);
    return false;
  }
  
  const task = {
    tradeId,
    trackingInfo,
    timestamp: Date.now()
  };
  
  try {
    if (config.useMsgQueue && channel) {
      // Use message queue
      await channel.sendToQueue(
        'delivery-tracking',
        Buffer.from(JSON.stringify(task)),
        { persistent: true }
      );
      logger.debug(`Delivery tracking task queued for trade ${tradeId} in message queue`);
    } else {
      // Use in-memory queue
      inMemoryQueue.deliveryTracking.push(task);
      logger.debug(`Delivery tracking task queued for trade ${tradeId} in memory`);
      
      // For in-memory queue, we might want to process it immediately in a non-blocking way
      setTimeout(() => {
        processInMemoryDeliveryTrackingTask(task);
      }, 100);
    }
    
    return true;
  } catch (error) {
    logger.error(`Failed to queue delivery tracking task: ${error.message}`, { tradeId, error });
    return false;
  }
}

/**
 * Process an in-memory GST verification task
 * @param {Object} task The task to process
 * @returns {Promise<void>}
 */
async function processInMemoryGSTVerificationTask(task) {
  try {
    logger.debug(`Processing in-memory GST verification task for trade ${task.tradeId}`);
    
    // This requires circular dependency handling
    // In a real implementation, we'd use dependency injection or a more sophisticated architecture
    const gstVerification = require('./gstVerification');
    
    // Get the contract instance
    // In a real implementation, this would be passed in or retrieved from a service
    const ethers = require('ethers');
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(config.oraclePrivateKey, provider);
    const tradeEscrow = new ethers.Contract(
      config.tradeEscrowAddress,
      config.tradeEscrowAbi,
      wallet
    );
    
    // Process the task
    await gstVerification.verifyGSTRegistration(
      tradeEscrow,
      task.tradeId,
      task.buyer,
      task.seller
    );
    
    // Remove from queue
    const index = inMemoryQueue.gstVerification.findIndex(t => t.tradeId === task.tradeId);
    if (index !== -1) {
      inMemoryQueue.gstVerification.splice(index, 1);
    }
    
    logger.debug(`Completed in-memory GST verification task for trade ${task.tradeId}`);
  } catch (error) {
    logger.error(`Error processing in-memory GST verification task: ${error.message}`, { task, error });
  }
}

/**
 * Process an in-memory delivery tracking task
 * @param {Object} task The task to process
 * @returns {Promise<void>}
 */
async function processInMemoryDeliveryTrackingTask(task) {
  try {
    logger.debug(`Processing in-memory delivery tracking task for trade ${task.tradeId}`);
    
    // This requires circular dependency handling
    // In a real implementation, we'd use dependency injection or a more sophisticated architecture
    const deliveryTracking = require('./deliveryTracking');
    
    // Get the contract instance
    // In a real implementation, this would be passed in or retrieved from a service
    const ethers = require('ethers');
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const wallet = new ethers.Wallet(config.oraclePrivateKey, provider);
    const tradeEscrow = new ethers.Contract(
      config.tradeEscrowAddress,
      config.tradeEscrowAbi,
      wallet
    );
    
    // Process the task
    await deliveryTracking.trackDelivery(
      tradeEscrow,
      task.tradeId,
      task.trackingInfo
    );
    
    // Remove from queue
    const index = inMemoryQueue.deliveryTracking.findIndex(t => t.tradeId === task.tradeId);
    if (index !== -1) {
      inMemoryQueue.deliveryTracking.splice(index, 1);
    }
    
    logger.debug(`Completed in-memory delivery tracking task for trade ${task.tradeId}`);
  } catch (error) {
    logger.error(`Error processing in-memory delivery tracking task: ${error.message}`, { task, error });
  }
}

/**
 * Start the message queue consumers
 * @returns {Promise<void>}
 */
async function startMessageQueueConsumers() {
  if (!config.useMsgQueue || !channel) {
    logger.info('Message queue consumers not started (using in-memory queue)');
    return;
  }
  
  // Register pause state change listener to pause/resume consumers
  const unregisterListener = pauseService.onPauseStateChange(async (paused) => {
    try {
      if (paused && channel) {
        // When paused, we should stop consuming but maintain the connection
        logger.info('Pausing message queue consumers due to pause state change');
        try {
          // We can tell the channel to stop consuming without closing connection
          // Implementation depends on how consumer tags are managed
          // This is a simplified approach - in production you might want more granular control
          await channel.cancel('gst-verification-consumer');
          await channel.cancel('delivery-tracking-consumer');
        } catch (err) {
          logger.error(`Error pausing message queue consumers: ${err.message}`);
        }
      } else if (!paused && channel) {
        // When unpaused, restart consumers
        logger.info('Resuming message queue consumers after unpause');
        try {
          await _startConsumers();
        } catch (err) {
          logger.error(`Error resuming message queue consumers: ${err.message}`);
        }
      }
    } catch (error) {
      logger.error(`Error handling pause state change in message queue: ${error.message}`);
    }
  });
  
  try {
    logger.info('Starting message queue consumers');
    
    // Extract consumer start logic to a separate function for reuse
    await _startConsumers();
  } catch (error) {
    logger.error(`Failed to start message queue consumers: ${error.message}`, { error });
  }
}

/**
 * Internal function to start message queue consumers
 * @returns {Promise<void>}
 */
async function _startConsumers() {
  if (!channel) {
    logger.warn('Cannot start consumers - no channel available');
    return;
  }
  
  // Skip starting consumers if service is paused
  if (pauseService.isPausedState()) {
    logger.info('Not starting message queue consumers - service is paused');
    return;
  }
    
  try {
    
    // GST Verification consumer
    await channel.consume('gst-verification', async (msg) => {
      try {
        if (!msg) return;
        
        const task = JSON.parse(msg.content.toString());
        logger.debug(`Received GST verification task for trade ${task.tradeId}`);
        
        // Get the modules we need
        const gstVerification = require('./gstVerification');
        
        // Get the contract instance
        const ethers = require('ethers');
        const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(config.oraclePrivateKey, provider);
        const tradeEscrow = new ethers.Contract(
          config.tradeEscrowAddress,
          config.tradeEscrowAbi,
          wallet
        );
        
        // Process the task
        await gstVerification.verifyGSTRegistration(
          tradeEscrow,
          task.tradeId,
          task.buyer,
          task.seller
        );
        
        // Acknowledge the message
        channel.ack(msg);
        logger.debug(`Completed GST verification task for trade ${task.tradeId} from queue`);
      } catch (error) {
        logger.error(`Error processing GST verification message: ${error.message}`, { error });
        
        // Reject the message and requeue if it's not a parsing error
        if (error instanceof SyntaxError) {
          // Bad message format, don't requeue
          channel.nack(msg, false, false);
        } else {
          // Other error, requeue if not tried too many times
          // This would need more robust handling in production
          channel.nack(msg, false, true);
        }
      }
    }, { noAck: false });
    
    // Delivery Tracking consumer
    await channel.consume('delivery-tracking', async (msg) => {
      try {
        if (!msg) return;
        
        const task = JSON.parse(msg.content.toString());
        logger.debug(`Received delivery tracking task for trade ${task.tradeId}`);
        
        // Get the modules we need
        const deliveryTracking = require('./deliveryTracking');
        
        // Get the contract instance
        const ethers = require('ethers');
        const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
        const wallet = new ethers.Wallet(config.oraclePrivateKey, provider);
        const tradeEscrow = new ethers.Contract(
          config.tradeEscrowAddress,
          config.tradeEscrowAbi,
          wallet
        );
        
        // Process the task
        await deliveryTracking.trackDelivery(
          tradeEscrow,
          task.tradeId,
          task.trackingInfo
        );
        
        // Acknowledge the message
        channel.ack(msg);
        logger.debug(`Completed delivery tracking task for trade ${task.tradeId} from queue`);
      } catch (error) {
        logger.error(`Error processing delivery tracking message: ${error.message}`, { error });
        
        // Similar error handling as above
        if (error instanceof SyntaxError) {
          channel.nack(msg, false, false);
        } else {
          channel.nack(msg, false, true);
        }
      }
    }, { noAck: false });
    
    logger.info('Message queue consumers started successfully');
  } catch (error) {
    logger.error(`Failed to start message queue consumers: ${error.message}`, { error });
  }
}

module.exports = {
  initializeMessageQueue,
  queueGSTVerificationTask,
  queueDeliveryTrackingTask,
  startMessageQueueConsumers
};
