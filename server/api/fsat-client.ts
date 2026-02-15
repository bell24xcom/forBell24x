/**
 * FSAT API Client for Bell24H.com
 * 
 * Type-safe API client for communicating with the FSAT (Fast Supplier Allocation Tool)
 * service, which provides supplier matching and RFQ processing capabilities.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { performance } from 'perf_hooks';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API Types and Interfaces
export interface FSATApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// RFQ Data Structures
export interface RFQ {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  categoryIds: string[];
  requirements: RFQRequirement[];
  attachments?: RFQAttachment[];
  status: RFQStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RFQRequirement {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  type: 'numeric' | 'boolean' | 'text' | 'date' | 'file';
  min?: number;
  max?: number;
  options?: string[];
  value?: any;
}

export interface RFQAttachment {
  id: string;
  filename: string;
  contentType: string;
  sizeInBytes: number;
  uploadedAt: string;
  url: string;
}

export type RFQStatus = 'draft' | 'published' | 'matching' | 'matched' | 'awarded' | 'completed' | 'cancelled';

// Supplier Data Structures
export interface Supplier {
  id: string;
  name: string;
  description: string;
  categories: SupplierCategory[];
  capabilities: SupplierCapability[];
  location: GeoLocation;
  contact: ContactInfo;
  rating: SupplierRating;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCategory {
  id: string;
  name: string;
  description: string;
  experienceYears: number;
}

export interface SupplierCapability {
  id: string;
  name: string;
  description: string;
  certifications: string[];
  equipmentDetails?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ContactInfo {
  primaryEmail: string;
  secondaryEmail?: string;
  primaryPhone: string;
  secondaryPhone?: string;
  website?: string;
}

export interface SupplierRating {
  overall: number;
  quality: number;
  costEfficiency: number;
  reliability: number;
  communication: number;
  reviewCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    processingTimeMs: number;
    timestamp: string;
    requestId: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface SupplierMatchResult {
  rfqId: string;
  suppliers: SupplierMatch[];
  processingTimeMs: number;
  algorithmVersion: string;
  matchDate: string;
}

export interface SupplierMatch {
  supplierId: string;
  supplier: Supplier;
  matchScore: number;
  matchFactors: MatchFactor[];
  estimatedResponse: {
    timeToRespondHours: number;
    priceCompetitiveness: 'low' | 'medium' | 'high';
    qualityLevel: 'low' | 'medium' | 'high';
  };
}

export interface MatchFactor {
  name: string;
  score: number;
  weight: number;
  details: string;
}

// API Client Class
export class FSATClient {
  private client: AxiosInstance;
  private config: FSATApiConfig;
  private metrics: {
    requestsTotal: number;
    requestsFailed: number;
    retries: number;
    totalResponseTime: number;
    lastResponseTime: number;
    maxResponseTime: number;
  };

  constructor(config?: Partial<FSATApiConfig>) {
    // Default configuration
    this.config = {
      baseUrl: process.env.FSAT_API_URL || 'https://api.fsatmatch.bell24h.com',
      apiKey: process.env.FSAT_API_KEY || '',
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    // Initialize metrics
    this.metrics = {
      requestsTotal: 0,
      requestsFailed: 0,
      retries: 0,
      totalResponseTime: 0,
      lastResponseTime: 0,
      maxResponseTime: 0
    };

    // Create Axios instance
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Version': '2.0'
      }
    });

    // Add request interceptor for metrics
    this.client.interceptors.request.use((config) => {
      (config as any)._startTime = performance.now();
      return config;
    });

    // Add response interceptor for metrics
    this.client.interceptors.response.use(
      (response) => {
        const startTime = (response.config as any)._startTime;
        if (startTime) {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          this.metrics.requestsTotal++;
          this.metrics.totalResponseTime += responseTime;
          this.metrics.lastResponseTime = responseTime;
          this.metrics.maxResponseTime = Math.max(this.metrics.maxResponseTime, responseTime);
        }
        
        return response;
      },
      async (error) => {
        // Update error metrics
        this.metrics.requestsFailed++;
        
        if (axios.isAxiosError(error) && error.config) {
          const config = error.config;
          
          // Skip retry if this is already a retry or response was received
          const retryCount = (config as any)._retryCount || 0;
          if (retryCount >= this.config.retryAttempts || error.response) {
            return Promise.reject(error);
          }
          
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, retryCount);
          
          // Update retry count
          (config as any)._retryCount = retryCount + 1;
          this.metrics.retries++;
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry request
          return this.client(config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get client metrics
   */
  public getMetrics() {
    return {
      ...this.metrics,
      averageResponseTime: this.metrics.requestsTotal > 0 
        ? this.metrics.totalResponseTime / this.metrics.requestsTotal 
        : 0,
      successRate: this.metrics.requestsTotal > 0 
        ? (this.metrics.requestsTotal - this.metrics.requestsFailed) / this.metrics.requestsTotal 
        : 0
    };
  }

  /**
   * Create a new RFQ
   */
  public async createRFQ(rfq: Omit<RFQ, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<RFQ>> {
    try {
      const response = await this.client.post<ApiResponse<RFQ>>('/rfqs', rfq);
      return response.data;
    } catch (error) {
      return this.handleApiError(error, 'Failed to create RFQ');
    }
  }

  /**
   * Get an RFQ by ID
   */
  public async getRFQ(rfqId: string): Promise<ApiResponse<RFQ>> {
    try {
      const response = await this.client.get<ApiResponse<RFQ>>(`/rfqs/${rfqId}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error, `Failed to get RFQ with ID ${rfqId}`);
    }
  }

  /**
   * Update an existing RFQ
   */
  public async updateRFQ(rfqId: string, updates: Partial<RFQ>): Promise<ApiResponse<RFQ>> {
    try {
      const response = await this.client.put<ApiResponse<RFQ>>(`/rfqs/${rfqId}`, updates);
      return response.data;
    } catch (error) {
      return this.handleApiError(error, `Failed to update RFQ with ID ${rfqId}`);
    }
  }

  /**
   * Delete an RFQ
   */
  public async deleteRFQ(rfqId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await this.client.delete<ApiResponse<boolean>>(`/rfqs/${rfqId}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error, `Failed to delete RFQ with ID ${rfqId}`);
    }
  }

  /**
   * Find suppliers matching an RFQ
   */
  public async findSuppliersForRFQ(rfqId: string, options?: {
    limit?: number;
    minMatchScore?: number;
    locationRadius?: number;
  }): Promise<ApiResponse<SupplierMatchResult>> {
    try {
      const response = await this.client.post<ApiResponse<SupplierMatchResult>>(
        `/rfqs/${rfqId}/match`,
        options
      );
      return response.data;
    } catch (error) {
      return this.handleApiError(error, `Failed to find suppliers for RFQ with ID ${rfqId}`);
    }
  }

  /**
   * Get supplier details
   */
  public async getSupplier(supplierId: string): Promise<ApiResponse<Supplier>> {
    try {
      const response = await this.client.get<ApiResponse<Supplier>>(`/suppliers/${supplierId}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error, `Failed to get supplier with ID ${supplierId}`);
    }
  }

  /**
   * Search suppliers
   */
  public async searchSuppliers(query: {
    keywords?: string;
    categoryIds?: string[];
    location?: Partial<GeoLocation>;
    radius?: number;
    minRating?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Supplier[]>> {
    try {
      const response = await this.client.get<ApiResponse<Supplier[]>>('/suppliers', {
        params: query
      });
      return response.data;
    } catch (error) {
      return this.handleApiError(error, 'Failed to search suppliers');
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any, defaultMessage: string): ApiResponse<any> {
    if (axios.isAxiosError(error) && error.response) {
      // Server responded with an error
      return error.response.data as ApiResponse<any>;
    } else {
      // Network error or other issue
      return {
        success: false,
        error: {
          code: 'CLIENT_ERROR',
          message: error.message || defaultMessage
        },
        meta: {
          processingTimeMs: 0,
          timestamp: new Date().toISOString(),
          requestId: 'client-error'
        }
      };
    }
  }
}

export default FSATClient;
