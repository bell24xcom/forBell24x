import { ethers } from 'ethers';
import { z } from 'zod';

// Blockchain security configuration
export const BLOCKCHAIN_SECURITY_CONFIG = {
  // Transaction limits
  limits: {
    maxTransactionAmount: ethers.parseEther('100'), // 100 ETH
    maxDailyTransactions: 50,
    maxGasLimit: 500000,
    maxGasPrice: ethers.parseUnits('100', 'gwei'), // 100 gwei
  },

  // Multi-signature configuration
  multisig: {
    requiredSignatures: 2,
    maxSigners: 5,
    timelock: 24 * 60 * 60, // 24 hours
  },

  // Fraud detection
  fraudDetection: {
    suspiciousAmountThreshold: ethers.parseEther('10'), // 10 ETH
    rapidTransactionThreshold: 5, // transactions per minute
    unusualPatternThreshold: 0.8, // 80% confidence
  },

  // Payment processor security
  paymentProcessor: {
    webhookTimeout: 30000, // 30 seconds
    signatureExpiry: 5 * 60, // 5 minutes
    maxRetries: 3,
  },

  // Smart contract security
  smartContract: {
    maxGasLimit: 3000000,
    requiredConfirmations: 3,
    timeout: 5 * 60 * 1000, // 5 minutes
  },
};

// Blockchain security validation schemas
export const blockchainSchemas = {
  transaction: z.object({
    to: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
    value: z.string().refine(val => {
      try {
        const amount = ethers.parseEther(val);
        return amount <= BLOCKCHAIN_SECURITY_CONFIG.limits.maxTransactionAmount;
      } catch {
        return false;
      }
    }, 'Transaction amount exceeds limit'),
    gasLimit: z.number().max(BLOCKCHAIN_SECURITY_CONFIG.limits.maxGasLimit, 'Gas limit too high'),
    gasPrice: z.string().refine(val => {
      try {
        const price = ethers.parseUnits(val, 'gwei');
        return price <= BLOCKCHAIN_SECURITY_CONFIG.limits.maxGasPrice;
      } catch {
        return false;
      }
    }, 'Gas price too high'),
    data: z.string().optional(),
    nonce: z.number().min(0),
  }),

  payment: z.object({
    amount: z.number().positive('Amount must be positive'),
    currency: z.enum(['INR', 'USD', 'EUR']),
    description: z.string().min(1, 'Description is required'),
    metadata: z.record(z.string()).optional(),
    webhookUrl: z.string().url('Invalid webhook URL').optional(),
  }),

  multisigTransaction: z.object({
    signers: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')),
    requiredSignatures: z.number().min(2).max(5),
    transaction: z.object({
      to: z.string(),
      value: z.string(),
      data: z.string().optional(),
    }),
    timelock: z.number().min(0),
  }),

  webhookSignature: z.object({
    signature: z.string(),
    timestamp: z.number(),
    payload: z.string(),
  }),
};

