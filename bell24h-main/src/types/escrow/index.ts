// Smart Contract Escrow Type Definitions for Bell24H

export interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerAddress: string;
  sellerAddress: string;
  escrowAddress: string;
  amount: number;
  currency: 'INR' | 'USD' | 'ETH' | 'USDC';
  status: 'created' | 'funded' | 'pending_delivery' | 'completed' | 'disputed' | 'refunded';
  milestones: EscrowMilestone[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  disputeResolver?: string;
  fees: {
    platformFee: number;
    blockchainFee: number;
    totalFee: number;
  };
}

export interface EscrowMilestone {
  id: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'disputed';
  requiredConfirmations: number;
  currentConfirmations: number;
  evidence: string[];
  completedAt?: string;
}

export interface SmartContractConfig {
  contractAddress: string;
  network: 'ethereum' | 'polygon' | 'binance' | 'arbitrum';
  gasLimit: number;
  gasPrice: string;
  confirmationsRequired: number;
}

export interface EscrowStats {
  totalValue: number;
  activeEscrows: number;
  completedEscrows: number;
  disputedEscrows: number;
  platformRevenue: number;
}
