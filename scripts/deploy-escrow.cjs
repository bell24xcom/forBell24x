// scripts/deploy-escrow.cjs

const hre = require('hardhat');
require('dotenv').config();

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // Check for required environment variables
  const privateKey = process.env.PRIVATE_KEY;
  const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
  
  if (!privateKey || privateKey === 'your_sepolia_private_key_here' || privateKey === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    console.error('❌ ERROR: PRIVATE_KEY not set in .env file');
    console.log('Please add your Sepolia private key to .env file:');
    console.log('PRIVATE_KEY=your_actual_private_key_here');
    console.log('');
    console.log('To get a Sepolia private key:');
    console.log('1. Create a wallet (MetaMask, etc.)');
    console.log('2. Switch to Sepolia testnet');
    console.log('3. Get some Sepolia ETH from a faucet');
    console.log('4. Export your private key');
    process.exit(1);
  }

  if (!sepoliaRpcUrl || sepoliaRpcUrl.includes('your_infura_project_id')) {
    console.error('❌ ERROR: SEPOLIA_RPC_URL not set in .env file');
    console.log('Please add your Sepolia RPC URL to .env file:');
    console.log('SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_actual_project_id');
    console.log('');
    console.log('To get an Infura project ID:');
    console.log('1. Go to https://infura.io');
    console.log('2. Create a new project');
    console.log('3. Copy the Sepolia endpoint URL');
    process.exit(1);
  }

  // Read constructor arguments from environment or use defaults
  const platformFee = process.env.ESCROW_PLATFORM_FEE || '200'; // 2% (in basis points)
  const feeCollector = process.env.ESCROW_FEE_COLLECTOR || deployer.address;

  console.log('📋 Deployment Configuration:');
  console.log(`   Platform Fee: ${platformFee} basis points (${platformFee/100}%)`);
  console.log(`   Fee Collector: ${feeCollector}`);
  console.log(`   Network: Sepolia`);
  console.log('');

  console.log('🚀 Deploying Escrow contract...');
  
  try {
    const Escrow = await hre.ethers.getContractFactory('Escrow');
    const escrow = await Escrow.deploy(platformFee, feeCollector);
    await escrow.deployed();

    console.log('✅ Escrow contract deployed successfully!');
    console.log(`   Contract Address: ${escrow.address}`);
    console.log(`   Transaction Hash: ${escrow.deployTransaction.hash}`);
    console.log('');
    
    console.log('📝 Next steps:');
    console.log('1. Add the contract address to your .env file:');
    console.log(`   ESCROW_CONTRACT_ADDRESS=${escrow.address}`);
    console.log('');
    console.log('2. Verify the contract on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${escrow.address}`);
    console.log('');
    console.log('3. Test the contract with a small transaction');
    
    // Save deployment info to a file
    const fs = require('fs');
    const deploymentInfo = {
      contractName: 'Escrow',
      address: escrow.address,
      network: 'sepolia',
      deployedAt: new Date().toISOString(),
      constructorArgs: {
        platformFee: platformFee,
        feeCollector: feeCollector
      },
      transactionHash: escrow.deployTransaction.hash
    };
    
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to deployment-info.json');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.message.includes('insufficient funds')) {
      console.log('');
      console.log('💡 You need Sepolia ETH to deploy contracts.');
      console.log('Get free Sepolia ETH from:');
      console.log('   https://sepoliafaucet.com/');
      console.log('   https://faucet.sepolia.dev/');
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 