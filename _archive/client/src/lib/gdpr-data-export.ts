/**
 * Bell24H GDPR Data Export System
 *
 * Comprehensive user data export functionality
 * Implements GDPR Article 20 - Right to Data Portability
 */

export interface UserDataExport {
  profile: UserProfile;
  company: CompanyData;
  rfqs: RFQData[];
  orders: OrderData[];
  suppliers: SupplierData[];
  communications: CommunicationData[];
  preferences: PreferenceData;
  analytics: AnalyticsData;
  consents: ConsentData[];
  exportMetadata: ExportMetadata;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  avatar?: string;
  registrationDate: Date;
  lastLoginDate?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: 'active' | 'suspended' | 'pending';
  role: 'user' | 'admin' | 'enterprise';
}

export interface CompanyData {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  address: string;
  gstin?: string;
  pan?: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  verificationDate?: Date;
  companyDocuments: string[];
}

export interface RFQData {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  quantity: number;
  unit: string;
  budget: number;
  currency: string;
  deadline: Date;
  location: string;
  specifications: Record<string, any>;
  attachments: string[];
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  responses: RFQResponse[];
}

export interface RFQResponse {
  id: string;
  supplierId: string;
  supplierName: string;
  price: number;
  currency: string;
  description: string;
  deliveryTime: number;
  validityPeriod: number;
  attachments: string[];
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: Date;
}

export interface OrderData {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  deliveredAt?: Date;
  trackingNumber?: string;
  milestones: OrderMilestone[];
}

export interface OrderMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'disputed';
  dueDate: Date;
  completedDate?: Date;
}

export interface SupplierData {
  id: string;
  name: string;
  description: string;
  categories: string[];
  location: string;
  rating: number;
  totalOrders: number;
  relationshipDate: Date;
  lastInteraction: Date;
  savedToFavorites: boolean;
  communicationHistory: CommunicationRecord[];
}

export interface CommunicationData {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'system' | 'voice';
  subject?: string;
  content: string;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  relatedEntity?: {
    type: 'rfq' | 'order' | 'supplier';
    id: string;
  };
}

export interface CommunicationRecord {
  id: string;
  type: 'message' | 'call' | 'meeting' | 'email';
  content: string;
  timestamp: Date;
  participants: string[];
}

export interface PreferenceData {
  language: string;
  timezone: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
    rfqUpdates: boolean;
    marketingEmails: boolean;
    priceAlerts: boolean;
    systemUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    dataSharing: boolean;
    analyticsTracking: boolean;
    marketingPersonalization: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface AnalyticsData {
  searchHistory: SearchRecord[];
  pageViews: PageViewRecord[];
  featureUsage: FeatureUsageRecord[];
  performanceMetrics: PerformanceMetric[];
  userBehavior: BehaviorRecord[];
}

export interface SearchRecord {
  id: string;
  query: string;
  category?: string;
  results: number;
  timestamp: Date;
  clickedResults: string[];
}

export interface PageViewRecord {
  id: string;
  page: string;
  url: string;
  timestamp: Date;
  duration: number;
  referrer?: string;
  userAgent: string;
}

export interface FeatureUsageRecord {
  feature: string;
  usage: number;
  lastUsed: Date;
  totalTime: number;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  timestamp: Date;
}

export interface BehaviorRecord {
  action: string;
  context: Record<string, any>;
  timestamp: Date;
}

export interface ConsentData {
  id: string;
  type: 'cookie' | 'marketing' | 'data-processing' | 'third-party';
  granted: boolean;
  grantedAt: Date;
  withdrawnAt?: Date;
  version: string;
  ipAddress: string;
  userAgent: string;
}

export interface ExportMetadata {
  exportId: string;
  userId: string;
  requestedAt: Date;
  exportedAt: Date;
  dataRange: {
    from: Date;
    to: Date;
  };
  totalRecords: number;
  exportFormat: 'json' | 'csv' | 'xml';
  fileSize: number;
  checksum: string;
  retentionPeriod: number; // days
}

export class GDPRDataExport {
  private apiEndpoint = '/api/gdpr/export';
  private maxRetentionDays = 30;

