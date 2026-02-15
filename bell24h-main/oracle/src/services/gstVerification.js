/**
 * GST Verification Service
 * Handles validation of GST registration numbers with the GSTN API
 * and updates the contract with verification status
 */
const axios = require('axios');
const { ethers } = require('ethers');
const logger = require('../utils/logger');
const { loadConfig } = require('../utils/config');

const config = loadConfig();

/**
 * Retrieves GST number for a given address, possibly from off-chain storage
 * @param {string} address Ethereum address of the entity
 * @param {string} tradeId Trade identifier
 * @returns {Promise<string>} GST number
 */
async function getGSTNumber(address, tradeId) {
  try {
    // In a real implementation, this would fetch from a database
    // For now we'll use a placeholder implementation
    
    // Option 1: Query our own database that maps addresses to GST numbers
    // const result = await db.collection('users').findOne({ ethAddress: address });
    // if (result && result.gstNumber) return result.gstNumber;
    
    // Option 2: For development/demo, parse from trade metadata or use dummy values
    // This would be replaced with actual GSTIN retrieval logic
    
    // Placeholder GST numbers for testing
    // Real ones would follow the format: 22AAAAA0000A1Z5
    const placeholderGSTINs = {
      // Maps some example addresses to valid GST numbers
      // These would come from your database in production
      "0x1234567890123456789012345678901234567890": "27AAPFU0939F1ZV",
      "0x2345678901234567890123456789012345678901": "29AAGCB7383M1ZI",
      "0xABC4567890123456789012345678901234567890": "06BZAHM6385P4Z2",
      // Add more mappings as needed
    };
    
    // If we have a mapping for this address, use it
    if (placeholderGSTINs[address.toLowerCase()]) {
      return placeholderGSTINs[address.toLowerCase()];
    }
    
    // Otherwise generate a deterministic dummy GSTIN based on the address
    // This is just for demonstration, not for production use
    const stateCode = (parseInt(address.slice(2, 4), 16) % 36 + 1).toString().padStart(2, '0');
    const panStyle = address.slice(2, 12).toUpperCase();
    const entityCode = "1";
    const checksum = "Z" + (parseInt(address.slice(12, 14), 16) % 9 + 1);
    
    const dummyGSTIN = `${stateCode}${panStyle}${entityCode}${checksum}`;
    logger.warn(`Using generated dummy GSTIN ${dummyGSTIN} for address ${address} in trade ${tradeId}`);
    
    return dummyGSTIN;
  } catch (error) {
    logger.error(`Error retrieving GST number for address ${address}: ${error.message}`);
    throw error;
  }
}

/**
 * Verifies a GSTIN with the GSTN API
 * @param {string} gstin GST Identification Number
 * @returns {Promise<boolean>} Whether the GSTIN is valid
 */
async function verifyGSTINWithGSTNAPI(gstin) {
  try {
    // In production, this would call the actual GSTN API
    // For development/demo, we'll simulate API responses
    
    if (!config.gstnApiUrl || !config.gstnApiKey) {
      logger.warn('GSTN API configuration missing. Using simulated verification.');
      
      // Simulate API response for demo purposes
      // In production, replace with actual API call
      const isValid = isValidGSTINFormat(gstin);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return isValid;
    }
    
    // Make the actual API call if configured
    const response = await axios.post(
      `${config.gstnApiUrl}/verify`,
      { gstin },
      {
        headers: {
          'Authorization': `Bearer ${config.gstnApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 seconds
      }
    );
    
    if (response.status === 200 && response.data && response.data.valid) {
      logger.info(`GSTIN ${gstin} verified successfully`);
      return true;
    } else {
      logger.warn(`GSTIN ${gstin} verification failed: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error verifying GSTIN ${gstin}: ${error.message}`);
    // For resilience, we might want to assume validity in case of API failures
    // However, in production you should handle this according to your compliance requirements
    return false;
  }
}

/**
 * Basic validation of GSTIN format
 * @param {string} gstin GST Identification Number to validate
 * @returns {boolean} Whether the format is valid
 */
function isValidGSTINFormat(gstin) {
  // Basic format check: 15 characters, first 2 are state code, etc.
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  
  if (!gstin || typeof gstin !== 'string') {
    return false;
  }
  
  return gstinRegex.test(gstin);
}

/**
 * Conducts GST verification for both buyer and seller in a trade
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {string} tradeId The trade identifier
 * @param {string} buyer The buyer's Ethereum address
 * @param {string} seller The seller's Ethereum address
 */
async function verifyGSTRegistration(tradeEscrow, tradeId, buyer, seller) {
  try {
    logger.info(`Starting GST verification for trade ${tradeId}`);
    
    // Get GST numbers
    const buyerGSTIN = await getGSTNumber(buyer, tradeId);
    const sellerGSTIN = await getGSTNumber(seller, tradeId);
    
    logger.info(`Retrieved GSTINs: Buyer=${buyerGSTIN}, Seller=${sellerGSTIN}`);
    
    // Verify with GSTN API
    const buyerVerified = await verifyGSTINWithGSTNAPI(buyerGSTIN);
    const sellerVerified = await verifyGSTINWithGSTNAPI(sellerGSTIN);
    
    logger.info(`Verification results: Buyer=${buyerVerified}, Seller=${sellerVerified}`);
    
    // Update contract if there's a change in verification status
    const trade = await tradeEscrow.trades(tradeId);
    
    if (trade.buyerGSTVerified !== buyerVerified || trade.sellerGSTVerified !== sellerVerified) {
      await updateContractWithGSTStatus(tradeEscrow, tradeId, buyerVerified, sellerVerified);
    } else {
      logger.info(`No change in verification status for trade ${tradeId}, skipping contract update`);
    }
    
    return { buyerVerified, sellerVerified };
  } catch (error) {
    logger.error(`Error in GST verification process: ${error.message}`, { tradeId, error });
    throw error;
  }
}

/**
 * Updates the TradeEscrow contract with GST verification status
 * @param {Contract} tradeEscrow The TradeEscrow contract instance
 * @param {string} tradeId The trade identifier
 * @param {boolean} buyerVerified Whether the buyer's GST is verified
 * @param {boolean} sellerVerified Whether the seller's GST is verified
 */
async function updateContractWithGSTStatus(tradeEscrow, tradeId, buyerVerified, sellerVerified) {
  try {
    logger.info(`Updating contract with GST verification status: Trade=${tradeId}, Buyer=${buyerVerified}, Seller=${sellerVerified}`);
    
    // Prepare transaction
    const tx = await tradeEscrow.updateGSTVerificationStatus(
      tradeId,
      buyerVerified,
      sellerVerified,
      {
        gasLimit: 200000
      }
    );
    
    logger.info(`Transaction submitted: ${tx.hash}`);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      logger.info(`GST verification updated successfully for trade ${tradeId}`);
      return true;
    } else {
      logger.error(`Transaction failed for GST verification update on trade ${tradeId}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error updating GST status on contract: ${error.message}`, { tradeId, error });
    
    // Implement retry logic here if needed
    throw error;
  }
}

module.exports = {
  verifyGSTRegistration,
  updateContractWithGSTStatus,
  getGSTNumber,
  verifyGSTINWithGSTNAPI
};
