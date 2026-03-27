/**
 * Event Listener Service
 * Monitors blockchain events from the TradeEscrow contract and triggers appropriate actions
 */
const logger = require('../utils/logger');
const { queueGSTVerificationTask, queueDeliveryTrackingTask } = require('./taskQueue');
const { verifyGSTRegistration } = require('./gstVerification');
const { trackDelivery } = require('./deliveryTracking');
const pauseService = require('./pauseService');
const { loadConfig } = require('../utils/config');

const config = loadConfig();
const DIRECT_PROCESSING = !config.useMsgQueue;

/**
 * Check if service is paused before processing an event
 * @returns {boolean} True if the service is paused and should not process events
 */
function isServicePaused() {
  if (pauseService.isPausedState()) {
    logger.debug('Event processing skipped - oracle service is paused');
    return true;
  }
  return false;
}

/**
 * Sets up event listeners for the TradeEscrow contract
 * @param {Contract} tradeEscrow The ethers.js Contract instance
 * @param {Provider} provider The ethers.js Provider instance
 */
async function setupEventListeners(tradeEscrow, provider) {
  logger.info('Setting up blockchain event listeners...');
  
  // TradeCreated event
  tradeEscrow.on('TradeCreated', async (tradeId, buyer, seller, amount, token, event) => {
    try {
      if (isServicePaused()) return;
      logger.info(`TradeCreated event detected: tradeId=${tradeId}, buyer=${buyer}, seller=${seller}`);
      
      // Log transaction details
      const txHash = event.transactionHash;
      const blockNumber = event.blockNumber;
      logger.info(`Transaction: ${txHash}, Block: ${blockNumber}`);
      
      // Either queue the task or process it directly
      if (DIRECT_PROCESSING) {
        await verifyGSTRegistration(tradeEscrow, tradeId, buyer, seller);
      } else {
        await queueGSTVerificationTask(tradeId, buyer, seller);
      }
    } catch (error) {
      logger.error(`Error processing TradeCreated event: ${error.message}`, { tradeId, error });
    }
  });

  // TradeFunded event
  tradeEscrow.on('TradeFunded', async (tradeId, amount, event) => {
    try {
      if (isServicePaused()) return;
      logger.info(`TradeFunded event detected: tradeId=${tradeId}, amount=${amount}`);
      
      // If trade is funded, we can double-check GST verification if not already done
      const trade = await tradeEscrow.trades(tradeId);
      
      if (!trade.buyerGSTVerified || !trade.sellerGSTVerified) {
        logger.info(`Re-checking GST verification for funded trade: ${tradeId}`);
        
        if (DIRECT_PROCESSING) {
          await verifyGSTRegistration(tradeEscrow, tradeId, trade.buyer, trade.seller);
        } else {
          await queueGSTVerificationTask(tradeId, trade.buyer, trade.seller);
        }
      }
    } catch (error) {
      logger.error(`Error processing TradeFunded event: ${error.message}`, { tradeId, error });
    }
  });

  // GoodsShipped event
  tradeEscrow.on('GoodsShipped', async (tradeId, shipmentDetails, event) => {
    try {
      if (isServicePaused()) return;
      logger.info(`GoodsShipped event detected: tradeId=${tradeId}`);
      logger.debug(`Shipment details: ${shipmentDetails}`);
      
      // Parse shipment tracking details
      let trackingInfo;
      try {
        trackingInfo = JSON.parse(shipmentDetails);
      } catch (parseError) {
        // If not valid JSON, use as a string
        trackingInfo = { trackingId: shipmentDetails };
        logger.warn(`Shipment details not in JSON format: ${shipmentDetails}`);
      }
      
      // Either queue the task or process it directly
      if (DIRECT_PROCESSING) {
        await trackDelivery(tradeEscrow, tradeId, trackingInfo);
      } else {
        await queueDeliveryTrackingTask(tradeId, trackingInfo);
      }
    } catch (error) {
      logger.error(`Error processing GoodsShipped event: ${error.message}`, { tradeId, error });
    }
  });

  // DeliveryConfirmed event - used for monitoring only
  tradeEscrow.on('DeliveryConfirmed', async (tradeId, confirmer, event) => {
    try {
      if (isServicePaused()) return;
      logger.info(`DeliveryConfirmed event detected: tradeId=${tradeId}, confirmer=${confirmer}`);
    } catch (error) {
      logger.error(`Error processing DeliveryConfirmed event: ${error.message}`, { tradeId, error });
    }
  });

  // TradeDisputed event - used for alerting
  tradeEscrow.on('TradeDisputed', async (tradeId, disputer, disputeReason, event) => {
    try {
      if (isServicePaused()) return;
      logger.warn(`TradeDisputed event detected: tradeId=${tradeId}, disputer=${disputer}, reason=${disputeReason}`);
      // Here we could implement additional logic like notifying administrators
    } catch (error) {
      logger.error(`Error processing TradeDisputed event: ${error.message}`, { tradeId, error });
    }
  });

  // Set up error handling for the provider
  provider.on('error', (error) => {
    logger.error(`Provider error: ${error.message}`);
  });
  
  logger.info('Event listeners configured successfully');
}

module.exports = { setupEventListeners };
