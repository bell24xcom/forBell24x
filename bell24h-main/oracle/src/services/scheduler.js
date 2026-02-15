/**
 * Scheduler Service
 * Handles periodic tasks such as checking status of pending trades,
 * reprocessing failed verifications, and monitoring system health
 */
const cron = require('node-cron');
const { ethers } = require('ethers');
const logger = require('../utils/logger');
const { loadConfig } = require('../utils/config');
const pauseService = require('./pauseService');

const config = loadConfig();
const activeJobs = new Map();

/**
 * Setup periodic tasks for the oracle service
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 */
function setupPeriodicTasks(tradeEscrow) {
  logger.info('Setting up periodic tasks...');
  
  // Schedule task to retry failed GST verifications (every 2 hours)
  const retryGSTVerificationJob = cron.schedule('0 */2 * * *', async () => {
    try {
      // Skip execution if service is paused
      if (pauseService.isPausedState()) {
        logger.info('Skipping GST verification retry job - service is paused');
        return;
      }
      
      await retryFailedGSTVerifications(tradeEscrow);
    } catch (error) {
      logger.error(`Error in GST verification retry job: ${error.message}`, { error });
    }
  });
  activeJobs.set('retryGSTVerification', retryGSTVerificationJob);
  
  // Schedule task to check for stalled deliveries (daily)
  const checkStalledDeliveriesJob = cron.schedule('0 12 * * *', async () => {
    try {
      // Skip execution if service is paused
      if (pauseService.isPausedState()) {
        logger.info('Skipping stalled deliveries check job - service is paused');
        return;
      }
      
      await checkStalledDeliveries(tradeEscrow);
    } catch (error) {
      logger.error(`Error in stalled deliveries check job: ${error.message}`, { error });
    }
  });
  activeJobs.set('checkStalledDeliveries', checkStalledDeliveriesJob);
  
  // Schedule task to monitor oracle health (every hour) - always runs even when paused
  const monitorHealthJob = cron.schedule('0 * * * *', async () => {
    try {
      // Health monitoring should always run, even when paused
      // We'll include the paused status in the health report
      await monitorOracleHealth(tradeEscrow);
    } catch (error) {
      logger.error(`Error in oracle health monitoring job: ${error.message}`, { error });
    }
  });
  activeJobs.set('monitorHealth', monitorHealthJob);
  
  // Schedule task to sync missed events (every 15 minutes)
  const syncMissedEventsJob = cron.schedule('*/15 * * * *', async () => {
    try {
      // Skip execution if service is paused
      if (pauseService.isPausedState()) {
        logger.info('Skipping event sync job - service is paused');
        return;
      }
      
      await syncMissedEvents(tradeEscrow);
    } catch (error) {
      logger.error(`Error in event sync job: ${error.message}`, { error });
    }
  });
  activeJobs.set('syncMissedEvents', syncMissedEventsJob);
  
  logger.info('Periodic tasks scheduled successfully');
}

/**
 * Retry GST verifications that previously failed
 * @param {Contract} tradeEscrow The TradeEscrow contract instance 
 */
