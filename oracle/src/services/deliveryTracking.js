/**
 * Delivery Tracking Service
 * Handles verification of package delivery status with logistics provider APIs
 * and updates the contract when delivery is confirmed
 */
const axios = require('axios');
const logger = require('../utils/logger');
const { loadConfig } = require('../utils/config');

const config = loadConfig();
const activeTrackings = new Map(); // Maps tradeId to tracking information and interval IDs

/**
 * Start tracking delivery status for a trade
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {string} tradeId The trade identifier
 * @param {Object} trackingInfo Tracking information including carrier and tracking number
 */
async function trackDelivery(tradeEscrow, tradeId, trackingInfo) {
  try {
    logger.info(`Starting delivery tracking for trade ${tradeId}`);
    logger.debug(`Tracking info: ${JSON.stringify(trackingInfo)}`);
    
    // First check if this trade is already being tracked
    if (activeTrackings.has(tradeId)) {
      logger.info(`Trade ${tradeId} is already being tracked, updating tracking info`);
      // Update the tracking info but don't start a new interval
      const existing = activeTrackings.get(tradeId);
      existing.trackingInfo = trackingInfo;
      return;
    }
    
    // Initial check of delivery status
    const status = await checkDeliveryStatus(trackingInfo);
    logger.info(`Initial delivery status for trade ${tradeId}: ${status}`);
    
    // If already delivered, confirm immediately
    if (status === 'DELIVERED') {
      await confirmDeliveryOnContract(tradeEscrow, tradeId);
      return;
    }
    
    // Otherwise set up polling at the configured interval
    const intervalId = setInterval(async () => {
      try {
        const currentStatus = await checkDeliveryStatus(trackingInfo);
        logger.debug(`Delivery status update for trade ${tradeId}: ${currentStatus}`);
        
        if (currentStatus === 'DELIVERED') {
          // Confirm delivery on the contract
          await confirmDeliveryOnContract(tradeEscrow, tradeId);
          
          // Clean up the interval
          clearInterval(intervalId);
          activeTrackings.delete(tradeId);
          
        } else if (['FAILED', 'RETURNED', 'CANCELLED'].includes(currentStatus)) {
          // Handle failed delivery
          await handleFailedDelivery(tradeEscrow, tradeId, currentStatus);
          
          // Clean up the interval
          clearInterval(intervalId);
          activeTrackings.delete(tradeId);
        }
        // Other statuses (IN_TRANSIT, OUT_FOR_DELIVERY) continue polling
      } catch (error) {
        logger.error(`Error checking delivery status for trade ${tradeId}: ${error.message}`, { error });
      }
    }, config.pollingInterval);
    
    // Store the tracking info and interval ID for later reference
    activeTrackings.set(tradeId, {
      trackingInfo,
      intervalId,
      startedAt: Date.now()
    });
    
    // Set a maximum tracking time (e.g., 30 days)
    setTimeout(() => {
      if (activeTrackings.has(tradeId)) {
        const tracking = activeTrackings.get(tradeId);
        clearInterval(tracking.intervalId);
        activeTrackings.delete(tradeId);
        
        logger.warn(`Delivery tracking timeout for trade ${tradeId} after 30 days`);
        // Could implement alerting or manual review workflow here
      }
    }, 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    
    logger.info(`Delivery tracking started for trade ${tradeId}`);
  } catch (error) {
    logger.error(`Error starting delivery tracking for trade ${tradeId}: ${error.message}`, { error });
    throw error;
  }
}

/**
 * Check the delivery status with logistics provider API
 * @param {Object} trackingInfo Tracking information
 * @returns {Promise<string>} Delivery status code
 */
async function checkDeliveryStatus(trackingInfo) {
  try {
    // Extract tracking details
    const { carrier, trackingNumber } = extractTrackingDetails(trackingInfo);
    
    if (!config.logisticsApiUrl || !config.logisticsApiKey) {
      logger.warn('Logistics API configuration missing. Using simulated tracking.');
      
      // Simulate API response for demo purposes
      // This would be replaced with actual API calls in production
      return simulateDeliveryStatus(trackingNumber);
    }
    
    // Make the actual API call if configured
    const response = await axios.get(
      `${config.logisticsApiUrl}/track`,
      {
        params: {
          carrier,
          tracking_number: trackingNumber
        },
        headers: {
          'Authorization': `Bearer ${config.logisticsApiKey}`,
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 seconds
      }
    );
    
    if (response.status === 200 && response.data) {
      logger.debug(`Raw logistics API response: ${JSON.stringify(response.data)}`);
      
      // Map the provider's status codes to our standardized codes
      const status = mapToStandardStatus(response.data.status);
      return status;
    } else {
      logger.warn(`Failed to get delivery status: ${response.status}`);
      return 'UNKNOWN';
    }
  } catch (error) {
    logger.error(`Error checking delivery status: ${error.message}`);
    return 'ERROR';
  }
}

/**
 * Confirm delivery on the TradeEscrow contract
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {string} tradeId The trade identifier
 */
async function confirmDeliveryOnContract(tradeEscrow, tradeId) {
  try {
    logger.info(`Confirming delivery on contract for trade ${tradeId}`);
    
    // Get current trade status
    const trade = await tradeEscrow.trades(tradeId);
    
    // Only proceed if trade is in Shipped status
    if (trade.status.toString() !== '3') { // 3 = Shipped in the enum
      logger.warn(`Cannot confirm delivery for trade ${tradeId} - not in Shipped status. Current status: ${trade.status}`);
      return false;
    }
    
    // Prepare transaction
    const tx = await tradeEscrow.oracleConfirmDelivery(
      tradeId,
      {
        gasLimit: 200000
      }
    );
    
    logger.info(`Transaction submitted: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      logger.info(`Delivery confirmed successfully for trade ${tradeId}`);
      return true;
    } else {
      logger.error(`Transaction failed for delivery confirmation on trade ${tradeId}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error confirming delivery on contract: ${error.message}`, { tradeId, error });
    
    // Implement retry logic here if needed
    throw error;
  }
}

/**
 * Handle a failed delivery
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {string} tradeId The trade identifier
 * @param {string} status The failed status code
 */
async function handleFailedDelivery(tradeEscrow, tradeId, status) {
  logger.warn(`Handling failed delivery for trade ${tradeId}. Status: ${status}`);
  
  // In a production system, this might:
  // 1. Notify the buyer, seller, and administrators
  // 2. Create a dispute or trigger a refund process
  // 3. Log detailed information for manual review
  
  // For now, we'll just log it for monitoring
  // Would need custom contract functions to handle failed deliveries
}

/**
 * Extract carrier and tracking number from tracking info
 * @param {Object|string} trackingInfo The tracking information object or string
 * @returns {Object} Extracted carrier and tracking number
 */
function extractTrackingDetails(trackingInfo) {
  // Handle string input (assume it's a tracking number)
  if (typeof trackingInfo === 'string') {
    return {
      carrier: 'UNKNOWN', // default carrier
      trackingNumber: trackingInfo
    };
  }
  
  // Handle object input
  if (trackingInfo.carrier && trackingInfo.trackingNumber) {
    return {
      carrier: trackingInfo.carrier,
      trackingNumber: trackingInfo.trackingNumber
    };
  }
  
  // Handle different field names
  if (trackingInfo.trackingId) {
    return {
      carrier: trackingInfo.carrier || trackingInfo.courierName || 'UNKNOWN',
      trackingNumber: trackingInfo.trackingId
    };
  }
  
  // Handle ONDC format
  if (trackingInfo.ondcTrackingRef) {
    return {
      carrier: 'ONDC',
      trackingNumber: trackingInfo.ondcTrackingRef
    };
  }
  
  // Default fallback
  logger.warn(`Unexpected tracking info format: ${JSON.stringify(trackingInfo)}`);
  return {
    carrier: 'UNKNOWN',
    trackingNumber: typeof trackingInfo === 'object' && Object.values(trackingInfo)[0] || 'UNKNOWN'
  };
}

/**
 * Map provider-specific status codes to standardized status codes
 * @param {string} providerStatus The provider's status code
 * @returns {string} Standardized status code
 */
function mapToStandardStatus(providerStatus) {
  const standardizedMap = {
    // Common shipping statuses
    'delivered': 'DELIVERED',
    'out_for_delivery': 'OUT_FOR_DELIVERY',
    'in_transit': 'IN_TRANSIT',
    'pending': 'PENDING',
    'failed': 'FAILED',
    'returned': 'RETURNED',
    'exception': 'EXCEPTION',
    'cancelled': 'CANCELLED'
    // Add more mappings as needed
  };
  
  // Normalize the input to lowercase
  const normalizedStatus = (providerStatus || '').toLowerCase();
  
  // Try direct mapping
  if (standardizedMap[normalizedStatus]) {
    return standardizedMap[normalizedStatus];
  }
  
  // Try partial matching
  for (const [key, value] of Object.entries(standardizedMap)) {
    if (normalizedStatus.includes(key)) {
      return value;
    }
  }
  
  // Default fallback
  return 'UNKNOWN';
}

/**
 * Simulate delivery status for demo/development
 * @param {string} trackingNumber The tracking number
 * @returns {string} Simulated delivery status
 */
function simulateDeliveryStatus(trackingNumber) {
  // Create a deterministic but changing status based on tracking number and time
  const statuses = ['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  
  // Use the tracking number as a seed
  let seed = 0;
  for (let i = 0; i < trackingNumber.length; i++) {
    seed += trackingNumber.charCodeAt(i);
  }
  
  // Add current day to make it change over time
  const currentDay = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  seed += currentDay;
  
  // Pick a status based on the seed
  const index = seed % statuses.length;
  
  return statuses[index];
}

module.exports = {
  trackDelivery,
  checkDeliveryStatus,
  confirmDeliveryOnContract,
  handleFailedDelivery
};
