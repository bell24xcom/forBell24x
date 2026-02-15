/**
 * TradeEscrow Oracle Service
 * Main entry point for the oracle service that connects the TradeEscrow smart contract
 * with external data sources like GSTN APIs and delivery tracking systems.
 */
require('dotenv').config();
const { ethers } = require('ethers');
const { loadConfig } = require('./utils/config');
const logger = require('./utils/logger');
const { setupEventListeners } = require('./services/eventListener');
const pauseService = require('./services/pauseService');
const apiServer = require('./services/apiServer');
const { setupPeriodicTasks } = require('./services/scheduler');

// Load configuration
const config = loadConfig();

async function startOracleService() {
  try {
    // Load configuration
    const config = loadConfig();
    logger.info('Configuration loaded successfully');

    // Connect to blockchain provider
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    const network = await provider.getNetwork();
    logger.info(`Connected to network: ${network.name} (${network.chainId})`);

    // Set up oracle wallet
    const wallet = new ethers.Wallet(config.oraclePrivateKey, provider);
    const walletAddress = await wallet.getAddress();
    logger.info(`Oracle wallet address: ${walletAddress}`);

    // Connect to TradeEscrow contract
    const tradeEscrow = new ethers.Contract(
      config.tradeEscrowAddress,
      config.tradeEscrowAbi,
      wallet
    );
    logger.info(`Connected to TradeEscrow contract: ${config.tradeEscrowAddress}`);
    
    // Initialize pause service - must be done before other services
    await pauseService.initializePauseService(tradeEscrow);
    const isPaused = pauseService.isPausedState();
    logger.info(`Pause state initialized: ${isPaused ? 'PAUSED' : 'ACTIVE'}`);

    // Add pause state change listener for logging
    pauseService.onPauseStateChange((paused, reason, source) => {
      if (paused) {
        logger.warn(`Oracle service PAUSED: ${reason} (source: ${source})`);
      } else {
        logger.info(`Oracle service UNPAUSED (source: ${source})`);
      }
    });

    // Set up event listeners
    await setupEventListeners(tradeEscrow, provider);
    
    // Setup periodic tasks (e.g., checking delivery status)
    // Set up periodic tasks (if any)
    // TODO: Implement periodic tasks

    // Initialize API server
    await apiServer.initializeApiServer(tradeEscrow);

    logger.info('Oracle service started successfully');
  } catch (error) {
    logger.error(`Failed to start oracle service: ${error.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutdown signal received, closing connections');
  
  // Clean up resources
  try {
    await apiServer.stopApiServer();
    logger.info('Resources cleaned up successfully');
  } catch (err) {
    logger.error(`Error during shutdown: ${err.message}`);
  }
  
  process.exit(0);
});

// Start the service
startOracleService();
