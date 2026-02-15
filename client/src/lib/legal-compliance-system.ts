import { NextRequest, NextResponse } from 'next/server';

// Legal Compliance System - Based on Cursor Agent Requirements
export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review'
}

export enum LegalRequirement {
  GST_REGISTRATION = 'gst_registration',
  COMPANY_INCORPORATION = 'company_incorporation',
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  REFUND_POLICY = 'refund_policy',
  GRIEVANCE_MECHANISM = 'grievance_mechanism',
  CUSTOMER_SUPPORT = 'customer_support',
  DATA_PROTECTION = 'data_protection',
  RBI_KYC = 'rbi_kyc',
  TRANSACTION_LIMITS = 'transaction_limits',
  CONSUMER_PROTECTION = 'consumer_protection'
}

export enum LegalRisk {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface LegalRequirementItem {
  id: string;
  requirement: LegalRequirement;
  title: string;
  description: string;
  status: ComplianceStatus;
  risk: LegalRisk;
  cost: number;
  timeline: string; // in weeks
  dependencies: LegalRequirement[];
  documents: string[];
  actions: string[];
  penalties: {
    fine: string;
    criminal: boolean;
    business_impact: string;
  };
}

export interface LegalComplianceReport {
  id: string;
  generatedAt: string;
  overallStatus: ComplianceStatus;
  complianceScore: number; // 0-100
  totalCost: number;
  totalTimeline: string;
  criticalGaps: LegalRequirementItem[];
  mediumRiskItems: LegalRequirementItem[];
  lowRiskItems: LegalRequirementItem[];
  recommendations: string[];
  nextActions: string[];
  budgetBreakdown: {
    immediate: number; // Next 2 weeks
    shortTerm: number; // 3-6 months
    longTerm: number; // 6-12 months
  };
}

// Legal Compliance System
export class LegalComplianceSystem {
  private requirements: LegalRequirementItem[] = [];
  private complianceHistory: LegalComplianceReport[] = [];

  constructor() {
    this.initializeLegalRequirements();
  }