// Blockchain security class
export class BlockchainSecurity {
  private static instance: BlockchainSecurity;
  private transactionHistory: Map<string, any[]> = new Map();
  private suspiciousActivities: Map<string, any[]> = new Map();
  private privateKeyStore: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): BlockchainSecurity {
    if (!BlockchainSecurity.instance) {
      BlockchainSecurity.instance = new BlockchainSecurity();
    }
    return BlockchainSecurity.instance;
  }

  // Secure private key management
  async storePrivateKey(userId: string, privateKey: string, password: string): Promise<string> {
    // In production, use hardware security modules (HSM) or secure key management services
    const encryptedKey = await this.encryptPrivateKey(privateKey, password);
    const keyId = this.generateKeyId();

    this.privateKeyStore.set(keyId, encryptedKey);

    return keyId;
  }

  async retrievePrivateKey(keyId: string, password: string): Promise<string> {
    const encryptedKey = this.privateKeyStore.get(keyId);
    if (!encryptedKey) {
      throw new Error('Private key not found');
    }

    return await this.decryptPrivateKey(encryptedKey, password);
  }

  private async encryptPrivateKey(privateKey: string, password: string): Promise<string> {
    // In production, use proper encryption libraries
    const encoder = new TextEncoder();
    const keyData = encoder.encode(password);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'PBKDF2' }, false, [
      'deriveBits',
      'deriveKey',
    ]);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = encoder.encode(privateKey);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, data);

    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(encryptedArray, salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  private async decryptPrivateKey(encryptedKey: string, password: string): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedKey)
        .split('')
        .map(char => char.charCodeAt(0))
    );

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const encoder = new TextEncoder();
    const keyData = encoder.encode(password);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'PBKDF2' }, false, [
      'deriveBits',
      'deriveKey',
    ]);

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, derivedKey, encrypted);

    return new TextDecoder().decode(decrypted);
  }

  private generateKeyId(): string {
    return crypto.randomUUID();
  }

  // Transaction validation and security
  validateTransaction(
    transaction: any,
    userAddress: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate transaction schema
      blockchainSchemas.transaction.parse(transaction);

      // Check transaction amount
      const amount = ethers.parseEther(transaction.value);
      if (amount > BLOCKCHAIN_SECURITY_CONFIG.limits.maxTransactionAmount) {
        errors.push('Transaction amount exceeds maximum limit');
      }

      // Check daily transaction limit
      const userHistory = this.transactionHistory.get(userAddress) || [];
      const today = new Date().toDateString();
      const todayTransactions = userHistory.filter(
        tx => new Date(tx.timestamp).toDateString() === today
      );

      if (todayTransactions.length >= BLOCKCHAIN_SECURITY_CONFIG.limits.maxDailyTransactions) {
        errors.push('Daily transaction limit exceeded');
      }

      // Check for suspicious patterns
      if (this.detectSuspiciousPattern(userAddress, transaction)) {
        errors.push('Suspicious transaction pattern detected');
      }

      // Validate gas settings
      if (transaction.gasLimit > BLOCKCHAIN_SECURITY_CONFIG.limits.maxGasLimit) {
        errors.push('Gas limit too high');
      }

      const gasPrice = ethers.parseUnits(transaction.gasPrice, 'gwei');
      if (gasPrice > BLOCKCHAIN_SECURITY_CONFIG.limits.maxGasPrice) {
        errors.push('Gas price too high');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(err => err.message));
      } else {
        errors.push('Invalid transaction format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Fraud detection
  detectSuspiciousPattern(userAddress: string, transaction: any): boolean {
    const userHistory = this.transactionHistory.get(userAddress) || [];
    const now = Date.now();

    // Check for rapid transactions
    const recentTransactions = userHistory.filter(
      tx => now - tx.timestamp < 60000 // Last minute
    );

    if (
      recentTransactions.length >=
      BLOCKCHAIN_SECURITY_CONFIG.fraudDetection.rapidTransactionThreshold
    ) {
      return true;
    }

    // Check for unusual amounts
    const amount = ethers.parseEther(transaction.value);
    if (amount > BLOCKCHAIN_SECURITY_CONFIG.fraudDetection.suspiciousAmountThreshold) {
      return true;
    }

    // Check for unusual patterns (simplified)
    const averageAmount =
      userHistory.length > 0
        ? userHistory.reduce((sum, tx) => sum + Number(tx.value), 0) / userHistory.length
        : 0;

    if (averageAmount > 0 && amount > averageAmount * 10) {
      return true;
    }

    return false;
  }

  // Record transaction for monitoring
  recordTransaction(userAddress: string, transaction: any, txHash?: string): void {
    const userHistory = this.transactionHistory.get(userAddress) || [];
    userHistory.push({
      ...transaction,
      timestamp: Date.now(),
      txHash,
    });

    this.transactionHistory.set(userAddress, userHistory);

    // Check for suspicious activity
    if (this.detectSuspiciousPattern(userAddress, transaction)) {
      const suspicious = this.suspiciousActivities.get(userAddress) || [];
      suspicious.push({
        transaction,
        timestamp: Date.now(),
        reason: 'Suspicious pattern detected',
      });
      this.suspiciousActivities.set(userAddress, suspicious);
    }
  }

  // Multi-signature transaction management
  createMultisigTransaction(
    signers: string[],
    requiredSignatures: number,
    transaction: any
  ): string {
    const multisigId = crypto.randomUUID();

    const multisigTx = {
      id: multisigId,
      signers,
      requiredSignatures,
      transaction,
      signatures: [],
      timelock: Date.now() + BLOCKCHAIN_SECURITY_CONFIG.multisig.timelock * 1000,
      status: 'pending',
    };

    // Store multisig transaction (in production, use database)
    this.privateKeyStore.set(multisigId, JSON.stringify(multisigTx));

    return multisigId;
  }

  signMultisigTransaction(multisigId: string, signerAddress: string, signature: string): boolean {
    const multisigData = this.privateKeyStore.get(multisigId);
    if (!multisigData) {
      return false;
    }

    const multisigTx = JSON.parse(multisigData);

    // Check if signer is authorized
    if (!multisigTx.signers.includes(signerAddress)) {
      return false;
    }

    // Check if already signed
    if (multisigTx.signatures.some((sig: any) => sig.signer === signerAddress)) {
      return false;
    }

    // Add signature
    multisigTx.signatures.push({
      signer: signerAddress,
      signature,
      timestamp: Date.now(),
    });

    // Check if enough signatures
    if (multisigTx.signatures.length >= multisigTx.requiredSignatures) {
      multisigTx.status = 'ready';
    }

    this.privateKeyStore.set(multisigId, JSON.stringify(multisigTx));
    return true;
  }

  // Payment processor security
  async validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const expectedSignature = await this.generateWebhookSignature(payload, secret);
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature validation error:', error);
      return false;
    }
  }

  async generateWebhookSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + secret);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Smart contract interaction security
  validateContractAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  validateContractInteraction(
    contractAddress: string,
    method: string,
    params: any[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate contract address
    if (!this.validateContractAddress(contractAddress)) {
      errors.push('Invalid contract address');
    }

    // Validate method name
    if (!method || typeof method !== 'string') {
      errors.push('Invalid method name');
    }

    // Validate parameters
    if (!Array.isArray(params)) {
      errors.push('Invalid parameters format');
    }

    // Check for dangerous methods
    const dangerousMethods = ['selfdestruct', 'suicide', 'delegatecall'];
    if (dangerousMethods.includes(method.toLowerCase())) {
      errors.push('Dangerous method detected');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Security monitoring and alerts
  getSuspiciousActivities(userAddress?: string): any[] {
    if (userAddress) {
      return this.suspiciousActivities.get(userAddress) || [];
    }

    const allActivities: any[] = [];
    for (const activities of this.suspiciousActivities.values()) {
      allActivities.push(...activities);
    }

    return allActivities;
  }

  getTransactionHistory(userAddress: string): any[] {
    return this.transactionHistory.get(userAddress) || [];
  }

  // Clean up old data
  cleanupOldData(): void {
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

    // Clean up old transaction history
    for (const [address, history] of this.transactionHistory.entries()) {
      const filtered = history.filter(tx => now - tx.timestamp < maxAge);
      if (filtered.length === 0) {
        this.transactionHistory.delete(address);
      } else {
        this.transactionHistory.set(address, filtered);
      }
    }

    // Clean up old suspicious activities
    for (const [address, activities] of this.suspiciousActivities.entries()) {
      const filtered = activities.filter(activity => now - activity.timestamp < maxAge);
      if (filtered.length === 0) {
        this.suspiciousActivities.delete(address);
      } else {
        this.suspiciousActivities.set(address, filtered);
      }
    }
  }
}

// Export singleton instance
export const blockchainSecurity = BlockchainSecurity.getInstance();

// Utility functions
export const blockchainUtils = {
  // Generate secure random wallet
  generateSecureWallet(): { address: string; privateKey: string } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  },

  // Validate Ethereum address
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  },

  // Format transaction amount
  formatAmount(amount: string, decimals: number = 18): string {
    try {
      return ethers.formatUnits(amount, decimals);
    } catch {
      return '0';
    }
  },

  // Parse transaction amount
  parseAmount(amount: string, decimals: number = 18): string {
    try {
      return ethers.parseUnits(amount, decimals).toString();
    } catch {
      return '0';
    }
  },

  // Generate transaction hash
  async generateTxHash(from: string, to: string, value: string, nonce: number): Promise<string> {
    const data = `${from}${to}${value}${nonce}`;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hash));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
};
