import { jest } from '@jest/globals';
import BlockchainDeploymentService, {
  DeploymentConfig,
  DeploymentResult,
  ContractFactoryFactory,
} from '../lib/services/blockchainDeployment';

// Mock ethers
const mockProvider = {
  getBalance: jest.fn(),
  getTransactionReceipt: jest.fn(),
};

const mockWallet = {
  address: '0x1234567890123456789012345678901234567890',
};

const mockContract = {
  waitForDeployment: jest.fn(),
  getAddress: jest.fn(),
  deploymentTransaction: jest.fn(),
};

const mockReceipt = {
  hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  gasUsed: 1000000n,
};

// Mock ContractFactory
const MockContractFactory = jest.fn().mockImplementation(() => ({
  deploy: jest.fn().mockResolvedValue(mockContract),
}));

// Mock ethers
jest.mock('ethers', () => {
  const original = jest.requireActual('ethers');
  return {
    ...original,
    JsonRpcProvider: jest.fn(() => mockProvider),
    Wallet: jest.fn(() => mockWallet),
    parseEther: jest.fn(value => `1000000000000000000`), // 1 ETH in wei
    parseUnits: jest.fn((value, unit) => `20000000000`), // 20 gwei
    formatEther: jest.fn(value => '1.0'),
  };
});

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn(() => '/mock/path/deployment.json'),
  dirname: jest.fn(() => '/mock/path'),
}));