  // Initialize all legal requirements based on Cursor Agent analysis
  private initializeLegalRequirements(): void {
    this.requirements = [
      // CRITICAL REQUIREMENTS (Must have for soft launch)
      {
        id: 'gst_registration',
        requirement: LegalRequirement.GST_REGISTRATION,
        title: 'GST Registration & Setup',
        description: 'Mandatory GST registration for platform fees collection and compliance',
        status: ComplianceStatus.NON_COMPLIANT,
        risk: LegalRisk.CRITICAL,
        cost: 15000,
        timeline: '1-2 weeks',
        dependencies: [],
        documents: ['GST Registration Certificate', 'GST Returns', 'Tax Invoices'],
        actions: [
          'Complete GST registration application',
          'Set up GST invoicing system',
          'Configure tax collection on platform fees',
          'Create GST compliance workflow',
          'Train team on GST procedures'
        ],
        penalties: {
          fine: '200% of tax + imprisonment',
          criminal: true,
          business_impact: 'Platform shutdown, criminal prosecution'
        }
      },
      {
        id: 'company_incorporation',
        requirement: LegalRequirement.COMPANY_INCORPORATION,
        title: 'Company Incorporation',
        description: 'Business registration and legal entity setup',
        status: ComplianceStatus.COMPLIANT, // Assuming already done
        risk: LegalRisk.LOW,
        cost: 5000,
        timeline: '1 week',
        dependencies: [],
        documents: ['Certificate of Incorporation', 'PAN Card', 'Bank Account'],
        actions: [
          'Verify incorporation documents',
          'Update business details',
          'Ensure compliance with company law'
        ],
        penalties: {
          fine: '₹1-10 lakh',
          criminal: false,
          business_impact: 'Business operations restricted'
        }
      },
      {
        id: 'terms_of_service',
        requirement: LegalRequirement.TERMS_OF_SERVICE,
        title: 'Terms of Service (Legally Binding)',
        description: 'Comprehensive terms of service with legal enforceability',
        status: ComplianceStatus.UNDER_REVIEW,
        risk: LegalRisk.HIGH,
        cost: 25000,
        timeline: '1-2 weeks',
        dependencies: [],
        documents: ['Terms of Service Document', 'User Agreement', 'Service Level Agreement'],
        actions: [
          'Review existing Terms of Service',
          'Add legally binding clauses',
          'Include dispute resolution mechanism',
          'Add liability limitations',
          'Include intellectual property rights'
        ],
        penalties: {
          fine: '₹10 lakh + platform shutdown',
          criminal: false,
          business_impact: 'User disputes, legal liability'
        }
      },
      {
        id: 'privacy_policy',
        requirement: LegalRequirement.PRIVACY_POLICY,
        title: 'Privacy Policy (GDPR/DPDP Compliant)',
        description: 'Data protection and privacy compliance for user data',
        status: ComplianceStatus.UNDER_REVIEW,
        risk: LegalRisk.HIGH,
        cost: 25000,
        timeline: '1-2 weeks',
        dependencies: [],
        documents: ['Privacy Policy', 'Data Processing Agreement', 'Consent Forms'],
        actions: [
          'Update Privacy Policy for DPDP compliance',
          'Add data processing consent mechanism',
          'Include data retention policies',
          'Add user rights and controls',
          'Create data breach notification process'
        ],
        penalties: {
          fine: '₹500 crore (Digital Personal Data Protection Act)',
          criminal: false,
          business_impact: 'Massive fines, reputation damage'
        }
      },
      {
        id: 'refund_policy',
        requirement: LegalRequirement.REFUND_POLICY,
        title: 'Refund Policy (Consumer Protection)',
        description: 'Clear refund and cancellation policy for consumer protection',
        status: ComplianceStatus.NON_COMPLIANT,
        risk: LegalRisk.HIGH,
        cost: 15000,
        timeline: '1 week',
        dependencies: [],
        documents: ['Refund Policy', 'Cancellation Terms', 'Dispute Resolution'],
        actions: [
          'Create comprehensive refund policy',
          'Add clear cancellation terms',
          'Include dispute resolution process',
          'Add refund processing timeline',
          'Create customer communication templates'
        ],
        penalties: {
          fine: '₹10 lakh fine',
          criminal: false,
          business_impact: 'Consumer complaints, platform shutdown'
        }
      },
      {
        id: 'grievance_mechanism',
        requirement: LegalRequirement.GRIEVANCE_MECHANISM,
        title: 'Grievance Redressal Mechanism',
        description: 'Customer complaint handling and dispute resolution system',
        status: ComplianceStatus.NON_COMPLIANT,
        risk: LegalRisk.HIGH,
        cost: 20000,
        timeline: '1-2 weeks',
        dependencies: [],
        documents: ['Grievance Policy', 'Complaint Form', 'Resolution Process'],
        actions: [
          'Create grievance redressal mechanism',
          'Set up complaint handling process',
          'Add dispute resolution system',
          'Create escalation procedures',
          'Train support team'
        ],
        penalties: {
          fine: '₹10 lakh + platform shutdown',
          criminal: false,
          business_impact: 'Customer dissatisfaction, legal disputes'
        }
      },
      {
        id: 'customer_support',
        requirement: LegalRequirement.CUSTOMER_SUPPORT,
        title: 'Customer Support System',
        description: '24/7 customer support and help desk system',
        status: ComplianceStatus.NON_COMPLIANT,
        risk: LegalRisk.MEDIUM,
        cost: 20000,
        timeline: '1-2 weeks',
        dependencies: [],
        documents: ['Support Policy', 'Response Time SLA', 'Escalation Matrix'],
        actions: [
          'Set up customer support system',
          'Create support ticket system',
          'Add live chat functionality',
          'Create knowledge base',
          'Train support staff'
        ],
        penalties: {
          fine: '₹5 lakh',
          criminal: false,
          business_impact: 'Poor customer experience, reputation damage'
        }
      },
      {
        id: 'rbi_kyc',
        requirement: LegalRequirement.RBI_KYC,
        title: 'RBI KYC Requirements',
        description: 'Know Your Customer compliance for financial transactions',
        status: ComplianceStatus.NON_COMPLIANT,
        risk: LegalRisk.HIGH,
        cost: 30000,
        timeline: '2-3 weeks',
        dependencies: [LegalRequirement.GST_REGISTRATION],
        documents: ['KYC Policy', 'Identity Verification', 'Address Proof'],
        actions: [
          'Implement RBI KYC requirements',
          'Add identity verification system',
          'Create address proof validation',
          'Set up document verification',
          'Add risk assessment procedures'
        ],
        penalties: {
          fine: '₹25 lakh + criminal prosecution',
          criminal: true,
          business_impact: 'Payment processing restrictions'
        }
      },
      {
        id: 'transaction_limits',
        requirement: LegalRequirement.TRANSACTION_LIMITS,
        title: 'Transaction Limits & Monitoring',
        description: 'Transaction limits and monitoring for fraud prevention',
        status: ComplianceStatus.NON_COMPLIANT,
        risk: LegalRisk.MEDIUM,
        cost: 15000,
        timeline: '1 week',
        dependencies: [LegalRequirement.RBI_KYC],
        documents: ['Transaction Policy', 'Limit Configuration', 'Monitoring Rules'],
        actions: [
          'Implement transaction limits',
          'Add real-time monitoring',
          'Create fraud detection rules',
          'Set up alert systems',
          'Create reporting mechanisms'
        ],
        penalties: {
          fine: '₹10 lakh',
          criminal: false,
          business_impact: 'Fraud exposure, financial losses'
        }
      },
      {
        id: 'data_protection',
        requirement: LegalRequirement.DATA_PROTECTION,
        title: 'Data Protection & Security',
        description: 'Data security and protection measures',
        status: ComplianceStatus.UNDER_REVIEW,
        risk: LegalRisk.HIGH,
        cost: 25000,
        timeline: '2-3 weeks',
        dependencies: [LegalRequirement.PRIVACY_POLICY],
        documents: ['Security Policy', 'Data Encryption', 'Access Controls'],
        actions: [
          'Implement data encryption',
          'Add access controls',
          'Create backup systems',
          'Set up monitoring',
          'Conduct security audits'
        ],
        penalties: {
          fine: '₹500 crore',
          criminal: false,
          business_impact: 'Data breaches, massive fines'
        }
      },
      {
        id: 'consumer_protection',
        requirement: LegalRequirement.CONSUMER_PROTECTION,
        title: 'Consumer Protection Compliance',
        description: 'Consumer protection laws and regulations compliance',
        status: ComplianceStatus.NON_COMPLIANT,
        risk: LegalRisk.HIGH,
        cost: 20000,
        timeline: '1-2 weeks',
        dependencies: [LegalRequirement.REFUND_POLICY, LegalRequirement.GRIEVANCE_MECHANISM],
        documents: ['Consumer Policy', 'Rights Document', 'Complaint Process'],
        actions: [
          'Implement consumer protection measures',
          'Add consumer rights information',
          'Create complaint process',
          'Set up mediation system',
          'Add consumer education'
        ],
        penalties: {
          fine: '₹10 lakh + platform shutdown',
          criminal: false,
          business_impact: 'Consumer complaints, legal disputes'
        }
      }
    ];
  }