async function retryFailedGSTVerifications(tradeEscrow) {
  logger.info('Running retry job for failed GST verifications');
  
  try {
    // Get pending trades
    // In production, you would maintain a database of failed verifications
    // and attempt to retry them here
    
    // For now, we could query recent trades and check their status
    const currentBlock = await tradeEscrow.provider.getBlockNumber();
    const fromBlock = currentBlock - 10000; // Look back ~1.5 days on Ethereum
    
    const createFilter = tradeEscrow.filters.TradeCreated();
    const events = await tradeEscrow.queryFilter(createFilter, fromBlock, 'latest');
    
    logger.info(`Found ${events.length} recent trade events to check for GST verification`);
    
    // Check each trade's GST verification status
    const { verifyGSTRegistration } = require('./gstVerification');
    
    let retriedCount = 0;
    for (const event of events) {
      try {
        const tradeId = event.args.tradeId;
        const trade = await tradeEscrow.trades(tradeId);
        
        // Check if trade is in an active state but GST verification is pending
        const isActive = [1, 2, 3].includes(parseInt(trade.status.toString())); // Funded, Released, Shipped
        const needsVerification = !trade.buyerGSTVerified || !trade.sellerGSTVerified;
        
        if (isActive && needsVerification) {
          logger.info(`Retrying GST verification for trade ${tradeId}`);
          await verifyGSTRegistration(tradeEscrow, tradeId, trade.buyer, trade.seller);
          retriedCount++;
        }
      } catch (innerError) {
        logger.error(`Error processing trade from event: ${innerError.message}`);
        // Continue with other trades
      }
    }
    
    logger.info(`Completed GST verification retry job. Retried ${retriedCount} trades.`);
  } catch (error) {
    logger.error(`Failed to run GST verification retry job: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Check for stalled deliveries and notify about them
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 */
async function checkStalledDeliveries(tradeEscrow) {
  logger.info('Checking for stalled deliveries');
  
  try {
    const currentBlock = await tradeEscrow.provider.getBlockNumber();
    const fromBlock = currentBlock - 50000; // Look back ~7 days on Ethereum
    
    const shippedFilter = tradeEscrow.filters.GoodsShipped();
    const events = await tradeEscrow.queryFilter(shippedFilter, fromBlock, 'latest');
    
    logger.info(`Found ${events.length} recent shipping events to check for stalled deliveries`);
    
    // Get current time for age calculation
    const now = Date.now();
    const STALL_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    let stalledCount = 0;
    for (const event of events) {
      try {
        const tradeId = event.args.tradeId;
        const trade = await tradeEscrow.trades(tradeId);
        const block = await event.getBlock();
        
        // Check if trade is still in Shipped status
        const isShipped = parseInt(trade.status.toString()) === 3; // 3 = Shipped in the enum
        
        if (isShipped) {
          // Calculate age based on block timestamp
          const deliveryAgeMs = now - (block.timestamp * 1000);
          
          if (deliveryAgeMs > STALL_THRESHOLD_MS) {
            stalledCount++;
            logger.warn(`Stalled delivery detected: Trade ${tradeId} has been in Shipped status for ${Math.floor(deliveryAgeMs / (24 * 60 * 60 * 1000))} days`);
            
            // Here you could implement notification logic:
            // - Email to support team
            // - Alert to monitoring system
            // - Create a support ticket
          }
        }
      } catch (innerError) {
        logger.error(`Error processing shipping event: ${innerError.message}`);
        // Continue with other events
      }
    }
    
    logger.info(`Completed stalled delivery check. Found ${stalledCount} stalled deliveries.`);
  } catch (error) {
    logger.error(`Failed to check for stalled deliveries: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Monitor oracle health and report metrics
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 */
async function monitorOracleHealth(tradeEscrow) {
  logger.info('Monitoring oracle service health');
  
  try {
    // Check blockchain connectivity
    const blockNumber = await tradeEscrow.provider.getBlockNumber();
    const network = await tradeEscrow.provider.getNetwork();
    
    // Check oracle wallet balance
    const signer = tradeEscrow.signer;
    const address = await signer.getAddress();
    const balance = await tradeEscrow.provider.getBalance(address);
    const balanceEth = parseFloat(ethers.utils.formatEther(balance));
    
    // Check pause status
    const isPaused = pauseService.isPausedState();
    const pauseStatus = pauseService.getPauseStatus();
    
    // Log health metrics
    logger.info(`Oracle health check: Connected to network ${network.name} (${network.chainId}), block ${blockNumber}`);
    logger.info(`Oracle address: ${address}, balance: ${balanceEth} ETH`);
    logger.info(`Oracle pause status: ${isPaused ? 'PAUSED' : 'ACTIVE'}${isPaused ? `, reason: ${pauseStatus.reason}` : ''}`);
    
    // Alert if balance is low
    if (balanceEth < 0.1) {
      logger.warn(`Oracle wallet balance is low: ${balanceEth} ETH`);
      // Implement notification logic here
    }
    
    // Check contract connectivity
    const gstWallet = await tradeEscrow.gstAuthorityWallet();
    logger.debug(`Contract connection verified, GST wallet: ${gstWallet}`);
    
    // In a production system, you would store these metrics
    // in a time-series database for monitoring dashboards
    
    logger.info('Oracle health check completed successfully');
  } catch (error) {
    logger.error(`Oracle health check failed: ${error.message}`, { error });
    // This might indicate serious issues with the oracle service
    // Implement alert/notification logic here for urgent attention
    throw error;
  }
}

/**
 * Sync any events that might have been missed during downtime
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 */
async function syncMissedEvents(tradeEscrow) {
  // Skip processing if service is paused
  if (pauseService.isPausedState()) {
    logger.info('Skipping missed events sync - service is paused');
    return;
  }
  
  // In a production system, you would:
  // 1. Store the last processed block for each event type
  // 2. Query for events from that block to the current block
  // 3. Process any events that were missed
  // 4. Update the last processed block
  
  // This is a simplified implementation for demonstration
  logger.info('Checking for missed events');
  
  try {
    // Get the last block we processed (in real system, get from database)
    // For demo, just look back a fixed number of blocks
    const currentBlock = await tradeEscrow.provider.getBlockNumber();
    const lookbackBlocks = 1000; // ~4 hours on Ethereum
    const fromBlock = Math.max(0, currentBlock - lookbackBlocks);
    
    logger.debug(`Checking for missed events from block ${fromBlock} to ${currentBlock}`);
    
    // Process any missed TradeCreated events
    const createdFilter = tradeEscrow.filters.TradeCreated();
    const createdEvents = await tradeEscrow.queryFilter(createdFilter, fromBlock, 'latest');
    
    if (createdEvents.length > 0) {
      logger.info(`Processing ${createdEvents.length} potentially missed TradeCreated events`);
      
      const { verifyGSTRegistration } = require('./gstVerification');
      let processedCount = 0;
      
      for (const event of createdEvents) {
        try {
          const tradeId = event.args.tradeId;
          const buyer = event.args.buyer;
          const seller = event.args.seller;
          
          // Check if this trade needs GST verification
          const trade = await tradeEscrow.trades(tradeId);
          if (!trade.buyerGSTVerified || !trade.sellerGSTVerified) {
            await verifyGSTRegistration(tradeEscrow, tradeId, buyer, seller);
            processedCount++;
          }
        } catch (innerError) {
          logger.error(`Error processing missed TradeCreated event: ${innerError.message}`);
          // Continue with other events
        }
      }
      
      logger.info(`Processed ${processedCount} missed GST verifications`);
    }
    
    // Process any missed GoodsShipped events
    const shippedFilter = tradeEscrow.filters.GoodsShipped();
    const shippedEvents = await tradeEscrow.queryFilter(shippedFilter, fromBlock, 'latest');
    
    if (shippedEvents.length > 0) {
      logger.info(`Processing ${shippedEvents.length} potentially missed GoodsShipped events`);
      
      const { trackDelivery } = require('./deliveryTracking');
      let processedCount = 0;
      
      for (const event of shippedEvents) {
        try {
          const tradeId = event.args.tradeId;
          const shipmentDetails = event.args.shipmentDetails;
          
          // Check if this trade is still in Shipped status
          const trade = await tradeEscrow.trades(tradeId);
          if (parseInt(trade.status.toString()) === 3) { // 3 = Shipped
            let trackingInfo;
            try {
              trackingInfo = JSON.parse(shipmentDetails);
            } catch {
              trackingInfo = { trackingId: shipmentDetails };
            }
            
            await trackDelivery(tradeEscrow, tradeId, trackingInfo);
            processedCount++;
          }
        } catch (innerError) {
          logger.error(`Error processing missed GoodsShipped event: ${innerError.message}`);
          // Continue with other events
        }
      }
      
      logger.info(`Processed ${processedCount} missed delivery trackings`);
    }
    
    // In a real system, you would update the last processed block in your database
    logger.info('Event sync completed successfully');
    
  } catch (error) {
    logger.error(`Failed to sync missed events: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Stop all scheduled jobs
 */
function stopAllJobs() {
  logger.info('Stopping all scheduled jobs');
  
  for (const [name, job] of activeJobs.entries()) {
    logger.debug(`Stopping scheduled job: ${name}`);
    job.stop();
  }
  
  activeJobs.clear();
  logger.info('All scheduled jobs stopped');
}

module.exports = {
  setupPeriodicTasks,
  stopAllJobs
};