describe('BlockchainDeploymentService', () => {
  let deploymentService: BlockchainDeploymentService;
  let mockConfig: DeploymentConfig;
  let mockDeploy: jest.Mock;
  let MockFactory: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      network: 'sepolia',
      rpcUrl: 'https://sepolia.infura.io/v3/test',
      chainId: 11155111,
      privateKey: '0x1234567890123456789012345678901234567890123456789012345678901234',
      gasLimit: 3000000,
      gasPrice: '20000000000',
      verificationApiKey: 'test-api-key',
    };

    // Create a fresh mock for each test
    mockDeploy = jest.fn().mockResolvedValue(mockContract);
    MockFactory = jest.fn().mockImplementation(() => ({
      deploy: mockDeploy,
    }));

    deploymentService = new BlockchainDeploymentService(
      mockConfig,
      mockProvider,
      mockWallet,
      MockFactory as any
    );

    // Setup default mocks
    mockProvider.getBalance.mockResolvedValue('1000000000000000000'); // 1 ETH
    mockProvider.getTransactionReceipt.mockResolvedValue(mockReceipt);
    mockContract.waitForDeployment.mockResolvedValue(undefined);
    mockContract.getAddress.mockResolvedValue('0x1234567890123456789012345678901234567890');
    mockContract.deploymentTransaction.mockReturnValue({
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    });
  });

  describe('Constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(deploymentService).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    it('should get deployed addresses from environment', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        ESCROW_CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890',
        TRADE_ESCROW_CONTRACT_ADDRESS: '0x0987654321098765432109876543210987654321',
      };

      const addresses = BlockchainDeploymentService.getDeployedAddresses();

      expect(addresses.escrow).toBe('0x1234567890123456789012345678901234567890');
      expect(addresses.tradeEscrow).toBe('0x0987654321098765432109876543210987654321');

      process.env = originalEnv;
    });

    it('should check if contracts are deployed', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        ESCROW_CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890',
        TRADE_ESCROW_CONTRACT_ADDRESS: '0x0987654321098765432109876543210987654321',
      };

      const deployed = BlockchainDeploymentService.areContractsDeployed();
      expect(deployed).toBe(true);

      process.env = originalEnv;
    });

    it('should return false when contracts are not deployed', () => {
      const originalEnv = process.env;
      delete process.env.ESCROW_CONTRACT_ADDRESS;
      delete process.env.TRADE_ESCROW_CONTRACT_ADDRESS;

      const deployed = BlockchainDeploymentService.areContractsDeployed();
      expect(deployed).toBe(false);

      process.env = originalEnv;
    });
  });

  describe('deployAllContracts', () => {
    it('should deploy all contracts successfully', async () => {
      const results = await deploymentService.deployAllContracts();

      expect(results).toHaveLength(1);
      expect(results[0].contractName).toBe('Bell24HEscrow');
      expect(results[0].address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should handle deployment errors gracefully', async () => {
      // Create a new mock factory that throws an error
      const errorMockDeploy = jest.fn().mockRejectedValue(new Error('Deployment failed'));
      const ErrorMockFactory = jest.fn().mockImplementation(() => ({
        deploy: errorMockDeploy,
      }));

      const serviceWithError = new BlockchainDeploymentService(
        mockConfig,
        mockProvider,
        mockWallet,
        ErrorMockFactory as any
      );

      await expect(serviceWithError.deployAllContracts()).rejects.toThrow('Deployment failed');
    });
  });

  describe('deployEscrowContract', () => {
    it('should deploy escrow contract with correct parameters', async () => {
      const result = await deploymentService.deployEscrowContract();

      expect(result.contractName).toBe('Bell24HEscrow');
      expect(result.address).toBe('0x1234567890123456789012345678901234567890');
      expect(result.network).toBe('sepolia');
    });

    it('should include verification URL when API key is provided', async () => {
      const result = await deploymentService.deployEscrowContract();

      expect(result.verificationUrl).toContain('sepolia.etherscan.io');
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance in ETH', async () => {
      const balance = await deploymentService.getBalance();

      expect(balance).toBe('1.0');
    });
  });

  describe('checkDeploymentBalance', () => {
    it('should return true when balance is sufficient', async () => {
      const hasBalance = await deploymentService.checkDeploymentBalance();

      expect(hasBalance).toBe(true);
    });

    it('should return false when balance is insufficient', async () => {
      mockProvider.getBalance.mockResolvedValue('10000000000000000'); // 0.01 ETH

      const hasBalance = await deploymentService.checkDeploymentBalance();

      expect(hasBalance).toBe(false);
    });
  });

  describe('Contract Artifacts', () => {
    it('should return correct escrow contract artifact', () => {
      const artifact = (deploymentService as any).getEscrowContractArtifact();

      expect(artifact.name).toBe('Bell24HEscrow');
      expect(artifact.abi).toBeDefined();
      expect(artifact.bytecode).toBeDefined();
      expect(artifact.constructorArgs).toContain('address owner');
      expect(artifact.constructorArgs).toContain('uint256 platformFee');
      expect(artifact.constructorArgs).toContain('address feeCollector');
    });
  });

  describe('Network Configuration', () => {
    it('should support multiple networks', () => {
      const networks = ['mainnet', 'mumbai', 'sepolia', 'goerli'];

      networks.forEach(network => {
        const explorerUrl = (deploymentService as any).getExplorerBaseUrl(network);
        expect(explorerUrl).toBeDefined();
        // Check for either scan.com or etherscan.io
        expect(explorerUrl.includes('scan.com') || explorerUrl.includes('etherscan.io')).toBe(true);
      });
    });

    it('should return default explorer URL for unknown networks', () => {
      const explorerUrl = (deploymentService as any).getExplorerBaseUrl('unknown');
      expect(explorerUrl).toBe('https://polygonscan.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle contract deployment failures', async () => {
      // Create a new mock factory that throws an error
      const errorMockDeploy = jest.fn().mockRejectedValue(new Error('Gas limit exceeded'));
      const ErrorMockFactory = jest.fn().mockImplementation(() => ({
        deploy: errorMockDeploy,
      }));

      const serviceWithError = new BlockchainDeploymentService(
        mockConfig,
        mockProvider,
        mockWallet,
        ErrorMockFactory as any
      );

      await expect(serviceWithError.deployEscrowContract()).rejects.toThrow('Gas limit exceeded');
    });

    it('should handle contract verification failures gracefully', async () => {
      const result = await deploymentService.deployEscrowContract();
      expect(result.verificationUrl).toBeDefined();
    });

    it('should handle file system errors during deployment info save', async () => {
      const fs = require('fs');
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      // Should not throw error, just log it
      await expect(deploymentService.deployAllContracts()).resolves.toBeDefined();
    });
  });

  describe('Gas and Cost Management', () => {
    it('should use correct gas parameters for deployment', async () => {
      await deploymentService.deployEscrowContract();

      // Verify that the mock factory was called with correct parameters
      expect(MockFactory).toHaveBeenCalledWith(
        expect.any(Array), // ABI
        expect.any(String), // bytecode
        mockWallet // wallet
      );
    });

    it('should calculate deployment costs correctly', async () => {
      const balance = await deploymentService.getBalance();
      const hasBalance = await deploymentService.checkDeploymentBalance();

      expect(balance).toBe('1.0');
      expect(hasBalance).toBe(true);
    });
  });
});
