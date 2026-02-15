/**
 * Bell24H Right to be Forgotten System
 *
 * Implements GDPR Article 17 - Right to Erasure
 * Comprehensive data deletion with audit trails
 */

export interface DeletionRequest {
  id: string;
  userId: string;
  requestedAt: Date;
  reason: DeletionReason;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  estimatedCompletion: Date;
  actualCompletion?: Date;
  verificationRequired: boolean;
  reviewedBy?: string;
  rejectionReason?: string;
  deletedDataTypes: string[];
  retainedDataTypes: RetainedData[];
  auditTrail: DeletionAuditEntry[];
}

export interface DeletionReason {
  type:
    | 'withdrawal_consent'
    | 'no_longer_necessary'
    | 'unlawful_processing'
    | 'compliance_obligation'
    | 'object_to_processing'
    | 'direct_marketing';
  description?: string;
  legalBasis?: string;
}

export interface RetainedData {
  dataType: string;
  reason:
    | 'legal_obligation'
    | 'public_interest'
    | 'freedom_expression'
    | 'scientific_research'
    | 'archival_purposes';
  legalBasis: string;
  retentionPeriod: number; // days
  description: string;
}

export interface DeletionAuditEntry {
  timestamp: Date;
  action: string;
  performedBy: string;
  details: string;
  ipAddress: string;
  systemInfo: string;
}

export interface DeletionScope {
  profile: boolean;
  company: boolean;
  rfqs: boolean;
  orders: boolean;
  communications: boolean;
  analytics: boolean;
  backups: boolean;
  thirdPartyShares: boolean;
  cookies: boolean;
  logs: boolean;
}

export interface DataRetentionPolicy {
  dataType: string;
  category: 'personal' | 'business' | 'technical' | 'legal';
  retentionPeriod: number; // days
  legalBasis: string;
  canBeDeleted: boolean;
  minimumRetention?: number; // days
  description: string;
}

// Data retention policies for different data types
export const DATA_RETENTION_POLICIES: DataRetentionPolicy[] = [
  {
    dataType: 'profile_data',
    category: 'personal',
    retentionPeriod: 0, // Can be deleted immediately
    legalBasis: 'Consent (GDPR Article 6(1)(a))',
    canBeDeleted: true,
    description: 'User profile information including name, email, phone, preferences',
  },
  {
    dataType: 'rfq_data',
    category: 'business',
    retentionPeriod: 2555, // 7 years for business records
    legalBasis: 'Legitimate business interest + Legal obligation',
    canBeDeleted: false,
    minimumRetention: 2555,
    description: 'RFQ records required for business and tax compliance',
  },
  {
    dataType: 'financial_transactions',
    category: 'legal',
    retentionPeriod: 2555, // 7 years
    legalBasis: 'Legal obligation (Tax and Financial regulations)',
    canBeDeleted: false,
    minimumRetention: 2555,
    description: 'Payment records, invoices, tax-related financial data',
  },
  {
    dataType: 'communication_logs',
    category: 'business',
    retentionPeriod: 1095, // 3 years
    legalBasis: 'Legitimate business interest',
    canBeDeleted: true,
    minimumRetention: 90,
    description: 'Email, SMS, chat communications with suppliers',
  },
  {
    dataType: 'analytics_data',
    category: 'technical',
    retentionPeriod: 730, // 2 years
    legalBasis: 'Legitimate interest (Service improvement)',
    canBeDeleted: true,
    description: 'Usage analytics, performance metrics, user behavior data',
  },
  {
    dataType: 'system_logs',
    category: 'technical',
    retentionPeriod: 365, // 1 year
    legalBasis: 'Legitimate interest (Security and debugging)',
    canBeDeleted: true,
    minimumRetention: 90,
    description: 'Application logs, error logs, security logs',
  },
  {
    dataType: 'backup_data',
    category: 'technical',
    retentionPeriod: 90, // 3 months
    legalBasis: 'Legitimate interest (Business continuity)',
    canBeDeleted: true,
    description: 'System backups containing user data',
  },
  {
    dataType: 'cookies_tracking',
    category: 'personal',
    retentionPeriod: 0, // Can be deleted immediately
    legalBasis: 'Consent (ePrivacy Directive)',
    canBeDeleted: true,
    description: 'Browser cookies, tracking pixels, session data',
  },
];