  // Generate comprehensive legal compliance report
  generateComplianceReport(): LegalComplianceReport {
    const criticalGaps = this.requirements.filter(req => req.risk === LegalRisk.CRITICAL && req.status !== ComplianceStatus.COMPLIANT);
    const highRiskItems = this.requirements.filter(req => req.risk === LegalRisk.HIGH && req.status !== ComplianceStatus.COMPLIANT);
    const mediumRiskItems = this.requirements.filter(req => req.risk === LegalRisk.MEDIUM && req.status !== ComplianceStatus.COMPLIANT);
    const lowRiskItems = this.requirements.filter(req => req.risk === LegalRisk.LOW && req.status !== ComplianceStatus.COMPLIANT);

    const totalCost = this.requirements.reduce((sum, req) => sum + req.cost, 0);
    const immediateCost = this.requirements
      .filter(req => req.risk === LegalRisk.CRITICAL || req.risk === LegalRisk.HIGH)
      .reduce((sum, req) => sum + req.cost, 0);

    const complianceScore = this.calculateComplianceScore();

    const report: LegalComplianceReport = {
      id: `compliance_report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      overallStatus: criticalGaps.length > 0 ? ComplianceStatus.NON_COMPLIANT : 
                   highRiskItems.length > 0 ? ComplianceStatus.UNDER_REVIEW : 
                   ComplianceStatus.COMPLIANT,
      complianceScore,
      totalCost,
      totalTimeline: '2-3 weeks',
      criticalGaps,
      mediumRiskItems,
      lowRiskItems,
      recommendations: this.generateRecommendations(),
      nextActions: this.generateNextActions(),
      budgetBreakdown: {
        immediate: immediateCost, // ₹90,000 as per Cursor Agent
        shortTerm: totalCost - immediateCost,
        longTerm: 0 // Future requirements
      }
    };

    this.complianceHistory.push(report);
    return report;
  }

  // Calculate compliance score
  private calculateComplianceScore(): number {
    const totalRequirements = this.requirements.length;
    const compliantRequirements = this.requirements.filter(req => req.status === ComplianceStatus.COMPLIANT).length;
    return Math.round((compliantRequirements / totalRequirements) * 100);
  }

  // Generate recommendations based on Cursor Agent analysis
  private generateRecommendations(): string[] {
    return [
      'IMMEDIATE ACTION REQUIRED: Hire fintech compliance lawyer TODAY (₹25,000)',
      'CRITICAL: Complete GST registration within 2 weeks (₹15,000)',
      'HIGH PRIORITY: Update Privacy Policy for DPDP compliance (₹25,000)',
      'ESSENTIAL: Create grievance redressal mechanism (₹20,000)',
      'MANDATORY: Implement RBI KYC requirements (₹30,000)',
      'IMPORTANT: Add customer support system (₹20,000)',
      'REQUIRED: Set up transaction limits and monitoring (₹15,000)',
      'NECESSARY: Create comprehensive refund policy (₹15,000)',
      'COMPLIANCE: Implement data protection measures (₹25,000)',
      'LEGAL: Review and update Terms of Service (₹25,000)'
    ];
  }

  // Generate next actions based on Cursor Agent priorities
  private generateNextActions(): string[] {
    return [
      'Day 1-2: Hire compliance lawyer and review legal documents (₹25,000)',
      'Day 3-4: Complete GST registration and setup (₹15,000)',
      'Day 5-7: Implement customer support and grievance mechanism (₹20,000)',
      'Week 2: Update privacy policy and data protection (₹25,000)',
      'Week 2: Implement RBI KYC requirements (₹30,000)',
      'Week 3: Set up transaction limits and monitoring (₹15,000)',
      'Week 3: Create comprehensive refund policy (₹15,000)',
      'Week 4: Final legal review and compliance audit (₹10,000)'
    ];
  }

  // Update requirement status
  updateRequirementStatus(requirementId: string, status: ComplianceStatus): void {
    const requirement = this.requirements.find(req => req.id === requirementId);
    if (requirement) {
      requirement.status = status;
      console.log(`Updated ${requirement.title} status to ${status}`);
    }
  }

  // Get requirement by ID
  getRequirement(requirementId: string): LegalRequirementItem | undefined {
    return this.requirements.find(req => req.id === requirementId);
  }

  // Get all requirements
  getAllRequirements(): LegalRequirementItem[] {
    return [...this.requirements];
  }

  // Get requirements by risk level
  getRequirementsByRisk(risk: LegalRisk): LegalRequirementItem[] {
    return this.requirements.filter(req => req.risk === risk);
  }

  // Get compliance history
  getComplianceHistory(): LegalComplianceReport[] {
    return [...this.complianceHistory];
  }

  // Generate legal compliance checklist
  generateComplianceChecklist(): string {
    let checklist = `
# LEGAL COMPLIANCE CHECKLIST - BELL24H
Generated: ${new Date().toISOString()}

## CRITICAL REQUIREMENTS (MUST COMPLETE FOR SOFT LAUNCH)
Total Cost: ₹90,000 | Timeline: 2 weeks

`;

    const criticalRequirements = this.requirements.filter(req => req.risk === LegalRisk.CRITICAL || req.risk === LegalRisk.HIGH);
    
    criticalRequirements.forEach((req, index) => {
      checklist += `
### ${index + 1}. ${req.title}
- **Status**: ${req.status === ComplianceStatus.COMPLIANT ? '✅ COMPLIANT' : '❌ NOT COMPLIANT'}
- **Risk**: ${req.risk.toUpperCase()}
- **Cost**: ₹${req.cost.toLocaleString()}
- **Timeline**: ${req.timeline}
- **Penalty**: ${req.penalties.fine}

#### Actions Required:
`;
      req.actions.forEach(action => {
        checklist += `- ${action}\n`;
      });

      checklist += `
#### Documents Needed:
`;
      req.documents.forEach(doc => {
        checklist += `- ${doc}\n`;
      });
    });

    checklist += `
## COMPLIANCE SCORE: ${this.calculateComplianceScore()}%

## IMMEDIATE NEXT STEPS:
1. Hire fintech compliance lawyer TODAY (₹25,000)
2. Complete GST registration immediately (₹15,000)
3. Update privacy policy for DPDP compliance (₹25,000)
4. Create grievance redressal mechanism (₹20,000)
5. Implement customer support system (₹20,000)

## TOTAL IMMEDIATE COST: ₹90,000
## TIMELINE: 2 WEEKS
## RISK OF NON-COMPLIANCE: CRITICAL
`;

    return checklist;
  }

  // Generate legal risk assessment
  generateRiskAssessment(): string {
    const report = this.generateComplianceReport();
    
    let assessment = `
# LEGAL RISK ASSESSMENT - BELL24H
Generated: ${new Date().toISOString()}

## OVERALL RISK LEVEL: ${report.overallStatus.toUpperCase()}

## CRITICAL RISKS (IMMEDIATE ATTENTION REQUIRED):
`;

    report.criticalGaps.forEach(risk => {
      assessment += `
### ${risk.title}
- **Risk Level**: ${risk.risk.toUpperCase()}
- **Financial Impact**: ${risk.penalties.fine}
- **Criminal Liability**: ${risk.penalties.criminal ? 'YES' : 'NO'}
- **Business Impact**: ${risk.penalties.business_impact}
- **Cost to Fix**: ₹${risk.cost.toLocaleString()}
- **Timeline**: ${risk.timeline}
`;
    });

    assessment += `
## MEDIUM RISKS:
`;

    report.mediumRiskItems.forEach(risk => {
      assessment += `
### ${risk.title}
- **Risk Level**: ${risk.risk.toUpperCase()}
- **Financial Impact**: ${risk.penalties.fine}
- **Cost to Fix**: ₹${risk.cost.toLocaleString()}
- **Timeline**: ${risk.timeline}
`;
    });

    assessment += `
## RECOMMENDATIONS:
`;

    report.recommendations.forEach(rec => {
      assessment += `- ${rec}\n`;
    });

    assessment += `
## BUDGET BREAKDOWN:
- **Immediate (2 weeks)**: ₹${report.budgetBreakdown.immediate.toLocaleString()}
- **Short Term (3-6 months)**: ₹${report.budgetBreakdown.shortTerm.toLocaleString()}
- **Long Term (6-12 months)**: ₹${report.budgetBreakdown.longTerm.toLocaleString()}
- **Total**: ₹${report.totalCost.toLocaleString()}

## CONCLUSION:
${report.overallStatus === ComplianceStatus.NON_COMPLIANT ? 
  'CRITICAL ACTION REQUIRED: Cannot launch without addressing critical compliance gaps.' :
  report.overallStatus === ComplianceStatus.UNDER_REVIEW ?
  'MODERATE RISK: Some compliance issues need attention before launch.' :
  'LOW RISK: Platform is compliant and ready for launch.'}
`;

    return assessment;
  }
}

// Export legal compliance system
export { LegalComplianceSystem, LegalRequirementItem, LegalComplianceReport, ComplianceStatus, LegalRequirement, LegalRisk };
