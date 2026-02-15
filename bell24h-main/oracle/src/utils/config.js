/**
 * Configuration loader utility
 * Loads and validates configuration from environment variables and config files
 */
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Loads configuration from config files and environment variables
 * @returns {Object} Configuration object
 */
function loadConfig() {
  try {
    // Default config path
    const configPath = process.env.CONFIG_PATH || path.join(__dirname, '../../config/default.json');
    
    // Check if config file exists
    let fileConfig = {};
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf8');
      fileConfig = JSON.parse(configFile);
      logger.info(`Loaded config from ${configPath}`);
    } else {
      logger.warn(`Config file not found at ${configPath}, using environment variables only`);
    }
    
    // Merge with environment variables (environment variables take precedence)
    const config = {
      // Blockchain connection
      rpcUrl: process.env.RPC_URL || fileConfig.rpcUrl || 'http://localhost:8545',
      chainId: parseInt(process.env.CHAIN_ID || fileConfig.chainId || '80001', 10), // Default to Mumbai testnet
      
      // Contract information
      tradeEscrowAddress: process.env.TRADE_ESCROW_ADDRESS || fileConfig.tradeEscrowAddress,
      tradeEscrowAbi: fileConfig.tradeEscrowAbi || loadContractAbi(),
      
      // Oracle credentials
      oraclePrivateKey: process.env.ORACLE_PRIVATE_KEY || fileConfig.oraclePrivateKey,
      
      // External APIs
      gstnApiUrl: process.env.GSTN_API_URL || fileConfig.gstnApiUrl,
      gstnApiKey: process.env.GSTN_API_KEY || fileConfig.gstnApiKey,
      
      // Delivery tracking APIs
      logisticsApiUrl: process.env.LOGISTICS_API_URL || fileConfig.logisticsApiUrl,
      logisticsApiKey: process.env.LOGISTICS_API_KEY || fileConfig.logisticsApiKey,
      
      // ONDC integration
      ondcApiUrl: process.env.ONDC_API_URL || fileConfig.ondcApiUrl,
      ondcApiKey: process.env.ONDC_API_KEY || fileConfig.ondcApiKey,
      
      // Service configuration
      pollingInterval: parseInt(process.env.POLLING_INTERVAL || fileConfig.pollingInterval || '60000', 10), // Default 1 minute
      retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || fileConfig.retryAttempts || '3', 10),
      logLevel: process.env.LOG_LEVEL || fileConfig.logLevel || 'info',
      
      // API and service configuration
      enableApi: process.env.ENABLE_API === 'true' || false,
      apiPort: parseInt(process.env.API_PORT || '3000', 10),
      apiKey: process.env.API_KEY || '',
      startPaused: process.env.START_PAUSED === 'true' || false,
      
      // Message Queue Configuration
      useMsgQueue: process.env.USE_MSG_QUEUE === 'true' || false,
      msgQueueUrl: process.env.MSG_QUEUE_URL || 'amqp://localhost',
      
      // Pause configuration
      pauseCheckInterval: parseInt(process.env.PAUSE_CHECK_INTERVAL || '60000', 10), // 1 minute
    };
    
    // Validate required configuration
    validateConfig(config);
    
    return config;
  } catch (error) {
    logger.error(`Failed to load configuration: ${error.message}`);
    throw error;
  }
}

/**
 * Loads contract ABI from the artifacts directory
 * @returns {Array} Contract ABI
 */
function loadContractAbi() {
  try {
    // Try to load from artifacts directory (generated during contract compilation)
    const artifactPath = path.join(__dirname, '../../../artifacts/contracts/TradeEscrow.sol/TradeEscrow.json');
    
    if (fs.existsSync(artifactPath)) {
      const artifact = require(artifactPath);
      return artifact.abi;
    }
    
    // Fallback to config directory
    const abiPath = path.join(__dirname, '../../config/TradeEscrowABI.json');
    
    if (fs.existsSync(abiPath)) {
      return require(abiPath);
    }
    
    logger.error('Contract ABI not found');
    throw new Error('Contract ABI not found');
  } catch (error) {
    logger.error(`Failed to load contract ABI: ${error.message}`);
    throw error;
  }
}

/**
 * Validates that all required configuration is present
 * @param {Object} config Configuration object
 */
function validateConfig(config) {
  const requiredConfigs = [
    'rpcUrl',
    'tradeEscrowAddress',
    'oraclePrivateKey'
  ];
  
  // Add API configuration if enabled
  if (config.enableApi) {
    requiredConfigs.push('apiKey');
  }
  
  const missingFields = requiredConfigs.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    const errorMsg = `Missing required configuration: ${missingFields.join(', ')}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
}

module.exports = { loadConfig };
