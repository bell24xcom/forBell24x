import {
  CompanyESGProfile,
  ESGScore,
  ESGMetric,
  IndustryESGBenchmark,
  DemoESGData,
  ESGServiceOffering,
  ESGReport,
  BenchmarkData,
  ESGCertification,
  ComplianceStatus,
} from '@/types/esg';

// ESG Scoring Algorithm
export class ESGScoringService {
  // Calculate weighted ESG score
  static calculateESGScore(metrics: ESGMetric[]): ESGScore {
    const environmentalMetrics = metrics.filter(m => m.category === 'environmental');
    const socialMetrics = metrics.filter(m => m.category === 'social');
    const governanceMetrics = metrics.filter(m => m.category === 'governance');

    const environmental = this.calculateCategoryScore(environmentalMetrics);
    const social = this.calculateCategoryScore(socialMetrics);
    const governance = this.calculateCategoryScore(governanceMetrics);

    // Weighted average: E(40%) + S(35%) + G(25%)
    const overall = environmental * 0.4 + social * 0.35 + governance * 0.25;

    return {
      overall: Math.round(overall * 100) / 100,
      environmental: Math.round(environmental * 100) / 100,
      social: Math.round(social * 100) / 100,
      governance: Math.round(governance * 100) / 100,
      lastUpdated: new Date().toISOString(),
      trend: this.determineTrend(overall),
      riskLevel: this.determineRiskLevel(overall),
    };
  }

