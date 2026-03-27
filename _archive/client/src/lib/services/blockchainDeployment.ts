import {
  JsonRpcProvider,
  Wallet,
  ContractFactory,
  parseEther,
  parseUnits,
  formatEther,
} from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import EscrowArtifact from '../../../../artifacts/contracts/Escrow.sol/Escrow.json';

export interface DeploymentConfig {
  network: string;
  rpcUrl: string;
  chainId: number;
  privateKey: string;
  gasLimit: number;
  gasPrice: string;
  verificationApiKey?: string;
}

export interface DeploymentResult {
  contractName: string;
  address: string;
  transactionHash: string;
  network: string;
  deployedAt: Date;
  gasUsed: number;
  verificationUrl?: string;
}

export interface ContractArtifact {
  name: string;
  abi: any[];
  bytecode: string;
  constructorArgs?: any[];
}

// Factory interface for dependency injection
export interface ContractFactoryFactory {
  new (abi: any[], bytecode: string, signer: Wallet): ContractFactory;
}

class BlockchainDeploymentService {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private config: DeploymentConfig;
  private contractFactoryFactory: ContractFactoryFactory;

  constructor(
    config: DeploymentConfig,
    provider?: JsonRpcProvider,
    wallet?: Wallet,
    contractFactoryFactory?: ContractFactoryFactory
  ) {
    this.config = config;
    this.provider = provider || new JsonRpcProvider(config.rpcUrl);
    this.wallet = wallet || new Wallet(config.privateKey, this.provider);
    this.contractFactoryFactory = contractFactoryFactory || ContractFactory;
  }

  /**
   * Get deployed contract addresses from environment variables
   */
  static getDeployedAddresses() {
    const escrowAddress = process.env.ESCROW_CONTRACT_ADDRESS;
    const tradeEscrowAddress = process.env.TRADE_ESCROW_CONTRACT_ADDRESS;

    if (!escrowAddress) {
      console.warn('⚠️  ESCROW_CONTRACT_ADDRESS not set in environment variables');
      console.log('Please deploy contracts first and add the address to .env file');
    }

    return {
      escrow: escrowAddress,
      tradeEscrow: tradeEscrowAddress,
    };
  }

  /**
   * Check if contracts are deployed
   */
  static areContractsDeployed(): boolean {
    const addresses = this.getDeployedAddresses();
    return !!(addresses.escrow && addresses.tradeEscrow);
  }

  /**
   * Deploy all smart contracts for Bell24H
   */
  async deployAllContracts(): Promise<DeploymentResult[]> {
    const results: DeploymentResult[] = [];

    try {
      console.log(`Starting deployment to ${this.config.network}...`);

      // Deploy Escrow Contract
      const escrowResult = await this.deployEscrowContract();
      results.push(escrowResult);

      // Save deployment info
      await this.saveDeploymentInfo(results);

      console.log('All contracts deployed successfully!');
      return results;
    } catch (error) {
      console.error('Deployment failed:', error);
      throw error;
    }
  }

  /**
   * Deploy Escrow Smart Contract
   */
  async deployEscrowContract(): Promise<DeploymentResult> {
    const contractArtifact = this.getEscrowContractArtifact();

    console.log('Deploying Escrow Contract...');

    const factory = new this.contractFactoryFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      this.wallet
    );

    // Escrow constructor takes: (uint256 _platformFee, address _feeCollector)
    const deploymentArgs = [
      parseEther('0.01'), // platform fee (1%)
      this.wallet.address, // fee collector (same as deployer for now)
    ];

    const contract = await factory.deploy(...deploymentArgs, {
      gasLimit: this.config.gasLimit,
      gasPrice: parseUnits(this.config.gasPrice, 'wei'),
    });

    await contract.waitForDeployment();
    const address = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();
    const txHash = deploymentTx?.hash || 'unknown';
    let gasUsed = 0;
    if (txHash && txHash !== 'unknown') {
      const txReceipt = await this.provider.getTransactionReceipt(txHash);
      gasUsed = txReceipt?.gasUsed ? Number(txReceipt.gasUsed) : 0;
    }

    console.log(`Escrow Contract deployed at: ${address}`);

    // Verify contract if API key is provided
    let verificationUrl;
    if (this.config.verificationApiKey) {
      verificationUrl = await this.verifyContract(address, contractArtifact.name, deploymentArgs);
    }

    return {
      contractName: 'Bell24HEscrow',
      address,
      transactionHash: txHash,
      network: this.config.network,
      deployedAt: new Date(),
      gasUsed,
      verificationUrl,
    };
  }

  /**
   * Verify contract on Etherscan
   */
  private async verifyContract(
    address: string,
    contractName: string,
    constructorArgs: any[]
  ): Promise<string | undefined> {
    try {
      // This would implement actual contract verification
      // For now, return the Etherscan URL
      const explorerUrl = this.getExplorerBaseUrl(this.config.network);
      return `${explorerUrl}/address/${address}`;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return undefined;
    }
  }

  /**
   * Get explorer base URL for different networks
   */
  private getExplorerBaseUrl(network: string): string {
    const urls: Record<string, string> = {
      mainnet: 'https://polygonscan.com',
      mumbai: 'https://mumbai.polygonscan.com',
      sepolia: 'https://sepolia.etherscan.io',
      goerli: 'https://goerli.etherscan.io',
    };
    return urls[network] || 'https://polygonscan.com';
  }

  /**
   * Save deployment information to file
   */
  private async saveDeploymentInfo(results: DeploymentResult[]): Promise<void> {
    const deploymentInfo = {
      network: this.config.network,
      deployedAt: new Date().toISOString(),
      chainId: this.config.chainId,
      contracts: results,
    };

    const filename = `deployment-${this.config.network}-${Date.now()}.json`;
    const filepath = path.join(process.cwd(), 'deployments', filename);

    // Ensure deployments directory exists
    const deploymentsDir = path.dirname(filepath);
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to: ${filepath}`);
  }

  /**
   * Get Escrow Contract Artifact
   */
  private getEscrowContractArtifact(): ContractArtifact {
    return {
      name: 'Bell24HEscrow',
      abi: EscrowArtifact.abi,
      bytecode: EscrowArtifact.bytecode,
      constructorArgs: ['address owner', 'uint256 platformFee', 'address feeCollector'],
    };
  }

  /**
   * Get network balance
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return formatEther(balance);
  }

  /**
   * Check if wallet has sufficient balance for deployment
   */
  async checkDeploymentBalance(): Promise<boolean> {
    const balance = await this.getBalance();
    const estimatedCost = parseEther('0.1'); // Estimated cost for all deployments

    return parseFloat(balance) > parseFloat(formatEther(estimatedCost));
  }
}

export default BlockchainDeploymentService;
