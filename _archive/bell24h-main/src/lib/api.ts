/**
 * API Utilities for Bell24H
 *
 * This file provides centralized API functions for all Bell24H features
 * including RFQs, suppliers, wallet transactions, and market analytics.
 */

import { buildApiUrl, getApiConfig, isTestMode } from './api-config';

// Helper function for API requests
export const apiRequest = async (method: string, endpoint: string, data?: any) => {
  const config = getApiConfig();
  const fullUrl = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Add auth token if available
      ...(localStorage.getItem('token')
        ? {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        : {}),
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Log API calls in test mode for easier debugging
  if (isTestMode()) {
    console.log(`[TEST API] ${method} ${fullUrl}`, data || '');
  }

  return fetch(fullUrl, options);
};

/**
 * API utility functions for Bell24H.com
 * This file provides a centralized collection of API calls
 */

// RFQ related API calls
export const rfqApi = {
  /**
   * Get RFQs for the current user
   */
  getRfqs: async () => {
    const response = await apiRequest('GET', '/api/rfqs');
    return response.json();
  },

  /**
   * Get a specific RFQ by id
   */
  getRfq: async (id: number) => {
    const response = await apiRequest('GET', `/api/rfqs/${id}`);
    return response.json();
  },

  /**
   * Create a new RFQ
   */
  createRfq: async (data: any) => {
    const response = await apiRequest('POST', '/api/rfqs', data);
    return response.json();
  },

  /**
   * Upload a voice recording for RFQ creation
   */
  uploadVoiceRfq: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_rfq.webm');

    const response = await fetch('/api/rfqs/voice', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to process voice RFQ');
    }

    return response.json();
  },

  /**
   * Upload a video for RFQ
   */
  uploadVideoRfq: async (videoBlob: Blob) => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'video_rfq.mp4');

    const response = await fetch('/api/rfqs/video-upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    return response.json();
  },
};

// Supplier related API calls
export const supplierApi = {
  /**
   * Get all suppliers
   */
  getAllSuppliers: async () => {
    const response = await apiRequest('GET', '/api/suppliers');
    return response.json();
  },

  /**
   * Get top suppliers (highest rated)
   */
  getTopSuppliers: async () => {
    const response = await apiRequest('GET', '/api/suppliers/top');
    return response.json();
  },

  /**
   * Create or update supplier profile
   */
  updateSupplierProfile: async (data: any) => {
    const response = await apiRequest('POST', '/api/suppliers', data);
    return response.json();
  },

  /**
   * Calculate supplier risk score
   */
  calculateRiskScore: async (supplierData: any) => {
    const response = await apiRequest('POST', '/api/suppliers/risk-score', supplierData);
    return response.json();
  },
};

// Wallet and payment related API calls
export const walletApi = {
  /**
   * Get wallet transactions
   */
  getTransactions: async () => {
    const response = await apiRequest('GET', '/api/wallet/transactions');
    return response.json();
  },

  /**
   * Create a new transaction
   */
  createTransaction: async (data: any) => {
    const response = await apiRequest('POST', '/api/wallet/transactions', data);
    return response.json();
  },
};

// Market analytics API calls
export const marketApi = {
  /**
   * Get market trends for a specific industry
   */
  getMarketTrends: async (industry: string) => {
    const response = await apiRequest('GET', `/api/market/trends/${industry}`);
    return response.json();
  },

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await apiRequest('GET', '/api/dashboard/stats');
    return response.json();
  },
};

// Messaging related API calls
export const messageApi = {
  /**
   * Get messages for the current user
   */
  getMessages: async () => {
    const response = await apiRequest('GET', '/api/messages');
    return response.json();
  },

  /**
   * Send a message
   */
  sendMessage: async (data: any) => {
    const response = await apiRequest('POST', '/api/messages', data);
    return response.json();
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (messageIds: number[]) => {
    const response = await apiRequest('POST', '/api/messages/read', { messageIds });
    return response.json();
  },
};

// User and authentication related API calls
export const userApi = {
  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await apiRequest('GET', '/api/auth/user');
    return response.json();
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: any) => {
    const response = await apiRequest('PUT', '/api/user/profile', data);
    return response.json();
  },

  /**
   * Update password
   */
  updatePassword: async (data: any) => {
    const response = await apiRequest('PUT', '/api/user/password', data);
    return response.json();
  },

  /**
   * Validate GST number
   */
  validateGST: async (gstNumber: string) => {
    const response = await apiRequest('POST', '/api/gst/validate', { gstNumber });
    return response.json();
  },
};