  /**
   * Request user data export
   */
  async requestDataExport(
    userId: string,
    options: {
      format?: 'json' | 'csv' | 'xml';
      dateRange?: {
        from: Date;
        to: Date;
      };
      includeAnalytics?: boolean;
    } = {}
  ): Promise<{ exportId: string; estimatedTime: number }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          format: options.format || 'json',
          dateRange: options.dateRange || {
            from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
            to: new Date(),
          },
          includeAnalytics: options.includeAnalytics || false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        exportId: result.exportId,
        estimatedTime: result.estimatedTime,
      };
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw error;
    }
  }

  /**
   * Check export status
   */
  async checkExportStatus(exportId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    downloadUrl?: string;
    expiresAt?: Date;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/status/${exportId}`);

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking export status:', error);
      throw error;
    }
  }

  /**
   * Download export file
   */
  async downloadExport(exportId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.apiEndpoint}/download/${exportId}`);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }

  /**
   * Get export history
   */
  async getExportHistory(userId: string): Promise<ExportMetadata[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/history/${userId}`);

      if (!response.ok) {
        throw new Error(`History retrieval failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.exports || [];
    } catch (error) {
      console.error('Error getting export history:', error);
      throw error;
    }
  }

  /**
   * Delete export file
   */
  async deleteExport(exportId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiEndpoint}/delete/${exportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting export:', error);
      throw error;
    }
  }

  /**
   * Generate export filename
   */
  generateExportFilename(userId: string, format: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `bell24h-data-export-${userId}-${timestamp}.${format}`;
  }

  /**
   * Validate export data
   */
  validateExportData(data: UserDataExport): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate required fields
    if (!data.profile?.id) errors.push('Profile ID is required');
    if (!data.profile?.email) errors.push('Profile email is required');
    if (!data.exportMetadata?.exportId) errors.push('Export metadata is required');

    // Validate data consistency
    if (data.rfqs?.length > 0) {
      data.rfqs.forEach((rfq, index) => {
        if (!rfq.id) errors.push(`RFQ ${index + 1} is missing ID`);
        if (!rfq.title) errors.push(`RFQ ${index + 1} is missing title`);
      });
    }

    // Validate date ranges
    if (data.exportMetadata?.dataRange) {
      const { from, to } = data.exportMetadata.dataRange;
      if (from > to) errors.push('Invalid date range: from date is after to date');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate export file size estimate
   */
  calculateExportSize(data: UserDataExport): number {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }

  /**
   * Generate export checksum
   */
  async generateChecksum(data: UserDataExport): Promise<string> {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Format data for CSV export
   */
  formatForCSV(data: UserDataExport): Record<string, string> {
    const csvData: Record<string, string> = {};

    // Profile data
    csvData['profile.csv'] = this.objectToCSV([data.profile]);

    // Company data
    if (data.company) {
      csvData['company.csv'] = this.objectToCSV([data.company]);
    }

    // RFQ data
    if (data.rfqs?.length > 0) {
      csvData['rfqs.csv'] = this.objectToCSV(data.rfqs);
    }

    // Orders data
    if (data.orders?.length > 0) {
      csvData['orders.csv'] = this.objectToCSV(data.orders);
    }

    // Suppliers data
    if (data.suppliers?.length > 0) {
      csvData['suppliers.csv'] = this.objectToCSV(data.suppliers);
    }

    // Communications data
    if (data.communications?.length > 0) {
      csvData['communications.csv'] = this.objectToCSV(data.communications);
    }

    return csvData;
  }

  /**
   * Convert object array to CSV string
   */
  private objectToCSV(objects: any[]): string {
    if (!objects || objects.length === 0) return '';

    const headers = Object.keys(objects[0]);
    const csvRows = [headers.join(',')];

    for (const obj of objects) {
      const values = headers.map(header => {
        const value = obj[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

// Global instance
export const gdprDataExport = new GDPRDataExport();

// Utility functions
export const exportUtils = {
  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Format estimated time
   */
  formatEstimatedTime(minutes: number): string {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hours ${mins > 0 ? mins + ' minutes' : ''}`;
  },

  /**
   * Check if export is expired
   */
  isExportExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  },
};
