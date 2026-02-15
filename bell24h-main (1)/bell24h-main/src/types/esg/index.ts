// ESG Scoring System Types
export interface ESGMetric {
  id: string;
  name: string;
  category: 'environmental' | 'social' | 'governance';
  weight: number;
  value: number;
  maxValue: number;
  unit: string;
  description: string;
  dataSource: string;
  lastUpdated: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ESGScore {
  overall: number;
  environmental: number;
  social: number;
  governance: number;
  lastUpdated: string;
  trend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CompanyESGProfile {
  companyId: string;
  companyName: string;
  industry: string;
  marketCap: number;
  revenue: number;
  employees: number;
  esgScore: ESGScore;
  metrics: ESGMetric[];
  certifications: ESGCertification[];
  complianceStatus: ComplianceStatus;
  benchmarkData: BenchmarkData;
  lastAssessment: string;
  nextAssessment: string;
}

export interface ESGCertification {
  id: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
}

export interface ComplianceStatus {
  sebiCompliance: boolean;
  gstCompliance: boolean;
  environmentalCompliance: boolean;
  laborCompliance: boolean;
  overallCompliance: number;
  pendingActions: string[];
  lastAudit: string;
  nextAudit: string;
}

export interface BenchmarkData {
  industryAverage: ESGScore;
  topPerformers: ESGScore;
  ranking: {
    overall: number;
    environmental: number;
    social: number;
    governance: number;
    totalCompanies: number;
  };
  peerComparison: CompanyESGProfile[];
}

export interface IndustryESGBenchmark {
  industry: string;
  averageScore: ESGScore;
  topQuartile: ESGScore;
  bottomQuartile: ESGScore;
  keyRisks: string[];
  regulatoryRequirements: string[];
  materialIssues: string[];
}

export interface ESGServiceOffering {
  id: string;
  name: string;
  type: 'assessment' | 'consulting' | 'reporting' | 'certification';
  description: string;
  duration: string;
  price: {
    min: number;
    max: number;
    currency: string;
    unit: string;
  };
  deliverables: string[];
  targetCompanies: string[];
  expertise: string[];
}

export interface ESGReport {
  id: string;
  companyId: string;
  reportType: 'assessment' | 'compliance' | 'benchmark';
  generatedDate: string;
  period: {
    start: string;
    end: string;
  };
  sections: {
    executive: string;
    environmental: string;
    social: string;
    governance: string;
    recommendations: string[];
  };
  attachments: string[];
}

export interface DemoESGData {
  companies: CompanyESGProfile[];
  benchmarks: IndustryESGBenchmark[];
  reports: ESGReport[];
  services: ESGServiceOffering[];
}
