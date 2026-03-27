// Global type declarations for missing modules

declare module '@shared/schema' {
  export interface AccessControlList {
    id: string;
    userId: string;
    resource: string;
    permissions: string[];
  }

  export interface Bid {
    id: string;
    rfqId: string;
    supplierId: string;
    amount: number;
    description: string;
    status: string;
  }

  export interface Contract {
    id: string;
    buyerId: string;
    supplierId: string;
    rfqId: string;
    status: string;
  }

  export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
  }

  export interface Organization {
    id: string;
    name: string;
    type: string;
  }

  export interface RFQ {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    budget: number;
    currency: string;
    status: string;
    deadline: Date;
    createdAt: Date;
    userId: string;
    attachments: string;
  }

  export interface Transaction {
    id: string;
    walletId: string;
    amount: number;
    type: string;
    status: string;
    timestamp: Date;
  }

  export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    name?: string;
  }

  export type InsertBid = Omit<Bid, 'id'>;
  export type InsertContract = Omit<Contract, 'id'>;
  export type InsertMessage = Omit<Message, 'id'>;
  export type InsertRFQ = Omit<RFQ, 'id'>;
  export type InsertTransaction = Omit<Transaction, 'id'>;

  export function insertAccessControlListSchema(): any;
  export function insertOrganizationSchema(): any;
}

declare module '../services/azrService' {
  export interface AZRRequestOptions {
    prompt: string;
    maxTokens?: number;
  }

  export interface AZRExplanation {
    explanation: string;
    confidence: number;
  }

  export const azrService: {
    generateExplanation(options: AZRRequestOptions): Promise<AZRExplanation>;
  };
}

declare module '../services/rlvrService' {
  export const rlvrService: {
    analyzeRisk(data: any): Promise<any>;
  };
}

declare module '../services/azrCoderService' {
  export interface AZRCodeAnalysis {
    analysis: string;
    suggestions: string[];
  }

  export interface AZRCodeCompletion {
    completion: string;
    confidence: number;
  }

  export interface AZRTestGeneration {
    tests: string[];
    coverage: number;
  }
}

declare module '../config/azrCoderConfig' {
  export const AZR_CODER_CONFIG: {
    apiKey: string;
    endpoint: string;
  };
}

declare module '../contexts/AZRCoderContext' {
  export function useAZRCoder(): {
    isEnabled: boolean;
    toggleEnabled: () => void;
  };
}

declare module '../contexts/CurrencyContext' {
  export function useCurrency(): {
    currency: string;
    setCurrency: (currency: string) => void;
  };
}

declare module '../contexts/PaymentContext' {
  export function usePayment(): {
    processPayment: (amount: number) => Promise<void>;
  };
}

declare module '../contexts/SearchContext' {
  export function useSearch(): {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  };
}

declare module '../utils/api' {
  export function fetchWithTimeout(
    url: string,
    options?: RequestInit,
    timeout?: number
  ): Promise<Response>;
  export function createQueryKey(base: string, params?: Record<string, any>): string[];
  export function handleApiError(error: any): void;
  export function isRetryableError(error: any): boolean;
}

declare module '../utils/performance' {
  export function measureComponentRender(componentName: string): void;
  export function measureUserTiming(label: string): void;
}

declare module '../utils/notificationService' {
  export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
  }

  export function sendNotification(message: string, type: NotificationType): void;
  export function storeNotification(notification: any): void;
}

declare module '@/providers/AuthProvider' {
  export function useAuth(): {
    user: any;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
  };
}

declare module '@/services/blockchain/blockchainService' {
  export class BlockchainService {
    constructor();
    createTransaction(to: string, amount: string): Promise<any>;
  }
}

declare module '@/utils/api' {
  export function apiRequest(method: string, url: string, data?: any): Promise<any>;
}

declare module '../services/search/types' {
  export interface SearchSuggestion {
    text: string;
    type: string;
  }
}

// Add missing type for ExportOptions
declare global {
  interface ExportOptions {
    format: 'csv' | 'excel' | 'pdf';
    filename?: string;
    includeHeaders?: boolean;
    dateFormat?: string;
  }

  interface SearchAnalytics {
    query: string;
    timestamp: Date;
    results: number;
    success: boolean;
    duration: number;
  }
}

interface Window {
  ethereum?: any;
}
