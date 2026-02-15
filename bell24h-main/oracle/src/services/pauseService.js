/**
 * Pause Service
 * Provides functionality to pause and resume oracle operations
 * Synchronizes with on-chain pause status and exposes API endpoints
 */
const { ethers } = require('ethers');
const logger = require('../utils/logger');
const { loadConfig } = require('../utils/config');

const config = loadConfig();

// Track current pause status
let isPaused = false;
let pauseReason = '';
let pausedAt = null;
let pausedBy = '';

// Maintain listeners for centralized management
const pauseChangeListeners = [];

/**
 * Initialize the pause service by checking on-chain pause status
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @returns {Promise<boolean>} The initial pause status
 */
async function initializePauseService(tradeEscrow) {
  try {
    logger.info('Initializing pause service');
    
    // Check if contract is paused
    isPaused = await tradeEscrow.paused();
    
    if (isPaused) {
      logger.warn('Contract is currently PAUSED. Oracle service will start in paused mode');
      pauseReason = 'Started with contract already in paused state';
      pausedAt = new Date();
      pausedBy = 'system';
    } else {
      logger.info('Contract is not paused. Oracle service will start in active mode');
    }
    
    // Set up event listener for contract pause/unpause events
    tradeEscrow.on('Paused', async () => {
      logger.warn('Contract PAUSED event detected');
      setPaused(true, 'Reacting to on-chain pause event', 'contract');
    });
    
    tradeEscrow.on('Unpaused', async () => {
      logger.info('Contract UNPAUSED event detected');
      setPaused(false, 'Reacting to on-chain unpause event', 'contract');
    });
    
    logger.info('Pause service initialized successfully');
    return isPaused;
  } catch (error) {
    logger.error(`Failed to initialize pause service: ${error.message}`, { error });
    // Default to not paused if we can't determine status
    return false;
  }
}

/**
 * Set the pause state of the oracle service
 * @param {boolean} paused The new pause state 
 * @param {string} reason Reason for the pause/unpause
 * @param {string} source Source of the pause action (e.g., 'api', 'contract', 'system')
 */
function setPaused(paused, reason = '', source = 'api') {
  const previousState = isPaused;
  
  if (previousState === paused) {
    logger.debug(`Pause state already ${paused ? 'paused' : 'unpaused'}, no change needed`);
    return;
  }
  
  isPaused = paused;
  
  if (paused) {
    pauseReason = reason || 'No reason provided';
    pausedAt = new Date();
    pausedBy = source;
    logger.warn(`Oracle service PAUSED: ${pauseReason}`);
  } else {
    logger.info(`Oracle service UNPAUSED. Previous pause reason: ${pauseReason}`);
    pauseReason = '';
    pausedAt = null;
    pausedBy = '';
  }
  
  // Notify all listeners
  notifyPauseStateChange(paused, reason, source);
}

/**
 * Register a listener to be notified of pause state changes
 * @param {Function} listener Function to call when pause state changes
 * @returns {Function} Function to unregister the listener
 */
function onPauseStateChange(listener) {
  pauseChangeListeners.push(listener);
  
  // Return function to unregister
  return () => {
    const index = pauseChangeListeners.indexOf(listener);
    if (index !== -1) {
      pauseChangeListeners.splice(index, 1);
    }
  };
}

/**
 * Notify all listeners of a pause state change
 * @param {boolean} paused New pause state
 * @param {string} reason Reason for the state change
 * @param {string} source Source of the change
 */
function notifyPauseStateChange(paused, reason, source) {
  for (const listener of pauseChangeListeners) {
    try {
      listener(paused, reason, source);
    } catch (error) {
      logger.error(`Error in pause state change listener: ${error.message}`, { error });
    }
  }
}

/**
 * Check if the oracle service is currently paused
 * @returns {boolean} True if the service is paused
 */
function isPausedState() {
  return isPaused;
}

/**
 * Get details about the current pause status
 * @returns {Object} Object containing pause status details
 */
function getPauseStatus() {
  return {
    isPaused,
    reason: pauseReason,
    pausedAt: pausedAt ? pausedAt.toISOString() : null,
    pausedBy
  };
}

/**
 * Attempt to pause both the contract and oracle service
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {string} reason Reason for pausing
 * @returns {Promise<boolean>} True if successful
 */
async function pauseSystem(tradeEscrow, reason) {
  try {
    logger.info(`Attempting to pause system: ${reason}`);
    
    // First set our local state
    setPaused(true, reason, 'api');
    
    // Then try to pause the contract if not already paused
    const contractPaused = await tradeEscrow.paused();
    if (!contractPaused) {
      try {
        // Check if our oracle wallet has PAUSER_ROLE
        const PAUSER_ROLE = await tradeEscrow.PAUSER_ROLE();
        const address = await tradeEscrow.signer.getAddress();
        const hasPauserRole = await tradeEscrow.hasRole(PAUSER_ROLE, address);
        
        if (hasPauserRole) {
          const tx = await tradeEscrow.pause();
          logger.info(`Pausing contract, transaction: ${tx.hash}`);
          await tx.wait();
          logger.info('Contract successfully paused on-chain');
        } else {
          logger.warn('Oracle wallet does not have PAUSER_ROLE, cannot pause contract on-chain');
        }
      } catch (contractError) {
        logger.error(`Failed to pause contract: ${contractError.message}`, { error: contractError });
      }
    } else {
      logger.info('Contract is already paused on-chain');
    }
    
    return true;
  } catch (error) {
    logger.error(`Failed to pause system: ${error.message}`, { error });
    return false;
  }
}

/**
 * Attempt to unpause both the contract and oracle service
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {string} reason Reason for unpausing
 * @returns {Promise<boolean>} True if successful
 */
async function unpauseSystem(tradeEscrow, reason) {
  try {
    logger.info(`Attempting to unpause system: ${reason}`);
    
    // First set our local state
    setPaused(false, reason, 'api');
    
    // Then try to unpause the contract if paused
    const contractPaused = await tradeEscrow.paused();
    if (contractPaused) {
      try {
        // Check if our oracle wallet has PAUSER_ROLE
        const PAUSER_ROLE = await tradeEscrow.PAUSER_ROLE();
        const address = await tradeEscrow.signer.getAddress();
        const hasPauserRole = await tradeEscrow.hasRole(PAUSER_ROLE, address);
        
        if (hasPauserRole) {
          const tx = await tradeEscrow.unpause();
          logger.info(`Unpausing contract, transaction: ${tx.hash}`);
          await tx.wait();
          logger.info('Contract successfully unpaused on-chain');
        } else {
          logger.warn('Oracle wallet does not have PAUSER_ROLE, cannot unpause contract on-chain');
        }
      } catch (contractError) {
        logger.error(`Failed to unpause contract: ${contractError.message}`, { error: contractError });
      }
    } else {
      logger.info('Contract is already unpaused on-chain');
    }
    
    return true;
  } catch (error) {
    logger.error(`Failed to unpause system: ${error.message}`, { error });
    return false;
  }
}

module.exports = {
  initializePauseService,
  isPausedState,
  setPaused,
  onPauseStateChange,
  getPauseStatus,
  pauseSystem,
  unpauseSystem
};
