/**
 * Advanced deployment script for TradeEscrow with secure pause role setup
 * This script:
 * 1. Deploys the TradeEscrow contract
 * 2. Sets up role assignments including PAUSER_ROLE
 * 3. Optionally sets the contract in paused state if required
 */
require('dotenv').config();
const { ethers, upgrades } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying TradeEscrow with the account:', deployer.address);
  
  // Get deployment parameters from environment variables
  const gstWalletAddress = process.env.GST_WALLET_ADDRESS;
  const feeWalletAddress = process.env.FEE_WALLET_ADDRESS;
  const feePercentage = parseInt(process.env.FEE_PERCENTAGE || '5', 10); // 0.5% by default
  const oracleAddress = process.env.ORACLE_ADDRESS;
  const pauserAddress = process.env.PAUSER_ADDRESS;
  const startPaused = process.env.START_PAUSED === 'true';
  
  // Validate required parameters
  if (!gstWalletAddress) {
    throw new Error('GST_WALLET_ADDRESS is required in the environment');
  }
  
  if (!feeWalletAddress) {
    throw new Error('FEE_WALLET_ADDRESS is required in the environment');
  }
  
  // Deploy the TradeEscrow contract
  console.log('Deploying TradeEscrow contract...');
  const TradeEscrow = await ethers.getContractFactory('TradeEscrow');
  const tradeEscrow = await upgrades.deployProxy(TradeEscrow, [
    deployer.address, // initialAdmin
    gstWalletAddress, // initialGSTAuthorityWallet
    feeWalletAddress, // initialPlatformFeeWallet
    feePercentage     // initialFeePercentage (0.5%)
  ], {
    initializer: 'initialize',
    kind: 'uups'
  });
  
  await tradeEscrow.deployed();
  console.log('TradeEscrow contract deployed to:', tradeEscrow.address);
  
  // Set up oracle if provided
  if (oracleAddress) {
    console.log('Setting oracle address:', oracleAddress);
    const tx = await tradeEscrow.setOracleAddress(oracleAddress);
    await tx.wait();
    console.log('Oracle address set successfully');
    
    // Also grant ORACLE_ROLE to oracle
    const ORACLE_ROLE = await tradeEscrow.ORACLE_ROLE();
    const tx2 = await tradeEscrow.grantRole(ORACLE_ROLE, oracleAddress);
    await tx2.wait();
    console.log('ORACLE_ROLE granted to oracle');
  }
  
  // Set up pauser if provided
  if (pauserAddress) {
    console.log('Setting up PAUSER_ROLE for address:', pauserAddress);
    const PAUSER_ROLE = await tradeEscrow.PAUSER_ROLE();
    const tx = await tradeEscrow.grantRole(PAUSER_ROLE, pauserAddress);
    await tx.wait();
    console.log('PAUSER_ROLE granted to pauser address');
    
    // Also grant PAUSER_ROLE to oracle if provided
    if (oracleAddress && oracleAddress !== pauserAddress) {
      console.log('Also granting PAUSER_ROLE to oracle for emergency response');
      const tx2 = await tradeEscrow.grantRole(PAUSER_ROLE, oracleAddress);
      await tx2.wait();
      console.log('PAUSER_ROLE granted to oracle address');
    }
  }
  
  // Set contract to paused state if required
  if (startPaused) {
    console.log('Setting contract to initial paused state...');
    const tx = await tradeEscrow.pause();
    await tx.wait();
    console.log('Contract successfully paused');
  }
  
  // Write deployment information to a file
  const deploymentInfo = {
    network: network.name,
    tradeEscrowAddress: tradeEscrow.address,
    deployerAddress: deployer.address,
    gstWalletAddress,
    feeWalletAddress,
    feePercentage,
    oracleAddress: oracleAddress || null,
    pauserAddress: pauserAddress || null,
    startPaused,
    timestamp: new Date().toISOString()
  };
  
  const deploymentDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentPath = path.join(
    deploymentDir, 
    `${network.name}-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`Deployment information saved to ${deploymentPath}`);
  console.log('Deployment completed successfully');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