export class RightToBeForgotten {
  private apiEndpoint = '/api/gdpr/deletion';
  private maxProcessingDays = 30; // GDPR Article 17(1) - within one month

  /**
   * Submit deletion request
   */
  async submitDeletionRequest(
    userId: string,
    reason: DeletionReason,
    scope?: Partial<DeletionScope>
  ): Promise<{ requestId: string; estimatedCompletion: Date }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          reason,
          scope: scope || this.getDefaultScope(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Deletion request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        requestId: result.requestId,
        estimatedCompletion: new Date(result.estimatedCompletion),
      };
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      throw error;
    }
  }

  /**
   * Check deletion request status
   */
  async checkDeletionStatus(requestId: string): Promise<DeletionRequest> {
    try {
      const response = await fetch(`${this.apiEndpoint}/status/${requestId}`);

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking deletion status:', error);
      throw error;
    }
  }

  /**
   * Cancel deletion request (if still pending)
   */
  async cancelDeletionRequest(requestId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/cancel/${requestId}`, {
        method: 'PUT',
      });

      return response.ok;
    } catch (error) {
      console.error('Error cancelling deletion request:', error);
      return false;
    }
  }

  /**
   * Get deletion history for user
   */
  async getDeletionHistory(userId: string): Promise<DeletionRequest[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/history/${userId}`);

      if (!response.ok) {
        throw new Error(`History retrieval failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.requests || [];
    } catch (error) {
      console.error('Error getting deletion history:', error);
      throw error;
    }
  }

  /**
   * Get data retention information
   */
  getDataRetentionInfo(): DataRetentionPolicy[] {
    return DATA_RETENTION_POLICIES;
  }

  /**
   * Check what data can be deleted immediately
   */
  getDeletableDataTypes(): string[] {
    return DATA_RETENTION_POLICIES.filter(
      policy => policy.canBeDeleted && policy.retentionPeriod === 0
    ).map(policy => policy.dataType);
  }

  /**
   * Check what data must be retained
   */
  getRetainedDataTypes(): DataRetentionPolicy[] {
    return DATA_RETENTION_POLICIES.filter(policy => !policy.canBeDeleted);
  }

  /**
   * Estimate deletion completion time
   */
  estimateCompletionTime(): Date {
    const now = new Date();
    // GDPR requires completion within 30 days, we estimate 7 days for thorough processing
    const estimatedDays = 7;
    return new Date(now.getTime() + estimatedDays * 24 * 60 * 60 * 1000);
  }

  /**
   * Validate deletion request
   */
  validateDeletionRequest(
    reason: DeletionReason,
    scope: DeletionScope
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if reason is valid
    const validReasons = [
      'withdrawal_consent',
      'no_longer_necessary',
      'unlawful_processing',
      'compliance_obligation',
      'object_to_processing',
      'direct_marketing',
    ];

    if (!validReasons.includes(reason.type)) {
      errors.push('Invalid deletion reason provided');
    }

    // Check scope
    if (!scope.profile && !scope.rfqs && !scope.communications && !scope.analytics) {
      warnings.push('No data types selected for deletion');
    }

    // Warn about retained data
    if (scope.rfqs) {
      warnings.push('RFQ data will be retained for 7 years due to legal obligations');
    }

    if (scope.orders) {
      warnings.push('Order data will be retained for 7 years due to financial regulations');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get default deletion scope
   */
  private getDefaultScope(): DeletionScope {
    return {
      profile: true,
      company: false, // Often needs to be retained for business purposes
      rfqs: false, // Retained for legal obligations
      orders: false, // Retained for legal obligations
      communications: true,
      analytics: true,
      backups: true,
      thirdPartyShares: true,
      cookies: true,
      logs: true,
    };
  }

  /**
   * Generate deletion impact report
   */
  generateDeletionImpact(scope: DeletionScope): {
    immediatelyDeleted: string[];
    retainedTemporarily: Array<{ type: string; until: Date; reason: string }>;
    retainedPermanently: Array<{ type: string; reason: string }>;
    thirdPartyNotifications: string[];
  } {
    const immediatelyDeleted: string[] = [];
    const retainedTemporarily: Array<{ type: string; until: Date; reason: string }> = [];
    const retainedPermanently: Array<{ type: string; reason: string }> = [];
    const thirdPartyNotifications: string[] = [];

    // Analyze each data type in scope
    Object.entries(scope).forEach(([dataType, included]) => {
      if (!included) return;

      const policy = DATA_RETENTION_POLICIES.find(
        p =>
          p.dataType.includes(dataType.toLowerCase()) ||
          dataType.toLowerCase().includes(p.dataType.split('_')[0])
      );

      if (!policy) return;

      if (policy.canBeDeleted && policy.retentionPeriod === 0) {
        immediatelyDeleted.push(dataType);
      } else if (policy.canBeDeleted) {
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() + policy.retentionPeriod);
        retainedTemporarily.push({
          type: dataType,
          until: retentionDate,
          reason: policy.legalBasis,
        });
      } else {
        retainedPermanently.push({
          type: dataType,
          reason: policy.legalBasis,
        });
      }
    });

    // Third-party notifications needed
    if (scope.analytics) {
      thirdPartyNotifications.push('Google Analytics');
    }
    if (scope.cookies) {
      thirdPartyNotifications.push('Marketing platforms');
    }
    if (scope.backups) {
      thirdPartyNotifications.push('Cloud storage providers');
    }

    return {
      immediatelyDeleted,
      retainedTemporarily,
      retainedPermanently,
      thirdPartyNotifications,
    };
  }

  /**
   * Format retention period for display
   */
  formatRetentionPeriod(days: number): string {
    if (days === 0) return 'Immediate deletion';
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  }

  /**
   * Check if user can request deletion
   */
  canRequestDeletion(
    userId: string,
    lastRequestDate?: Date
  ): {
    canRequest: boolean;
    reason?: string;
    nextAllowedDate?: Date;
  } {
    // Check if there's a recent pending request
    if (lastRequestDate) {
      const daysSinceLastRequest = Math.floor(
        (Date.now() - lastRequestDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastRequest < 30) {
        const nextAllowedDate = new Date(lastRequestDate);
        nextAllowedDate.setDate(nextAllowedDate.getDate() + 30);

        return {
          canRequest: false,
          reason: 'A deletion request was submitted within the last 30 days',
          nextAllowedDate,
        };
      }
    }

    return { canRequest: true };
  }
}

// Global instance
export const rightToBeForgotten = new RightToBeForgotten();

// Utility functions
export const deletionUtils = {
  /**
   * Get user-friendly deletion reason
   */
  getDeletionReasonText(reason: DeletionReason): string {
    const reasonTexts = {
      withdrawal_consent: 'I want to withdraw my consent for data processing',
      no_longer_necessary: 'My data is no longer necessary for the original purpose',
      unlawful_processing: 'My data is being processed unlawfully',
      compliance_obligation: 'I have a legal obligation to delete this data',
      object_to_processing: 'I object to the processing of my personal data',
      direct_marketing: 'I object to direct marketing communications',
    };

    return reasonTexts[reason.type] || 'Other reason';
  },

  /**
   * Calculate processing time remaining
   */
  getTimeRemaining(requestDate: Date): string {
    const now = new Date();
    const thirtyDaysLater = new Date(requestDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const timeRemaining = thirtyDaysLater.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) return 'Overdue';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  },

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const colors = {
      pending: 'yellow',
      processing: 'blue',
      completed: 'green',
      rejected: 'red',
      cancelled: 'gray',
    };
    return colors[status as keyof typeof colors] || 'gray';
  },
};
