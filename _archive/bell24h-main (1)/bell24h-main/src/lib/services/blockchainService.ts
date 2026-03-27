import {
  JsonRpcProvider,
  Wallet,
  Contract,
  ContractFactory,
  parseEther,
  parseUnits,
  formatEther,
  Signer,
} from 'ethers';

export interface SmartContract {
  address: string;
  name: string;
  abi: any[];
  bytecode: string;
  deployedAt: Date;
  network: string;
}

export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp?: Date;
  data?: string;
}

export interface EscrowContract {
  id: string;
  contractAddress: string;
  buyer: string;
  supplier: string;
  amount: string;
  currency: string;
  status: 'created' | 'funded' | 'in_progress' | 'completed' | 'disputed' | 'cancelled';
  milestones: EscrowMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EscrowMilestone {
  id: string;
  description: string;
  amount: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  evidence?: string[];
  approvedBy?: string;
  approvedAt?: Date;
}

export interface DisputeCase {
  id: string;
  escrowId: string;
  initiator: string;
  reason: string;
  evidence: string[];
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationRecord {
  id: string;
  entityId: string;
  entityType: 'supplier' | 'buyer' | 'product';
  verificationType: 'gstin' | 'iso' | 'bank_account' | 'address' | 'identity';
  status: 'pending' | 'verified' | 'rejected';
  evidence: string[];
  verifiedBy?: string;
  verifiedAt?: Date;
  blockchainTx?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockchainConfig {
  network: 'mumbai' | 'polygon' | 'ethereum' | 'local';
  rpcUrl: string;
  chainId: number;
  privateKey: string;
  gasLimit: number;
  gasPrice: string;
}

class BlockchainService {
  private provider!: JsonRpcProvider;
  private wallet!: Signer;
  private config: BlockchainConfig;
  private contracts: Map<string, SmartContract> = new Map();
  private escrows: Map<string, EscrowContract> = new Map();
  private disputes: Map<string, DisputeCase> = new Map();
  private verifications: Map<string, VerificationRecord> = new Map();

  constructor() {
    this.config = {
      network: (process.env.BLOCKCHAIN_NETWORK as any) || 'mumbai',
      rpcUrl:
        process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-mumbai.infura.io/v3/your-project-id',
      chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '80001'),
      privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
      gasLimit: parseInt(process.env.BLOCKCHAIN_GAS_LIMIT || '3000000'),
      gasPrice: process.env.BLOCKCHAIN_GAS_PRICE || '20000000000',
    };

    this.initializeProvider();
    this.initializeContracts();
  }

  // Provider and Wallet Management
  private initializeProvider(): void {
    this.provider = new JsonRpcProvider(this.config.rpcUrl);

    if (this.config.privateKey) {
      this.wallet = new Wallet(this.config.privateKey, this.provider);
    } else {
      // Generate a new wallet for development
      this.wallet = Wallet.createRandom().connect(this.provider);
      console.warn('No private key provided, using generated wallet for development');
    }
  }

  // Smart Contract Management
  private initializeContracts(): void {
    // Escrow Contract
    const escrowContract: SmartContract = {
      address: process.env.ESCROW_CONTRACT_ADDRESS || '',
      name: 'Bell24HEscrow',
      abi: this.getEscrowABI(),
      bytecode: this.getEscrowBytecode(),
      deployedAt: new Date(),
      network: this.config.network,
    };

    // Verification Contract
    const verificationContract: SmartContract = {
      address: process.env.VERIFICATION_CONTRACT_ADDRESS || '',
      name: 'Bell24HVerification',
      abi: this.getVerificationABI(),
      bytecode: this.getVerificationBytecode(),
      deployedAt: new Date(),
      network: this.config.network,
    };

    this.contracts.set('escrow', escrowContract);
    this.contracts.set('verification', verificationContract);
  }

  // Escrow Contract Functions
  async createEscrow(
    buyer: string,
    supplier: string,
    amount: string,
    currency: string = 'USDC',
    milestones: Omit<EscrowMilestone, 'id' | 'status'>[]
  ): Promise<EscrowContract> {
    const escrowId = this.generateEscrowId();

    const escrowContract = this.contracts.get('escrow');
    if (!escrowContract?.address) {
      throw new Error('Escrow contract not deployed');
    }

    const contract = new Contract(escrowContract.address, escrowContract.abi, this.wallet);

    const milestoneData = milestones.map(milestone => ({
      description: milestone.description,
      amount: parseEther(milestone.amount),
      dueDate: Math.floor(milestone.dueDate.getTime() / 1000),
    }));

    const tx = await contract.createEscrow(
      buyer,
      supplier,
      parseEther(amount),
      currency,
      milestoneData,
      {
        gasLimit: this.config.gasLimit,
        gasPrice: parseUnits(this.config.gasPrice, 'wei'),
      }
    );

    const receipt = await tx.wait();

    const escrow: EscrowContract = {
      id: escrowId,
      contractAddress: escrowContract.address,
      buyer,
      supplier,
      amount,
      currency,
      status: 'created',
      milestones: milestones.map((milestone, index) => ({
        ...milestone,
        id: `${escrowId}_milestone_${index}`,
        status: 'pending',
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.escrows.set(escrowId, escrow);

    // Emit event
    this.emitEvent('escrow_created', { escrow, transactionHash: receipt.transactionHash });

    return escrow;
  }

  async fundEscrow(escrowId: string, amount: string): Promise<BlockchainTransaction> {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    const contract = new Contract(
      escrow.contractAddress,
      this.contracts.get('escrow')!.abi,
      this.wallet
    );

    const tx = await contract.fundEscrow(escrowId, {
      value: parseEther(amount),
      gasLimit: this.config.gasLimit,
      gasPrice: parseUnits(this.config.gasPrice, 'wei'),
    });

    const receipt = await tx.wait();

    escrow.status = 'funded';
    escrow.updatedAt = new Date();

    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      value: amount,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.effectiveGasPrice.toString(),
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      timestamp: new Date(),
    };

    this.emitEvent('escrow_funded', { escrow, transaction });

    return transaction;
  }

  async releaseMilestone(
    escrowId: string,
    milestoneId: string,
    approver: string
  ): Promise<BlockchainTransaction> {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    const milestone = escrow.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    const contract = new Contract(
      escrow.contractAddress,
      this.contracts.get('escrow')!.abi,
      this.wallet
    );

    const tx = await contract.releaseMilestone(escrowId, milestoneId, {
      gasLimit: this.config.gasLimit,
      gasPrice: parseUnits(this.config.gasPrice, 'wei'),
    });

    const receipt = await tx.wait();

    milestone.status = 'approved';
    milestone.approvedBy = approver;
    milestone.approvedAt = new Date();
    escrow.updatedAt = new Date();

    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      value: '0',
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.effectiveGasPrice.toString(),
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      timestamp: new Date(),
    };

    this.emitEvent('milestone_released', { escrow, milestone, transaction });

    return transaction;
  }

  async createDispute(
    escrowId: string,
    initiator: string,
    reason: string,
    evidence: string[]
  ): Promise<DisputeCase> {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    const contract = new Contract(
      escrow.contractAddress,
      this.contracts.get('escrow')!.abi,
      this.wallet
    );

    const tx = await contract.createDispute(escrowId, reason, {
      gasLimit: this.config.gasLimit,
      gasPrice: parseUnits(this.config.gasPrice, 'wei'),
    });

    const receipt = await tx.wait();

    const dispute: DisputeCase = {
      id: this.generateDisputeId(),
      escrowId,
      initiator,
      reason,
      evidence,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.disputes.set(dispute.id, dispute);

    escrow.status = 'disputed';
    escrow.updatedAt = new Date();

    this.emitEvent('dispute_created', {
      dispute,
      escrow,
      transactionHash: receipt.transactionHash,
    });

    return dispute;
  }

  async resolveDispute(
    disputeId: string,
    resolution: string,
    resolver: string
  ): Promise<BlockchainTransaction> {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    const escrow = this.escrows.get(dispute.escrowId);
    if (!escrow) {
      throw new Error('Escrow not found');
    }

    const contract = new Contract(
      escrow.contractAddress,
      this.contracts.get('escrow')!.abi,
      this.wallet
    );

    const tx = await contract.resolveDispute(dispute.escrowId, resolution, {
      gasLimit: this.config.gasLimit,
      gasPrice: parseUnits(this.config.gasPrice, 'wei'),
    });

    const receipt = await tx.wait();

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = resolver;
    dispute.resolvedAt = new Date();
    dispute.updatedAt = new Date();

    escrow.status = 'completed';
    escrow.updatedAt = new Date();

    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      value: '0',
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.effectiveGasPrice.toString(),
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      timestamp: new Date(),
    };

    this.emitEvent('dispute_resolved', { dispute, escrow, transaction });

    return transaction;
  }

  // Verification Functions
  async createVerification(
    entityId: string,
    entityType: VerificationRecord['entityType'],
    verificationType: VerificationRecord['verificationType'],
    evidence: string[]
  ): Promise<VerificationRecord> {
    const verificationId = this.generateVerificationId();

    const verification: VerificationRecord = {
      id: verificationId,
      entityId,
      entityType,
      verificationType,
      status: 'pending',
      evidence,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.verifications.set(verificationId, verification);

    // In a real implementation, this would trigger automated verification
    // For now, we'll simulate verification after a delay
    setTimeout(() => {
      this.simulateVerification(verificationId);
    }, 5000);

    return verification;
  }

  async approveVerification(
    verificationId: string,
    approver: string
  ): Promise<BlockchainTransaction> {
    const verification = this.verifications.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const verificationContract = this.contracts.get('verification');
    if (!verificationContract?.address) {
      throw new Error('Verification contract not deployed');
    }

    const contract = new Contract(
      verificationContract.address,
      verificationContract.abi,
      this.wallet
    );

    const tx = await contract.approveVerification(
      verification.entityId,
      verification.entityType,
      verification.verificationType,
      {
        gasLimit: this.config.gasLimit,
        gasPrice: parseUnits(this.config.gasPrice, 'wei'),
      }
    );

    const receipt = await tx.wait();

    verification.status = 'verified';
    verification.verifiedBy = approver;
    verification.verifiedAt = new Date();
    verification.blockchainTx = receipt.transactionHash;
    verification.updatedAt = new Date();

    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      value: '0',
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.effectiveGasPrice.toString(),
      status: 'confirmed',
      blockNumber: receipt.blockNumber,
      timestamp: new Date(),
    };

    this.emitEvent('verification_approved', { verification, transaction });

    return transaction;
  }

  // Query Functions
  async getEscrow(escrowId: string): Promise<EscrowContract | null> {
    return this.escrows.get(escrowId) || null;
  }

  async getEscrowsByUser(userAddress: string): Promise<EscrowContract[]> {
    return Array.from(this.escrows.values()).filter(
      escrow => escrow.buyer === userAddress || escrow.supplier === userAddress
    );
  }

  async getDispute(disputeId: string): Promise<DisputeCase | null> {
    return this.disputes.get(disputeId) || null;
  }

  async getDisputesByEscrow(escrowId: string): Promise<DisputeCase[]> {
    return Array.from(this.disputes.values()).filter(dispute => dispute.escrowId === escrowId);
  }

  async getVerification(verificationId: string): Promise<VerificationRecord | null> {
    return this.verifications.get(verificationId) || null;
  }

  async getVerificationsByEntity(entityId: string): Promise<VerificationRecord[]> {
    return Array.from(this.verifications.values()).filter(
      verification => verification.entityId === entityId
    );
  }

  // Blockchain Utilities
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return formatEther(balance);
  }

  async getTransaction(hash: string): Promise<BlockchainTransaction | null> {
    try {
      const tx = await this.provider.getTransaction(hash);
      const receipt = await this.provider.getTransactionReceipt(hash);

      if (!tx || !receipt) return null;

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: formatEther(tx.value),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        data: tx.data,
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  // Contract Deployment
  async deployEscrowContract(): Promise<string> {
    const contract = new ContractFactory(
      this.getEscrowABI(),
      this.getEscrowBytecode(),
      this.wallet
    );

    const deployedContract = await contract.deploy({
      gasLimit: this.config.gasLimit,
      gasPrice: parseUnits(this.config.gasPrice, 'wei'),
    });

    await deployedContract.waitForDeployment();

    const escrowContract = this.contracts.get('escrow')!;
    escrowContract.address = deployedContract.target as string;
    escrowContract.deployedAt = new Date();

    return deployedContract.target as string;
  }

  async deployVerificationContract(): Promise<string> {
    const contract = new ContractFactory(
      this.getVerificationABI(),
      this.getVerificationBytecode(),
      this.wallet
    );

    const deployedContract = await contract.deploy({
      gasLimit: this.config.gasLimit,
      gasPrice: parseUnits(this.config.gasPrice, 'wei'),
    });

    await deployedContract.waitForDeployment();

    const verificationContract = this.contracts.get('verification')!;
    verificationContract.address = deployedContract.target as string;
    verificationContract.deployedAt = new Date();

    return deployedContract.target as string;
  }

  // Private Helper Methods
  private generateEscrowId(): string {
    return `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDisputeId(): string {
    return `dispute_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVerificationId(): string {
    return `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private simulateVerification(verificationId: string): void {
    const verification = this.verifications.get(verificationId);
    if (verification) {
      verification.status = 'verified';
      verification.verifiedAt = new Date();
      verification.updatedAt = new Date();

      this.emitEvent('verification_completed', { verification });
    }
  }

  private emitEvent(eventName: string, data: any): void {
    // In a real implementation, this would emit events to a message queue
    // or WebSocket for real-time updates
    console.log(`Blockchain Event: ${eventName}`, data);
  }

  // Contract ABIs and Bytecode (Simplified versions)
  private getEscrowABI(): any[] {
    return [
      'function createEscrow(address buyer, address supplier, uint256 amount, string currency, tuple(string description, uint256 amount, uint256 dueDate)[] milestones) external',
      'function fundEscrow(string escrowId) external payable',
      'function releaseMilestone(string escrowId, string milestoneId) external',
      'function createDispute(string escrowId, string reason) external',
      'function resolveDispute(string escrowId, string resolution) external',
      'event EscrowCreated(string escrowId, address buyer, address supplier, uint256 amount)',
      'event EscrowFunded(string escrowId, uint256 amount)',
      'event MilestoneReleased(string escrowId, string milestoneId)',
      'event DisputeCreated(string escrowId, string reason)',
      'event DisputeResolved(string escrowId, string resolution)',
    ];
  }

  private getEscrowBytecode(): string {
    // This would be the actual compiled bytecode
    return '0x608060405234801561001057600080fd5b50604051610...'; // Simplified
  }

  private getVerificationABI(): any[] {
    return [
      'function approveVerification(string entityId, string entityType, string verificationType) external',
      'function revokeVerification(string entityId, string entityType, string verificationType) external',
      'function isVerified(string entityId, string entityType, string verificationType) external view returns (bool)',
      'event VerificationApproved(string entityId, string entityType, string verificationType, address approver)',
      'event VerificationRevoked(string entityId, string entityType, string verificationType, address revoker)',
    ];
  }

  private getVerificationBytecode(): string {
    // This would be the actual compiled bytecode
    return '0x608060405234801561001057600080fd5b50604051610...'; // Simplified
  }
}

export const blockchainService = new BlockchainService();