  private static calculateCategoryScore(metrics: ESGMetric[]): number {
    if (metrics.length === 0) return 0;

    const weightedSum = metrics.reduce((sum, metric) => {
      const normalizedScore = (metric.value / metric.maxValue) * 100;
      return sum + normalizedScore * metric.weight;
    }, 0);

    const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private static determineTrend(score: number): 'improving' | 'declining' | 'stable' {
    // Simulate trend based on score
    if (score > 75) return 'improving';
    if (score < 50) return 'declining';
    return 'stable';
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'critical';
  }

  // Get industry benchmarks
  static getIndustryBenchmark(industry: string): IndustryESGBenchmark {
    const benchmarks = getIndustryBenchmarks();
    return benchmarks.find(b => b.industry === industry) || benchmarks[0];
  }

  // Generate improvement recommendations
  static generateRecommendations(companyProfile: CompanyESGProfile): string[] {
    const recommendations: string[] = [];
    const { esgScore, metrics } = companyProfile;

    // Environmental recommendations
    if (esgScore.environmental < 70) {
      recommendations.push('Implement ISO 14001 Environmental Management System');
      recommendations.push('Set science-based targets for carbon emission reduction');
      recommendations.push('Increase renewable energy usage to 50% of total consumption');
    }

    // Social recommendations
    if (esgScore.social < 70) {
      recommendations.push('Enhance workplace diversity and inclusion programs');
      recommendations.push('Implement comprehensive employee wellbeing initiatives');
      recommendations.push('Strengthen community development programs');
    }

    // Governance recommendations
    if (esgScore.governance < 70) {
      recommendations.push('Increase board independence to at least 50%');
      recommendations.push('Implement robust cybersecurity and data privacy frameworks');
      recommendations.push('Enhance transparency in ESG reporting and disclosures');
    }

    return recommendations;
  }
}

// Demo Data - Major Indian Companies
export const getDemoESGData = (): DemoESGData => {
  return {
    companies: [
      {
        companyId: 'TATA_STEEL_001',
        companyName: 'Tata Steel Limited',
        industry: 'Steel & Metal',
        marketCap: 85000, // Crores
        revenue: 95000,
        employees: 65000,
        esgScore: {
          overall: 76.5,
          environmental: 72.8,
          social: 81.2,
          governance: 75.0,
          lastUpdated: '2024-12-15T00:00:00Z',
          trend: 'improving',
          riskLevel: 'medium',
        },
        metrics: [],
        certifications: [],
        complianceStatus: {
          sebiCompliance: true,
          gstCompliance: true,
          environmentalCompliance: true,
          laborCompliance: true,
          overallCompliance: 95,
          pendingActions: [],
          lastAudit: '2024-09-15',
          nextAudit: '2025-03-15',
        },
        benchmarkData: {
          industryAverage: {
            overall: 65.2,
            environmental: 60.2,
            social: 68.8,
            governance: 63.5,
            lastUpdated: '2024-12-01T00:00:00Z',
            trend: 'stable',
            riskLevel: 'medium',
          },
          topPerformers: {
            overall: 80.8,
            environmental: 75.2,
            social: 86.5,
            governance: 78.8,
            lastUpdated: '2024-12-01T00:00:00Z',
            trend: 'improving',
            riskLevel: 'low',
          },
          ranking: {
            overall: 23,
            environmental: 28,
            social: 15,
            governance: 31,
            totalCompanies: 150,
          },
          peerComparison: [],
        },
        lastAssessment: '2024-11-15',
        nextAssessment: '2025-05-15',
      },
      {
        companyId: 'INFOSYS_001',
        companyName: 'Infosys Limited',
        industry: 'Information Technology',
        marketCap: 725000, // Crores
        revenue: 183000,
        employees: 350000,
        esgScore: {
          overall: 84.2,
          environmental: 88.5,
          social: 82.0,
          governance: 82.8,
          lastUpdated: '2024-12-15T00:00:00Z',
          trend: 'improving',
          riskLevel: 'low',
        },
        metrics: [],
        certifications: [],
        complianceStatus: {
          sebiCompliance: true,
          gstCompliance: true,
          environmentalCompliance: true,
          laborCompliance: true,
          overallCompliance: 98,
          pendingActions: [],
          lastAudit: '2024-09-10',
          nextAudit: '2025-03-10',
        },
        benchmarkData: {
          industryAverage: {
            overall: 78.5,
            environmental: 82.0,
            social: 76.8,
            governance: 76.2,
            lastUpdated: '2024-12-01T00:00:00Z',
            trend: 'improving',
            riskLevel: 'low',
          },
          topPerformers: {
            overall: 88.2,
            environmental: 92.5,
            social: 85.8,
            governance: 86.5,
            lastUpdated: '2024-12-01T00:00:00Z',
            trend: 'improving',
            riskLevel: 'low',
          },
          ranking: {
            overall: 8,
            environmental: 5,
            social: 12,
            governance: 9,
            totalCompanies: 150,
          },
          peerComparison: [],
        },
        lastAssessment: '2024-09-10',
        nextAssessment: '2025-03-10',
      },
    ],
    benchmarks: [
      {
        industry: 'Information Technology',
        averageScore: {
          overall: 78.5,
          environmental: 82.0,
          social: 76.8,
          governance: 76.2,
          lastUpdated: '2024-12-01T00:00:00Z',
          trend: 'improving',
          riskLevel: 'low',
        },
        topQuartile: {
          overall: 88.2,
          environmental: 92.5,
          social: 85.8,
          governance: 86.5,
          lastUpdated: '2024-12-01T00:00:00Z',
          trend: 'improving',
          riskLevel: 'low',
        },
        bottomQuartile: {
          overall: 68.5,
          environmental: 71.2,
          social: 67.8,
          governance: 66.0,
          lastUpdated: '2024-12-01T00:00:00Z',
          trend: 'stable',
          riskLevel: 'medium',
        },
        keyRisks: ['Data Privacy', 'Cybersecurity', 'Talent Retention'],
        regulatoryRequirements: ['SEBI BRSR', 'Data Protection Act', 'IT Rules'],
        materialIssues: ['Energy Consumption', 'E-waste Management', 'Digital Divide'],
      },
    ],
    reports: [],
    services: [
      {
        id: 'esg_assessment',
        name: 'Comprehensive ESG Assessment',
        type: 'assessment',
        description: 'Complete ESG scoring and risk assessment with industry benchmarking',
        duration: '4-6 weeks',
        price: {
          min: 200000,
          max: 500000,
          currency: 'INR',
          unit: 'per_company',
        },
        deliverables: [
          'ESG Score Report',
          'Risk Assessment',
          'Improvement Roadmap',
          'Industry Benchmarking',
        ],
        targetCompanies: ['Large Enterprises', 'Listed Companies', 'Multinational Corporations'],
        expertise: ['ESG Scoring', 'Risk Management', 'Sustainability Strategy'],
      },
    ],
  };
};

// Company Profiles with realistic ESG data
function getCompanyProfiles(): CompanyESGProfile[] {
  return [
    {
      companyId: 'TATA_STEEL_001',
      companyName: 'Tata Steel Limited',
      industry: 'Steel & Metal',
      marketCap: 85000, // Crores
      revenue: 95000,
      employees: 65000,
      esgScore: {
        overall: 76.5,
        environmental: 72.8,
        social: 81.2,
        governance: 75.0,
        lastUpdated: '2024-12-15T00:00:00Z',
        trend: 'improving',
        riskLevel: 'medium',
      },
      metrics: getTataMetrics(),
      certifications: getTataCertifications(),
      complianceStatus: getComplianceStatus('high'),
      benchmarkData: getBenchmarkData('Steel & Metal', 76.5),
      lastAssessment: '2024-11-15',
      nextAssessment: '2025-05-15',
    },
    {
      companyId: 'RIL_001',
      companyName: 'Reliance Industries Limited',
      industry: 'Oil & Gas',
      marketCap: 1850000, // Crores
      revenue: 875000,
      employees: 195000,
      esgScore: {
        overall: 68.3,
        environmental: 62.5,
        social: 74.8,
        governance: 68.5,
        lastUpdated: '2024-12-15T00:00:00Z',
        trend: 'improving',
        riskLevel: 'medium',
      },
      metrics: getRelianceMetrics(),
      certifications: getRelianceCertifications(),
      complianceStatus: getComplianceStatus('high'),
      benchmarkData: getBenchmarkData('Oil & Gas', 68.3),
      lastAssessment: '2024-10-20',
      nextAssessment: '2025-04-20',
    },
    {
      companyId: 'INFOSYS_001',
      companyName: 'Infosys Limited',
      industry: 'Information Technology',
      marketCap: 725000, // Crores
      revenue: 183000,
      employees: 350000,
      esgScore: {
        overall: 84.2,
        environmental: 88.5,
        social: 82.0,
        governance: 82.8,
        lastUpdated: '2024-12-15T00:00:00Z',
        trend: 'improving',
        riskLevel: 'low',
      },
      metrics: getInfosysMetrics(),
      certifications: getInfosysCertifications(),
      complianceStatus: getComplianceStatus('high'),
      benchmarkData: getBenchmarkData('Information Technology', 84.2),
      lastAssessment: '2024-09-10',
      nextAssessment: '2025-03-10',
    },
    {
      companyId: 'LT_001',
      companyName: 'Larsen & Toubro Limited',
      industry: 'Engineering & Construction',
      marketCap: 285000, // Crores
      revenue: 175000,
      employees: 150000,
      esgScore: {
        overall: 71.8,
        environmental: 69.2,
        social: 76.5,
        governance: 69.8,
        lastUpdated: '2024-12-15T00:00:00Z',
        trend: 'stable',
        riskLevel: 'medium',
      },
      metrics: getLTMetrics(),
      certifications: getLTCertifications(),
      complianceStatus: getComplianceStatus('medium'),
      benchmarkData: getBenchmarkData('Engineering & Construction', 71.8),
      lastAssessment: '2024-08-25',
      nextAssessment: '2025-02-25',
    },
  ];
}

// Metrics for different companies
function getTataMetrics(): ESGMetric[] {
  return [
    // Environmental Metrics
    {
      id: 'carbon_intensity',
      name: 'Carbon Intensity',
      category: 'environmental',
      weight: 0.3,
      value: 2.85,
      maxValue: 4.0,
      unit: 'tCO2/t steel',
      description: 'Carbon emissions per ton of steel produced',
      dataSource: 'Sustainability Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    {
      id: 'water_intensity',
      name: 'Water Intensity',
      category: 'environmental',
      weight: 0.25,
      value: 3.2,
      maxValue: 5.0,
      unit: 'm³/t steel',
      description: 'Fresh water consumption per ton of steel',
      dataSource: 'Environmental Data 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    // Social Metrics
    {
      id: 'safety_performance',
      name: 'Safety Performance',
      category: 'social',
      weight: 0.4,
      value: 0.28,
      maxValue: 1.0,
      unit: 'LTIFR',
      description: 'Lost Time Injury Frequency Rate',
      dataSource: 'Safety Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    {
      id: 'diversity_index',
      name: 'Gender Diversity',
      category: 'social',
      weight: 0.3,
      value: 18.5,
      maxValue: 50.0,
      unit: '%',
      description: 'Percentage of women in workforce',
      dataSource: 'Diversity Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    // Governance Metrics
    {
      id: 'board_independence',
      name: 'Board Independence',
      category: 'governance',
      weight: 0.35,
      value: 58.3,
      maxValue: 100.0,
      unit: '%',
      description: 'Percentage of independent directors',
      dataSource: 'Annual Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'stable',
    },
  ];
}

function getRelianceMetrics(): ESGMetric[] {
  return [
    {
      id: 'scope_emissions',
      name: 'GHG Emissions Intensity',
      category: 'environmental',
      weight: 0.35,
      value: 0.42,
      maxValue: 0.6,
      unit: 'tCO2e/t product',
      description: 'Greenhouse gas emissions intensity',
      dataSource: 'Sustainability Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    {
      id: 'renewable_energy',
      name: 'Renewable Energy Share',
      category: 'environmental',
      weight: 0.3,
      value: 15.2,
      maxValue: 100.0,
      unit: '%',
      description: 'Percentage of renewable energy in total consumption',
      dataSource: 'Energy Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    {
      id: 'employee_engagement',
      name: 'Employee Engagement',
      category: 'social',
      weight: 0.3,
      value: 78.5,
      maxValue: 100.0,
      unit: 'Score',
      description: 'Employee satisfaction and engagement score',
      dataSource: 'HR Analytics 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'stable',
    },
    {
      id: 'transparency_score',
      name: 'Transparency Index',
      category: 'governance',
      weight: 0.4,
      value: 72.8,
      maxValue: 100.0,
      unit: 'Score',
      description: 'Corporate transparency and disclosure score',
      dataSource: 'Governance Assessment 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
  ];
}

function getInfosysMetrics(): ESGMetric[] {
  return [
    {
      id: 'carbon_neutral',
      name: 'Carbon Neutrality Progress',
      category: 'environmental',
      weight: 0.4,
      value: 95.2,
      maxValue: 100.0,
      unit: '%',
      description: 'Progress towards carbon neutral operations',
      dataSource: 'Climate Action Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    {
      id: 'skills_development',
      name: 'Skills Development',
      category: 'social',
      weight: 0.35,
      value: 89.5,
      maxValue: 100.0,
      unit: 'Hours/employee',
      description: 'Average training hours per employee annually',
      dataSource: 'Learning Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    {
      id: 'data_governance',
      name: 'Data Governance Score',
      category: 'governance',
      weight: 0.4,
      value: 88.2,
      maxValue: 100.0,
      unit: 'Score',
      description: 'Data privacy and security governance score',
      dataSource: 'Data Governance Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'stable',
    },
  ];
}

function getLTMetrics(): ESGMetric[] {
  return [
    {
      id: 'green_buildings',
      name: 'Green Building Projects',
      category: 'environmental',
      weight: 0.3,
      value: 42.8,
      maxValue: 100.0,
      unit: '%',
      description: 'Percentage of projects with green building certification',
      dataSource: 'Sustainability Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
    {
      id: 'local_employment',
      name: 'Local Employment',
      category: 'social',
      weight: 0.35,
      value: 68.5,
      maxValue: 100.0,
      unit: '%',
      description: 'Percentage of local workforce in projects',
      dataSource: 'Social Impact Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'stable',
    },
    {
      id: 'project_governance',
      name: 'Project Governance',
      category: 'governance',
      weight: 0.3,
      value: 75.2,
      maxValue: 100.0,
      unit: 'Score',
      description: 'Project management and governance effectiveness',
      dataSource: 'Project Management Report 2024',
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
    },
  ];
}

// Certifications for companies
function getTataCertifications(): ESGCertification[] {
  return [
    {
      id: 'iso_14001',
      name: 'ISO 14001:2015',
      status: 'active',
      issueDate: '2023-06-15',
      expiryDate: '2026-06-15',
      issuingBody: 'Bureau Veritas',
    },
    {
      id: 'iso_45001',
      name: 'ISO 45001:2018',
      status: 'active',
      issueDate: '2023-08-20',
      expiryDate: '2026-08-20',
      issuingBody: 'SGS',
    },
  ];
}

function getRelianceCertifications(): ESGCertification[] {
  return [
    {
      id: 'iso_50001',
      name: 'ISO 50001:2018',
      status: 'active',
      issueDate: '2023-04-10',
      expiryDate: '2026-04-10',
      issuingBody: 'TUV SUD',
    },
    {
      id: 'gri_standards',
      name: 'GRI Standards',
      status: 'pending',
      issueDate: '2024-01-01',
      expiryDate: '2027-01-01',
      issuingBody: 'GRI',
    },
  ];
}

function getInfosysCertifications(): ESGCertification[] {
  return [
    {
      id: 'iso_27001',
      name: 'ISO 27001:2013',
      status: 'active',
      issueDate: '2023-01-15',
      expiryDate: '2026-01-15',
      issuingBody: 'BSI',
    },
    {
      id: 'tcfd_supporter',
      name: 'TCFD Supporter',
      status: 'active',
      issueDate: '2023-09-01',
      expiryDate: '2026-09-01',
      issuingBody: 'FSB',
    },
  ];
}

function getLTCertifications(): ESGCertification[] {
  return [
    {
      id: 'leed_green',
      name: 'LEED Green Building',
      status: 'active',
      issueDate: '2023-07-20',
      expiryDate: '2028-07-20',
      issuingBody: 'USGBC',
    },
  ];
}

// Compliance status
function getComplianceStatus(level: 'high' | 'medium' | 'low'): ComplianceStatus {
  const baseCompliance = level === 'high' ? 95 : level === 'medium' ? 80 : 65;

  return {
    sebiCompliance: level !== 'low',
    gstCompliance: true,
    environmentalCompliance: level !== 'low',
    laborCompliance: true,
    overallCompliance: baseCompliance,
    pendingActions: [],
    lastAudit: '2024-09-15',
    nextAudit: '2025-03-15',
  };
}

// Benchmark data
function getBenchmarkData(industry: string, companyScore: number): BenchmarkData {
  const industryAvg =
    industry === 'Information Technology'
      ? 78.5
      : industry === 'Steel & Metal'
      ? 65.2
      : industry === 'Oil & Gas'
      ? 58.8
      : 70.0;

  return {
    industryAverage: {
      overall: industryAvg,
      environmental: industryAvg - 5,
      social: industryAvg + 3,
      governance: industryAvg - 2,
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'stable',
      riskLevel: 'medium',
    },
    topPerformers: {
      overall: industryAvg + 15,
      environmental: industryAvg + 12,
      social: industryAvg + 18,
      governance: industryAvg + 15,
      lastUpdated: '2024-12-01T00:00:00Z',
      trend: 'improving',
      riskLevel: 'low',
    },
    ranking: {
      overall: Math.floor(Math.random() * 50) + 1,
      environmental: Math.floor(Math.random() * 50) + 1,
      social: Math.floor(Math.random() * 50) + 1,
      governance: Math.floor(Math.random() * 50) + 1,
      totalCompanies: 150,
    },
    peerComparison: [],
  };
}

// Industry benchmarks
function getIndustryBenchmarks(): IndustryESGBenchmark[] {
  return [
    {
      industry: 'Information Technology',
      averageScore: {
        overall: 78.5,
        environmental: 82.0,
        social: 76.8,
        governance: 76.2,
        lastUpdated: '2024-12-01T00:00:00Z',
        trend: 'improving',
        riskLevel: 'low',
      },
      topQuartile: {
        overall: 88.2,
        environmental: 92.5,
        social: 85.8,
        governance: 86.5,
        lastUpdated: '2024-12-01T00:00:00Z',
        trend: 'improving',
        riskLevel: 'low',
      },
      bottomQuartile: {
        overall: 68.5,
        environmental: 71.2,
        social: 67.8,
        governance: 66.0,
        lastUpdated: '2024-12-01T00:00:00Z',
        trend: 'stable',
        riskLevel: 'medium',
      },
      keyRisks: ['Data Privacy', 'Cybersecurity', 'Talent Retention'],
      regulatoryRequirements: ['SEBI BRSR', 'Data Protection Act', 'IT Rules'],
      materialIssues: ['Energy Consumption', 'E-waste Management', 'Digital Divide'],
    },
    {
      industry: 'Steel & Metal',
      averageScore: {
        overall: 65.2,
        environmental: 58.5,
        social: 70.8,
        governance: 66.5,
        lastUpdated: '2024-12-01T00:00:00Z',
        trend: 'stable',
        riskLevel: 'medium',
      },
      topQuartile: {
        overall: 75.8,
        environmental: 68.2,
        social: 81.5,
        governance: 77.8,
        lastUpdated: '2024-12-01T00:00:00Z',
        trend: 'improving',
        riskLevel: 'medium',
      },
      bottomQuartile: {
        overall: 54.5,
        environmental: 48.8,
        social: 60.2,
        governance: 54.8,
        lastUpdated: '2024-12-01T00:00:00Z',
        trend: 'declining',
        riskLevel: 'high',
      },
      keyRisks: ['Carbon Emissions', 'Water Pollution', 'Worker Safety'],
      regulatoryRequirements: ['Environmental Clearance', 'Pollution Control', 'Mining Laws'],
      materialIssues: ['Climate Change', 'Resource Depletion', 'Community Relations'],
    },
  ];
}

// ESG Reports
function getESGReports(): ESGReport[] {
  return [
    {
      id: 'BRSR_2024_001',
      companyId: 'TATA_STEEL_001',
      reportType: 'compliance',
      generatedDate: '2024-12-01T00:00:00Z',
      period: {
        start: '2023-04-01',
        end: '2024-03-31',
      },
      sections: {
        executive: 'Executive summary of ESG performance for BRSR compliance',
        environmental: 'Environmental metrics and sustainability initiatives',
        social: 'Social responsibility and community impact programs',
        governance: 'Corporate governance and ethical business practices',
        recommendations: [
          'Improve environmental monitoring',
          'Enhance stakeholder engagement',
          'Strengthen governance frameworks',
        ],
      },
      attachments: ['brsr_report.pdf', 'supporting_data.xlsx'],
    },
    {
      id: 'GRI_2024_001',
      companyId: 'INFOSYS_001',
      reportType: 'assessment',
      generatedDate: '2024-11-15T00:00:00Z',
      period: {
        start: '2023-04-01',
        end: '2024-03-31',
      },
      sections: {
        executive: 'Executive summary following GRI Standards framework',
        environmental: 'Environmental impact assessment and climate disclosures',
        social: 'Social performance indicators and community engagement',
        governance: 'Corporate governance structure and ethical practices',
        recommendations: [
          'Adopt science-based targets',
          'Implement circular economy principles',
          'Enhance data transparency',
        ],
      },
      attachments: ['gri_report.pdf', 'data_verification.xlsx', 'stakeholder_feedback.pdf'],
    },
  ];
}

// ESG Services
function getESGServices(): ESGServiceOffering[] {
  return [
    {
      id: 'esg_assessment',
      name: 'Comprehensive ESG Assessment',
      type: 'assessment',
      description: 'Complete ESG scoring and risk assessment with industry benchmarking',
      duration: '4-6 weeks',
      price: {
        min: 200000,
        max: 500000,
        currency: 'INR',
        unit: 'per_company',
      },
      deliverables: [
        'ESG Score Report',
        'Risk Assessment',
        'Improvement Roadmap',
        'Industry Benchmarking',
      ],
      targetCompanies: ['Large Enterprises', 'Listed Companies', 'Multinational Corporations'],
      expertise: ['ESG Scoring', 'Risk Management', 'Sustainability Strategy'],
    },
    {
      id: 'brsr_reporting',
      name: 'SEBI BRSR Compliance Reporting',
      type: 'reporting',
      description: 'SEBI Business Responsibility and Sustainability Reporting compliance',
      duration: '8-12 weeks',
      price: {
        min: 300000,
        max: 800000,
        currency: 'INR',
        unit: 'per_assessment',
      },
      deliverables: [
        'BRSR Report',
        'Data Collection Framework',
        'Stakeholder Engagement',
        'Submission Support',
      ],
      targetCompanies: ['Listed Companies', 'Large Enterprises'],
      expertise: ['SEBI Compliance', 'Sustainability Reporting', 'Stakeholder Engagement'],
    },
    {
      id: 'esg_consulting',
      name: 'ESG Strategy Consulting',
      type: 'consulting',
      description: 'Strategic ESG consulting for sustainability transformation',
      duration: '12-24 weeks',
      price: {
        min: 500000,
        max: 1500000,
        currency: 'INR',
        unit: 'per_company',
      },
      deliverables: [
        'ESG Strategy',
        'Implementation Plan',
        'Training Programs',
        'Monitoring Framework',
      ],
      targetCompanies: ['Fortune 500', 'Large Enterprises', 'Growth Companies'],
      expertise: ['Strategic Planning', 'Change Management', 'Sustainability Innovation'],
    },
  ];
}