// Perplexity API calls for the advanced dashboard
export const perplexityApi = {
  /**
   * Analyze text and get perplexity metrics
   */
  analyzeText: async (text: string, entityType: string, modelType: string) => {
    const response = await apiRequest('POST', '/api/perplexity/analyze', {
      text,
      entityType,
      modelType,
    });
    return response.json();
  },

  /**
   * Get temporal trends for perplexity analysis
   */
  getTemporalTrends: async (entityType: string, timeframe: string) => {
    const response = await apiRequest(
      'GET',
      `/api/perplexity/trends/${entityType}?timeframe=${timeframe}`
    );
    return response.json();
  },

  /**
   * Get competitive insights from perplexity analysis
   */
  getCompetitiveInsights: async (entityType: string) => {
    const response = await apiRequest('GET', `/api/perplexity/competitive/${entityType}`);
    return response.json();
  },

  /**
   * Get market segmentation based on perplexity analysis
   */
  getMarketSegmentation: async (criteria: string) => {
    const response = await apiRequest('GET', `/api/perplexity/segments?criteria=${criteria}`);
    return response.json();
  },

  /**
   * Get success predictions based on perplexity scores
   */
  getSuccessPrediction: async (entityId: string, entityType: string) => {
    const response = await apiRequest('GET', `/api/perplexity/predict/${entityType}/${entityId}`);
    return response.json();
  },

  /**
   * Get improvement recommendations for text
   */
  getImprovements: async (text: string, targetAudience: string) => {
    const response = await apiRequest('POST', '/api/perplexity/improve', {
      text,
      targetAudience,
    });
    return response.json();
  },

  /**
   * Get multilingual analysis of text
   */
  getMultilingualAnalysis: async (text: string, languageCode: string) => {
    const response = await apiRequest('POST', '/api/perplexity/multilingual', {
      text,
      languageCode,
    });
    return response.json();
  },

  /**
   * Get customer perplexity profile
   */
  getCustomerProfile: async (customerId: string) => {
    const response = await apiRequest('GET', `/api/perplexity/customer/${customerId}`);
    return response.json();
  },

  /**
   * Subscribe to real-time perplexity notifications
   */
  subscribeToUpdates: async (entityTypes: string[]) => {
    const response = await apiRequest('POST', '/api/perplexity-realtime/subscribe', {
      entityTypes,
    });
    return response.json();
  },

  /**
   * Test API connection to verify connectivity
   */
  testApiConnection: async () => {
    const response = await apiRequest('GET', '/api/perplexity/test');
    return response.json();
  },

  /**
   * Generate a custom PDF report with visualizations
   */
  generateCustomReport: async (data: any) => {
    const response = await apiRequest('POST', '/api/perplexity/report', data);
    return response.json();
  },
};

