/**
 * Bell24H Privacy Policy and User Consent Tracking System
 *
 * Implements GDPR compliance for privacy policy management
 * with user consent tracking and version control
 */

export interface PrivacyPolicy {
  version: string;
  effectiveDate: Date;
  title: string;
  content: PrivacyPolicySection[];
  changes?: string[];
  previousVersion?: string;
}

export interface PrivacyPolicySection {
  id: string;
  title: string;
  content: string;
  subsections?: PrivacyPolicySubsection[];
  lawReferences?: string[];
  lastUpdated: Date;
}

export interface PrivacyPolicySubsection {
  id: string;
  title: string;
  content: string;
  examples?: string[];
}

export interface ConsentRecord {
  userId: string;
  policyVersion: string;
  consentDate: Date;
  ipAddress: string;
  userAgent: string;
  consentMethod: 'explicit' | 'implicit' | 'updated';
  consentData: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    thirdParty: boolean;
  };
}

export interface ConsentHistory {
  userId: string;
  records: ConsentRecord[];
  currentConsent?: ConsentRecord;
  consentWithdrawn?: Date;
  withdrawalReason?: string;
}

// Current Privacy Policy Version
export const CURRENT_PRIVACY_POLICY: PrivacyPolicy = {
  version: '2.1',
  effectiveDate: new Date('2024-01-15'),
  title: 'Bell24H Privacy Policy',
  content: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: `Bell24H ("we", "our", or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, share, and protect your information when you use our B2B marketplace platform and services.

This policy applies to all users of Bell24H services, including buyers, suppliers, and administrators. By using our services, you agree to the collection and use of information in accordance with this policy.`,
      lastUpdated: new Date('2024-01-15'),
      lawReferences: ['GDPR Article 13', 'GDPR Article 14'],
    },
    {
      id: 'data-collection',
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, information we obtain automatically when you use our services, and information from third parties.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          content: `We collect personal information you provide when creating an account, such as your name, email address, phone number, job title, and company information.`,
          examples: [
            'Name and contact details',
            'Professional information',
            'Account credentials',
            'Profile preferences',
          ],
        },
        {
          id: 'business-info',
          title: 'Business Information',
          content: `We collect business-related information including company details, RFQ specifications, supplier information, and transaction data.`,
          examples: [
            'Company registration details',
            'RFQ requirements',
            'Supplier catalogs',
            'Order history',
          ],
        },
        {
          id: 'technical-info',
          title: 'Technical Information',
          content: `We automatically collect technical information about your device and usage patterns to improve our services.`,
          examples: [
            'IP address and location',
            'Device and browser information',
            'Usage analytics',
            'Performance metrics',
          ],
        },
      ],
      lawReferences: ['GDPR Article 6', 'GDPR Article 9'],
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Information',
      content: `We use your information to provide, maintain, and improve our services, communicate with you, and ensure security and compliance.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'service-provision',
          title: 'Service Provision',
          content: `We use your information to operate our platform, match buyers with suppliers, process RFQs, and facilitate transactions.`,
          examples: [
            'Account management',
            'RFQ processing',
            'Supplier matching',
            'Transaction facilitation',
          ],
        },
        {
          id: 'communication',
          title: 'Communication',
          content: `We use your contact information to send you service-related communications, updates, and marketing materials (with your consent).`,
          examples: [
            'Service notifications',
            'RFQ updates',
            'Marketing communications',
            'Support correspondence',
          ],
        },
        {
          id: 'improvement',
          title: 'Service Improvement',
          content: `We analyze usage patterns and feedback to improve our platform, develop new features, and enhance user experience.`,
          examples: [
            'Performance optimization',
            'Feature development',
            'User experience enhancement',
            'Security improvements',
          ],
        },
      ],
      lawReferences: ['GDPR Article 6(1)(b)', 'GDPR Article 6(1)(f)'],
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing',
      content: `We share your information only as necessary to provide our services, comply with legal obligations, or with your explicit consent.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'suppliers-buyers',
          title: 'Between Suppliers and Buyers',
          content: `We share relevant information between buyers and suppliers to facilitate business transactions and communications.`,
          examples: [
            'RFQ details to suppliers',
            'Supplier information to buyers',
            'Contact details for communication',
            'Transaction information',
          ],
        },
        {
          id: 'service-providers',
          title: 'Service Providers',
          content: `We share information with trusted service providers who assist us in operating our platform and providing services.`,
          examples: [
            'Cloud hosting providers',
            'Payment processors',
            'Email service providers',
            'Analytics providers',
          ],
        },
        {
          id: 'legal-compliance',
          title: 'Legal Compliance',
          content: `We may disclose information when required by law, to protect our rights, or to ensure platform security.`,
          examples: [
            'Legal requests',
            'Fraud prevention',
            'Security incidents',
            'Regulatory compliance',
          ],
        },
      ],
      lawReferences: ['GDPR Article 6(1)(c)', 'GDPR Article 6(1)(f)'],
    },
    {
      id: 'data-security',
      title: 'Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'technical-measures',
          title: 'Technical Measures',
          content: `We use encryption, secure servers, access controls, and regular security audits to protect your data.`,
          examples: [
            'End-to-end encryption',
            'Secure HTTPS connections',
            'Access controls',
            'Regular security audits',
          ],
        },
        {
          id: 'organizational-measures',
          title: 'Organizational Measures',
          content: `We have policies and procedures in place to ensure data protection and privacy compliance.`,
          examples: [
            'Privacy policies',
            'Employee training',
            'Data processing agreements',
            'Incident response procedures',
          ],
        },
      ],
      lawReferences: ['GDPR Article 32'],
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      content: `Under GDPR, you have several rights regarding your personal data. You can exercise these rights by contacting us or using our self-service tools.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'access-right',
          title: 'Right of Access',
          content: `You have the right to know what personal data we hold about you and to receive a copy of it.`,
          examples: [
            'Request data export',
            'View account information',
            'Access processing details',
            'Obtain data copies',
          ],
        },
        {
          id: 'rectification-right',
          title: 'Right of Rectification',
          content: `You have the right to correct inaccurate personal data and to complete incomplete data.`,
          examples: [
            'Update profile information',
            'Correct contact details',
            'Modify business information',
            'Complete missing data',
          ],
        },
        {
          id: 'erasure-right',
          title: 'Right to Erasure',
          content: `You have the right to request deletion of your personal data under certain circumstances.`,
          examples: [
            'Delete account',
            'Remove personal data',
            'Withdraw consent',
            'Exercise right to be forgotten',
          ],
        },
        {
          id: 'portability-right',
          title: 'Right to Data Portability',
          content: `You have the right to receive your personal data in a structured, commonly used format and to transmit it to another controller.`,
          examples: [
            'Export data in standard formats',
            'Transfer data to other services',
            'Receive structured data',
            'Automated data transfer',
          ],
        },
        {
          id: 'objection-right',
          title: 'Right to Object',
          content: `You have the right to object to processing of your personal data for direct marketing or legitimate interests.`,
          examples: [
            'Opt out of marketing',
            'Object to profiling',
            'Withdraw consent',
            'Stop processing',
          ],
        },
      ],
      lawReferences: ['GDPR Articles 15-22'],
    },
    {
      id: 'cookies',
      title: 'Cookies and Tracking',
      content: `We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'cookie-types',
          title: 'Types of Cookies',
          content: `We use different types of cookies for various purposes, including essential functionality, analytics, and marketing.`,
          examples: [
            'Essential cookies',
            'Analytics cookies',
            'Marketing cookies',
            'Preference cookies',
          ],
        },
        {
          id: 'cookie-control',
          title: 'Cookie Control',
          content: `You can control cookie preferences through our cookie consent banner and browser settings.`,
          examples: [
            'Cookie consent banner',
            'Browser settings',
            'Preference management',
            'Opt-out options',
          ],
        },
      ],
      lawReferences: ['ePrivacy Directive', 'GDPR Article 7'],
    },
    {
      id: 'retention',
      title: 'Data Retention',
      content: `We retain your personal data only for as long as necessary to provide our services, comply with legal obligations, or protect our legitimate interests.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'retention-periods',
          title: 'Retention Periods',
          content: `Different types of data have different retention periods based on legal requirements and business needs.`,
          examples: [
            'Profile data: Until account deletion',
            'Business records: 7 years',
            'Analytics data: 2 years',
            'Logs: 1 year',
          ],
        },
        {
          id: 'deletion-process',
          title: 'Data Deletion',
          content: `We have processes in place to securely delete data when it is no longer needed or when requested by users.`,
          examples: [
            'Automated deletion',
            'Manual deletion requests',
            'Secure data destruction',
            'Audit trails',
          ],
        },
      ],
      lawReferences: ['GDPR Article 5(1)(e)', 'GDPR Article 17'],
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: `If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us using the information below.`,
      lastUpdated: new Date('2024-01-15'),
      subsections: [
        {
          id: 'contact-details',
          title: 'Contact Details',
          content: `You can reach our Data Protection Officer and support team through multiple channels.`,
          examples: [
            'Email: privacy@bell24h.com',
            'Phone: +91-XXXX-XXXX',
            'Address: Mumbai, India',
            'Online form: /contact',
          ],
        },
        {
          id: 'response-time',
          title: 'Response Time',
          content: `We aim to respond to privacy-related requests within 30 days as required by GDPR.`,
          examples: [
            'Standard response: 30 days',
            'Complex requests: May extend with notice',
            'Urgent matters: Priority handling',
            'Status updates: Regular communication',
          ],
        },
      ],
      lawReferences: ['GDPR Article 12'],
    },
  ],
  changes: [
    'Updated data processing purposes',
    'Added new cookie categories',
    'Enhanced user rights section',
    'Improved contact information',
  ],
  previousVersion: '2.0',
};

export class PrivacyPolicyManager {
  private apiEndpoint = '/api/gdpr/privacy-policy';
  private consentEndpoint = '/api/gdpr/consent';

  /**
   * Get current privacy policy
   */
  getCurrentPolicy(): PrivacyPolicy {
    return CURRENT_PRIVACY_POLICY;
  }

  /**
   * Record user consent
   */
  async recordConsent(
    userId: string,
    consentData: ConsentRecord['consentData'],
    method: ConsentRecord['consentMethod'] = 'explicit'
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.consentEndpoint}/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          policyVersion: CURRENT_PRIVACY_POLICY.version,
          consentData,
          consentMethod: method,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error recording consent:', error);
      return false;
    }
  }

  /**
   * Get user consent history
   */
  async getConsentHistory(userId: string): Promise<ConsentHistory | null> {
    try {
      const response = await fetch(`${this.consentEndpoint}/history/${userId}`);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching consent history:', error);
      return null;
    }
  }

  /**
   * Check if user has consented to current policy
   */
  async hasValidConsent(userId: string): Promise<boolean> {
    try {
      const history = await this.getConsentHistory(userId);

      if (!history || !history.currentConsent) {
        return false;
      }

      return history.currentConsent.policyVersion === CURRENT_PRIVACY_POLICY.version;
    } catch (error) {
      console.error('Error checking consent validity:', error);
      return false;
    }
  }

  /**
   * Update user consent
   */
  async updateConsent(userId: string, consentData: ConsentRecord['consentData']): Promise<boolean> {
    return this.recordConsent(userId, consentData, 'updated');
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(userId: string, reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.consentEndpoint}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          reason,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error withdrawing consent:', error);
      return false;
    }
  }

  /**
   * Get policy changes since last consent
   */
  async getPolicyChanges(userId: string): Promise<string[]> {
    try {
      const history = await this.getConsentHistory(userId);

      if (!history || !history.currentConsent) {
        return CURRENT_PRIVACY_POLICY.changes || [];
      }

      const lastConsentVersion = history.currentConsent.policyVersion;
      const currentVersion = CURRENT_PRIVACY_POLICY.version;

      if (lastConsentVersion !== currentVersion) {
        return CURRENT_PRIVACY_POLICY.changes || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting policy changes:', error);
      return [];
    }
  }

  /**
   * Generate policy summary for display
   */
  generatePolicySummary(): {
    totalSections: number;
    lastUpdated: Date;
    keyPoints: string[];
    userRights: string[];
    contactInfo: string;
  } {
    const policy = CURRENT_PRIVACY_POLICY;

    return {
      totalSections: policy.content.length,
      lastUpdated: policy.effectiveDate,
      keyPoints: [
        'We collect information you provide and usage data',
        'We use your data to provide services and improve platform',
        'We share data only as necessary for service delivery',
        'We implement strong security measures',
        'You have full control over your data',
      ],
      userRights: [
        'Right to access your data',
        'Right to correct inaccurate data',
        'Right to delete your data',
        'Right to data portability',
        'Right to object to processing',
      ],
      contactInfo: 'privacy@bell24h.com',
    };
  }

  /**
   * Check if privacy policy update is required
   */
  async requiresUpdate(userId: string): Promise<{
    required: boolean;
    changes: string[];
    version: string;
  }> {
    const changes = await this.getPolicyChanges(userId);

    return {
      required: changes.length > 0,
      changes,
      version: CURRENT_PRIVACY_POLICY.version,
    };
  }
}

// Global instance
export const privacyPolicyManager = new PrivacyPolicyManager();

// Utility functions for policy display
export const policyUtils = {
  /**
   * Format policy section for display
   */
  formatSection(section: PrivacyPolicySection): string {
    let formatted = `${section.title}\n\n${section.content}`;

    if (section.subsections) {
      section.subsections.forEach(sub => {
        formatted += `\n\n${sub.title}\n${sub.content}`;
        if (sub.examples) {
          formatted += `\n\nExamples:\n${sub.examples.map(ex => `• ${ex}`).join('\n')}`;
        }
      });
    }

    return formatted;
  },

  /**
   * Get policy section by ID
   */
  getSection(sectionId: string): PrivacyPolicySection | null {
    return CURRENT_PRIVACY_POLICY.content.find(section => section.id === sectionId) || null;
  },

  /**
   * Search policy content
   */
  searchPolicy(query: string): PrivacyPolicySection[] {
    const lowercaseQuery = query.toLowerCase();

    return CURRENT_PRIVACY_POLICY.content.filter(
      section =>
        section.title.toLowerCase().includes(lowercaseQuery) ||
        section.content.toLowerCase().includes(lowercaseQuery) ||
        section.subsections?.some(
          sub =>
            sub.title.toLowerCase().includes(lowercaseQuery) ||
            sub.content.toLowerCase().includes(lowercaseQuery)
        )
    );
  },

  /**
   * Get policy version info
   */
  getVersionInfo(): {
    current: string;
    effective: string;
    previous?: string;
    changes: string[];
  } {
    const policy = CURRENT_PRIVACY_POLICY;

    return {
      current: policy.version,
      effective: policy.effectiveDate.toLocaleDateString(),
      previous: policy.previousVersion,
      changes: policy.changes || [],
    };
  },
};