class BELL24HApi {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.bell24h.com';
  }

  // Authentication APIs
  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.token = response.token;
    return response;
  }

  async logout() {
    this.token = null;
    return this.request('/auth/logout', {
      method: 'POST',
      requiresAuth: true,
    });
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
      requiresAuth: true,
    });
    this.token = response.token;
    return response;
  }

  // Marketplace APIs
  async getSuppliers(filters: any = {}) {
    return this.request('/suppliers', {
      method: 'GET',
      params: filters,
    });
  }

  async getSupplierById(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'GET',
    });
  }

  async getCategories() {
    return this.request('/categories', {
      method: 'GET',
    });
  }

  async createRFQ(rfqData: any) {
    return this.request('/rfqs', {
      method: 'POST',
      body: JSON.stringify(rfqData),
      requiresAuth: true,
    });
  }

  async getRFQs(filters: any = {}) {
    return this.request('/rfqs', {
      method: 'GET',
      params: filters,
      requiresAuth: true,
    });
  }

  async getRFQById(id: string) {
    return this.request(`/rfqs/${id}`, {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async submitQuote(rfqId: string, quoteData: any) {
    return this.request(`/rfqs/${rfqId}/quotes`, {
      method: 'POST',
      body: JSON.stringify(quoteData),
      requiresAuth: true,
    });
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.request('/dashboard/stats', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async getMyListings() {
    return this.request('/dashboard/listings', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async getMyQuotes() {
    return this.request('/dashboard/quotes', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async getMyOrders() {
    return this.request('/dashboard/orders', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  // AI Services
  async getAIMatch(requirements: any) {
    return this.request('/ai/match', {
      method: 'POST',
      body: JSON.stringify(requirements),
      requiresAuth: true,
    });
  }

  async processVoiceRFQ(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    return this.request('/ai/voice-rfq', {
      method: 'POST',
      body: formData,
      requiresAuth: true,
    });
  }

  async generateRFQFromText(text: string) {
    return this.request('/ai/generate-rfq', {
      method: 'POST',
      body: JSON.stringify({ text }),
      requiresAuth: true,
    });
  }

  // Payment APIs
  async createPaymentOrder(amount: number, currency = 'INR') {
    return this.request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
      requiresAuth: true,
    });
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string) {
    return this.request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ paymentId, orderId, signature }),
      requiresAuth: true,
    });
  }

  async getSubscriptionPlans() {
    return this.request('/payments/plans', {
      method: 'GET',
    });
  }

  // User Profile APIs
  async getUserProfile() {
    return this.request('/user/profile', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async updateUserProfile(profileData: any) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
      requiresAuth: true,
    });
  }

  async uploadProfileImage(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return this.request('/user/profile-image', {
      method: 'POST',
      body: formData,
      requiresAuth: true,
    });
  }

  // Notification APIs
  async getNotifications() {
    return this.request('/notifications', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      requiresAuth: true,
    });
  }

  async updateNotificationSettings(settings: any) {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
      requiresAuth: true,
    });
  }

  // Analytics APIs
  async getAnalytics(period: string = '30d') {
    return this.request(`/analytics?period=${period}`, {
      method: 'GET',
      requiresAuth: true,
    });
  }

  async getSearchAnalytics() {
    return this.request('/analytics/search', {
      method: 'GET',
      requiresAuth: true,
    });
  }

  // Utility method
  private async request(endpoint: string, options: any = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        if (options.params[key] !== undefined && options.params[key] !== null) {
          url.searchParams.append(key, options.params[key]);
        }
      });
    }

    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.requiresAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      ...options,
    };

    if (options.body && !(options.body instanceof FormData)) {
      config.body = options.body;
    } else if (options.body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set it for FormData
      config.body = options.body;
    }

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Token management
  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }
}

export const api = new BELL24HApi();

// Type definitions for better TypeScript support
export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  phone?: string;
  verified: boolean;
  primaryActivity: 'buying' | 'selling' | 'both';
  businessType?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  website?: string;
  verified: boolean;
  ecgcApproved: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  orders: number;
  responseTime: string;
  aiMatchScore: number;
  specialties: string[];
  certifications: string[];
  description: string;
  logo: string;
  priceRange: string;
  successRate: string;
  employees: string;
  revenue: string;
  establishedYear: number;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  quantity?: number;
  budget?: string;
  deadline?: string;
  status: 'active' | 'closed' | 'completed';
  voiceNote?: string;
  videoNote?: string;
  attachments: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId?: string;
}

export interface Quote {
  id: string;
  price: string;
  quantity: number;
  leadTime: string;
  terms?: string;
  validUntil?: string;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  rfqId: string;
  supplierId: string;
  userId: string;
  listingId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  featured: boolean;
  trending: boolean;
}

export interface DashboardStats {
  totalRFQs: number;
  activeQuotes: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyGrowth: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}
