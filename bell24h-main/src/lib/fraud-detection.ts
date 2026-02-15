import { NextRequest } from 'next/server';

// Fraud detection types and enums
export enum FraudRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum FraudType {
  PAYMENT_FRAUD = 'payment_fraud',
  ACCOUNT_TAKEOVER = 'account_takeover',
  IDENTITY_THEFT = 'identity_theft',
  MONEY_LAUNDERING = 'money_laundering',
  CHARGEBACK_FRAUD = 'chargeback_fraud',
  PHISHING = 'phishing',
  BOT_ATTACK = 'bot_attack',
  DEVICE_FRAUD = 'device_fraud',
  LOCATION_FRAUD = 'location_fraud',
  BEHAVIORAL_ANOMALY = 'behavioral_anomaly'
}

export enum FraudAction {
  ALLOW = 'allow',
  REVIEW = 'review',
  CHALLENGE = 'challenge',
  BLOCK = 'block',
  ESCALATE = 'escalate'
}

export interface FraudDetectionResult {
  isFraud: boolean;
  riskLevel: FraudRiskLevel;
  riskScore: number; // 0-100
  fraudTypes: FraudType[];
  confidence: number; // 0-1
  action: FraudAction;
  reasons: string[];
  metadata: Record<string, any>;
  timestamp: string;
  requestId: string;
}

export interface TransactionData {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  location: {
    latitude: number;
    longitude: number;
    country: string;
    city: string;
    timezone: string;
  };
  sessionData: {
    sessionId: string;
    loginTime: string;
    lastActivity: string;
    pageViews: number;
    timeOnSite: number;
  };
  userProfile: {
    accountAge: number; // in days
    previousTransactions: number;
    averageTransactionAmount: number;
    riskHistory: FraudRiskLevel[];
    kycStatus: string;
    verificationLevel: string;
  };
  merchantData: {
    merchantId: string;
    category: string;
    reputation: number;
    chargebackRate: number;
  };
}

export interface FraudDetectionConfig {
  enabled: boolean;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  actions: {
    low: FraudAction;
    medium: FraudAction;
    high: FraudAction;
    critical: FraudAction;
  };
  machineLearningEnabled: boolean;
  realTimeAnalysis: boolean;
  batchAnalysis: boolean;
  modelVersion: string;
}

// Machine Learning Model Interface
interface MLModel {
  predict(input: number[]): number;
  getFeatureImportance(): Record<string, number>;
  updateModel(newData: any[]): void;
}

// Feature Engineering Service
export class FeatureEngineeringService {
  private static instance: FeatureEngineeringService;

  static getInstance(): FeatureEngineeringService {
    if (!FeatureEngineeringService.instance) {
      FeatureEngineeringService.instance = new FeatureEngineeringService();
    }
    return FeatureEngineeringService.instance;
  }

  // Extract features from transaction data
  extractFeatures(data: TransactionData): number[] {
    const features: number[] = [];

    // Amount-based features
    features.push(this.normalizeAmount(data.amount));
    features.push(this.isHighValueTransaction(data.amount));
    features.push(this.isRoundAmount(data.amount));

    // Time-based features
    features.push(this.getTimeOfDay(data.timestamp));
    features.push(this.getDayOfWeek(data.timestamp));
    features.push(this.isWeekend(data.timestamp));

    // Location-based features
    features.push(this.isUnusualLocation(data.location));
    features.push(this.getDistanceFromLastTransaction(data.location, data.userId));
    features.push(this.isHighRiskCountry(data.location.country));

    // Device and session features
    features.push(this.isNewDevice(data.deviceFingerprint, data.userId));
    features.push(this.isSuspiciousUserAgent(data.userAgent));
    features.push(this.isShortSession(data.sessionData.timeOnSite));

    // User behavior features
    features.push(this.getTransactionVelocity(data.userId));
    features.push(this.isUnusualAmountPattern(data.amount, data.userProfile.averageTransactionAmount));
    features.push(this.getAccountRiskScore(data.userProfile.riskHistory));

    // Payment method features
    features.push(this.isNewPaymentMethod(data.paymentMethod, data.userId));
    features.push(this.isHighRiskPaymentMethod(data.paymentMethod));

    // Merchant features
    features.push(this.getMerchantRiskScore(data.merchantData));

    return features;
  }

  private normalizeAmount(amount: number): number {
    // Log normalization for amount
    return Math.log10(amount + 1) / 6; // Normalize to 0-1 range
  }

  private isHighValueTransaction(amount: number): number {
    return amount > 100000 ? 1 : 0; // ₹1 lakh threshold
  }

  private isRoundAmount(amount: number): number {
    return amount % 1000 === 0 ? 1 : 0;
  }

  private getTimeOfDay(timestamp: string): number {
    const hour = new Date(timestamp).getHours();
    // Normalize to 0-1 range
    return hour / 24;
  }

  private getDayOfWeek(timestamp: string): number {
    const day = new Date(timestamp).getDay();
    return day / 7;
  }

  private isWeekend(timestamp: string): number {
    const day = new Date(timestamp).getDay();
    return (day === 0 || day === 6) ? 1 : 0;
  }

  private isUnusualLocation(location: any): number {
    // Check if location is unusual (mock implementation)
    const unusualCountries = ['AF', 'IR', 'KP', 'SY']; // High-risk countries
    return unusualCountries.includes(location.country) ? 1 : 0;
  }

  private getDistanceFromLastTransaction(location: any, userId: string): number {
    // Mock implementation - in real system, get from database
    return Math.random(); // Random distance score
  }

  private isHighRiskCountry(country: string): number {
    const highRiskCountries = ['AF', 'IR', 'KP', 'SY', 'SO', 'YE'];
    return highRiskCountries.includes(country) ? 1 : 0;
  }

  private isNewDevice(deviceFingerprint: string, userId: string): number {
    // Mock implementation - check if device is new for user
    return Math.random() > 0.8 ? 1 : 0;
  }

  private isSuspiciousUserAgent(userAgent: string): number {
    const suspiciousPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'headless', 'phantom', 'selenium'
    ];
    return suspiciousPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    ) ? 1 : 0;
  }

  private isShortSession(timeOnSite: number): number {
    return timeOnSite < 30 ? 1 : 0; // Less than 30 seconds
  }

  private getTransactionVelocity(userId: string): number {
    // Mock implementation - get transaction frequency
    return Math.random(); // Random velocity score
  }

  private isUnusualAmountPattern(amount: number, averageAmount: number): number {
    if (averageAmount === 0) return 0;
    const ratio = amount / averageAmount;
    return ratio > 5 || ratio < 0.2 ? 1 : 0; // 5x higher or 5x lower
  }

  private getAccountRiskScore(riskHistory: FraudRiskLevel[]): number {
    if (riskHistory.length === 0) return 0;
    
    const riskScores = riskHistory.map(risk => {
      switch (risk) {
        case FraudRiskLevel.LOW: return 0.2;
        case FraudRiskLevel.MEDIUM: return 0.5;
        case FraudRiskLevel.HIGH: return 0.8;
        case FraudRiskLevel.CRITICAL: return 1.0;
        default: return 0;
      }
    });

    return riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
  }

  private isNewPaymentMethod(paymentMethod: string, userId: string): number {
    // Mock implementation - check if payment method is new for user
    return Math.random() > 0.9 ? 1 : 0;
  }

  private isHighRiskPaymentMethod(paymentMethod: string): number {
    const highRiskMethods = ['cash', 'money_order', 'wire_transfer'];
    return highRiskMethods.includes(paymentMethod) ? 1 : 0;
  }

  private getMerchantRiskScore(merchantData: any): number {
    // Combine chargeback rate and reputation
    const chargebackRisk = merchantData.chargebackRate;
    const reputationRisk = 1 - (merchantData.reputation / 100);
    return (chargebackRisk + reputationRisk) / 2;
  }
}

// Machine Learning Model Implementation
export class FraudDetectionModel implements MLModel {
  private weights: number[];
  private featureNames: string[];
  private bias: number;

  constructor() {
    // Initialize with random weights (in production, load from trained model)
    this.weights = Array(20).fill(0).map(() => Math.random() * 2 - 1);
    this.featureNames = [
      'amount_normalized', 'high_value', 'round_amount', 'time_of_day', 'day_of_week',
      'is_weekend', 'unusual_location', 'distance', 'high_risk_country', 'new_device',
      'suspicious_user_agent', 'short_session', 'transaction_velocity', 'unusual_amount',
      'account_risk', 'new_payment_method', 'high_risk_payment', 'merchant_risk'
    ];
    this.bias = Math.random() * 2 - 1;
  }

  predict(input: number[]): number {
    if (input.length !== this.weights.length) {
      throw new Error('Input feature count does not match model weights');
    }

    let prediction = this.bias;
    for (let i = 0; i < input.length; i++) {
      prediction += this.weights[i] * input[i];
    }

    // Apply sigmoid activation function
    return 1 / (1 + Math.exp(-prediction));
  }

  getFeatureImportance(): Record<string, number> {
    const importance: Record<string, number> = {};
    for (let i = 0; i < this.featureNames.length; i++) {
      importance[this.featureNames[i]] = Math.abs(this.weights[i]);
    }
    return importance;
  }

  updateModel(newData: any[]): void {
    // Mock implementation - in production, this would retrain the model
    console.log('Updating model with new data:', newData.length, 'samples');
  }
}

// Rule-based Fraud Detection
export class RuleBasedFraudDetector {
  private rules: Array<{
    name: string;
    condition: (data: TransactionData) => boolean;
    fraudType: FraudType;
    severity: FraudRiskLevel;
    weight: number;
  }>;

  constructor() {
    this.rules = [
      {
        name: 'High Amount Transaction',
        condition: (data) => data.amount > 500000, // ₹5 lakhs
        fraudType: FraudType.PAYMENT_FRAUD,
        severity: FraudRiskLevel.HIGH,
        weight: 0.3
      },
      {
        name: 'New Device High Amount',
        condition: (data) => this.isNewDevice(data.deviceFingerprint, data.userId) && data.amount > 100000,
        fraudType: FraudType.DEVICE_FRAUD,
        severity: FraudRiskLevel.MEDIUM,
        weight: 0.4
      },
      {
        name: 'High Velocity Transactions',
        condition: (data) => this.getTransactionVelocity(data.userId) > 10, // 10+ transactions per hour
        fraudType: FraudType.BEHAVIORAL_ANOMALY,
        severity: FraudRiskLevel.HIGH,
        weight: 0.5
      },
      {
        name: 'Unusual Location',
        condition: (data) => this.isUnusualLocation(data.location),
        fraudType: FraudType.LOCATION_FRAUD,
        severity: FraudRiskLevel.MEDIUM,
        weight: 0.3
      },
      {
        name: 'Suspicious User Agent',
        condition: (data) => this.isSuspiciousUserAgent(data.userAgent),
        fraudType: FraudType.BOT_ATTACK,
        severity: FraudRiskLevel.HIGH,
        weight: 0.6
      },
      {
        name: 'Short Session High Amount',
        condition: (data) => data.sessionData.timeOnSite < 60 && data.amount > 50000,
        fraudType: FraudType.PAYMENT_FRAUD,
        severity: FraudRiskLevel.MEDIUM,
        weight: 0.4
      },
      {
        name: 'Weekend High Amount',
        condition: (data) => this.isWeekend(data.timestamp) && data.amount > 200000,
        fraudType: FraudType.PAYMENT_FRAUD,
        severity: FraudRiskLevel.LOW,
        weight: 0.2
      },
      {
        name: 'New Account High Amount',
        condition: (data) => data.userProfile.accountAge < 7 && data.amount > 100000,
        fraudType: FraudType.ACCOUNT_TAKEOVER,
        severity: FraudRiskLevel.HIGH,
        weight: 0.7
      },
      {
        name: 'High Risk Country',
        condition: (data) => this.isHighRiskCountry(data.location.country),
        fraudType: FraudType.LOCATION_FRAUD,
        severity: FraudRiskLevel.HIGH,
        weight: 0.8
      },
      {
        name: 'Unverified KYC High Amount',
        condition: (data) => data.userProfile.kycStatus !== 'verified' && data.amount > 25000,
        fraudType: FraudType.IDENTITY_THEFT,
        severity: FraudRiskLevel.MEDIUM,
        weight: 0.5
      }
    ];
  }

  private isNewDevice(deviceFingerprint: string, userId: string): boolean {
    // Mock implementation
    return Math.random() > 0.8;
  }

  private getTransactionVelocity(userId: string): number {
    // Mock implementation
    return Math.random() * 20;
  }

  private isUnusualLocation(location: any): boolean {
    const unusualCountries = ['AF', 'IR', 'KP', 'SY'];
    return unusualCountries.includes(location.country);
  }

  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = ['bot', 'crawler', 'spider', 'scraper', 'headless'];
    return suspiciousPatterns.some(pattern => userAgent.toLowerCase().includes(pattern));
  }

  private isWeekend(timestamp: string): boolean {
    const day = new Date(timestamp).getDay();
    return day === 0 || day === 6;
  }

  private isHighRiskCountry(country: string): boolean {
    const highRiskCountries = ['AF', 'IR', 'KP', 'SY', 'SO', 'YE'];
    return highRiskCountries.includes(country);
  }

  // Evaluate transaction against all rules
  evaluateTransaction(data: TransactionData): {
    triggeredRules: Array<{
      name: string;
      fraudType: FraudType;
      severity: FraudRiskLevel;
      weight: number;
    }>;
    riskScore: number;
    fraudTypes: FraudType[];
  } {
    const triggeredRules: any[] = [];
    let totalWeight = 0;
    const fraudTypes = new Set<FraudType>();

    for (const rule of this.rules) {
      if (rule.condition(data)) {
        triggeredRules.push({
          name: rule.name,
          fraudType: rule.fraudType,
          severity: rule.severity,
          weight: rule.weight
        });
        totalWeight += rule.weight;
        fraudTypes.add(rule.fraudType);
      }
    }

    // Calculate risk score (0-100)
    const riskScore = Math.min(100, totalWeight * 100);

    return {
      triggeredRules,
      riskScore,
      fraudTypes: Array.from(fraudTypes)
    };
  }
}

// Main Fraud Detection Service
export class FraudDetectionService {
  private config: FraudDetectionConfig;
  private mlModel: FraudDetectionModel;
  private ruleBasedDetector: RuleBasedFraudDetector;
  private featureEngineering: FeatureEngineeringService;

  constructor(config: FraudDetectionConfig) {
    this.config = config;
    this.mlModel = new FraudDetectionModel();
    this.ruleBasedDetector = new RuleBasedFraudDetector();
    this.featureEngineering = FeatureEngineeringService.getInstance();
  }

  // Main fraud detection method
  async detectFraud(
    transactionData: TransactionData,
    requestId: string
  ): Promise<FraudDetectionResult> {
    try {
      let riskScore = 0;
      let confidence = 0;
      const fraudTypes = new Set<FraudType>();
      const reasons: string[] = [];

      // Rule-based detection
      if (this.config.enabled) {
        const ruleResult = this.ruleBasedDetector.evaluateTransaction(transactionData);
        riskScore = ruleResult.riskScore;
        
        ruleResult.fraudTypes.forEach(type => fraudTypes.add(type));
        ruleResult.triggeredRules.forEach(rule => {
          reasons.push(`${rule.name} (${rule.severity} risk)`);
        });
      }

      // Machine Learning detection
      if (this.config.machineLearningEnabled) {
        const features = this.featureEngineering.extractFeatures(transactionData);
        const mlScore = this.mlModel.predict(features);
        
        // Combine rule-based and ML scores
        riskScore = (riskScore + (mlScore * 100)) / 2;
        confidence = mlScore;

        // Add ML-based fraud types
        if (mlScore > 0.7) {
          fraudTypes.add(FraudType.BEHAVIORAL_ANOMALY);
          reasons.push('Machine learning model detected suspicious pattern');
        }
      }

      // Determine risk level and action
      const riskLevel = this.determineRiskLevel(riskScore);
      const action = this.determineAction(riskLevel);

      // Additional validation for high-risk transactions
      if (riskLevel === FraudRiskLevel.HIGH || riskLevel === FraudRiskLevel.CRITICAL) {
        const additionalChecks = await this.performAdditionalChecks(transactionData);
        if (!additionalChecks.passed) {
          reasons.push(...additionalChecks.reasons);
          riskScore = Math.min(100, riskScore + 20); // Increase risk score
        }
      }

      return {
        isFraud: riskLevel === FraudRiskLevel.HIGH || riskLevel === FraudRiskLevel.CRITICAL,
        riskLevel,
        riskScore: Math.round(riskScore),
        fraudTypes: Array.from(fraudTypes),
        confidence: Math.max(confidence, 0.5), // Minimum confidence of 0.5
        action,
        reasons,
        metadata: {
          ruleBasedScore: riskScore,
          mlScore: this.config.machineLearningEnabled ? confidence : null,
          featureImportance: this.config.machineLearningEnabled ? this.mlModel.getFeatureImportance() : null,
          processingTime: Date.now() - Date.now(), // Will be calculated in real implementation
          modelVersion: this.config.modelVersion
        },
        timestamp: new Date().toISOString(),
        requestId
      };

    } catch (error: any) {
      // Fallback to conservative approach on error
      return {
        isFraud: true,
        riskLevel: FraudRiskLevel.HIGH,
        riskScore: 80,
        fraudTypes: [FraudType.PAYMENT_FRAUD],
        confidence: 0.3,
        action: FraudAction.REVIEW,
        reasons: [`Fraud detection error: ${error.message}`],
        metadata: {
          error: error.message,
          fallback: true
        },
        timestamp: new Date().toISOString(),
        requestId
      };
    }
  }

  private determineRiskLevel(riskScore: number): FraudRiskLevel {
    if (riskScore >= this.config.riskThresholds.critical) {
      return FraudRiskLevel.CRITICAL;
    } else if (riskScore >= this.config.riskThresholds.high) {
      return FraudRiskLevel.HIGH;
    } else if (riskScore >= this.config.riskThresholds.medium) {
      return FraudRiskLevel.MEDIUM;
    } else {
      return FraudRiskLevel.LOW;
    }
  }

  private determineAction(riskLevel: FraudRiskLevel): FraudAction {
    switch (riskLevel) {
      case FraudRiskLevel.LOW:
        return this.config.actions.low;
      case FraudRiskLevel.MEDIUM:
        return this.config.actions.medium;
      case FraudRiskLevel.HIGH:
        return this.config.actions.high;
      case FraudRiskLevel.CRITICAL:
        return this.config.actions.critical;
      default:
        return FraudAction.REVIEW;
    }
  }

  private async performAdditionalChecks(transactionData: TransactionData): Promise<{
    passed: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let passed = true;

    // Check for device reputation
    const deviceReputation = await this.checkDeviceReputation(transactionData.deviceFingerprint);
    if (deviceReputation < 0.3) {
      passed = false;
      reasons.push('Device has poor reputation');
    }

    // Check for IP reputation
    const ipReputation = await this.checkIPReputation(transactionData.ipAddress);
    if (ipReputation < 0.4) {
      passed = false;
      reasons.push('IP address has poor reputation');
    }

    // Check for velocity limits
    const velocityCheck = await this.checkVelocityLimits(transactionData.userId);
    if (!velocityCheck.passed) {
      passed = false;
      reasons.push(velocityCheck.reason);
    }

    return { passed, reasons };
  }

  private async checkDeviceReputation(deviceFingerprint: string): Promise<number> {
    // Mock implementation - in production, check against device reputation database
    return Math.random();
  }

  private async checkIPReputation(ipAddress: string): Promise<number> {
    // Mock implementation - in production, check against IP reputation services
    return Math.random();
  }

  private async checkVelocityLimits(userId: string): Promise<{
    passed: boolean;
    reason?: string;
  }> {
    // Mock implementation - in production, check transaction velocity
    const velocity = Math.random() * 20;
    if (velocity > 15) {
      return {
        passed: false,
        reason: 'Transaction velocity exceeds limits'
      };
    }
    return { passed: true };
  }

  // Update model with new transaction data
  async updateModel(transactionData: TransactionData, actualFraud: boolean): Promise<void> {
    if (this.config.machineLearningEnabled) {
      const features = this.featureEngineering.extractFeatures(transactionData);
      const label = actualFraud ? 1 : 0;
      
      // In production, this would update the ML model
      console.log('Updating model with new sample:', { features, label });
    }
  }

  // Get fraud detection statistics
  async getFraudStats(timeRange: string = '24h'): Promise<{
    totalTransactions: number;
    fraudDetected: number;
    falsePositives: number;
    accuracy: number;
    fraudTypes: Record<FraudType, number>;
    riskLevels: Record<FraudRiskLevel, number>;
  }> {
    // Mock implementation - in production, query from database
    return {
      totalTransactions: 1000,
      fraudDetected: 25,
      falsePositives: 5,
      accuracy: 0.95,
      fraudTypes: {
        [FraudType.PAYMENT_FRAUD]: 10,
        [FraudType.ACCOUNT_TAKEOVER]: 5,
        [FraudType.IDENTITY_THEFT]: 3,
        [FraudType.MONEY_LAUNDERING]: 2,
        [FraudType.CHARGEBACK_FRAUD]: 2,
        [FraudType.PHISHING]: 1,
        [FraudType.BOT_ATTACK]: 1,
        [FraudType.DEVICE_FRAUD]: 1,
        [FraudType.LOCATION_FRAUD]: 0,
        [FraudType.BEHAVIORAL_ANOMALY]: 0
      },
      riskLevels: {
        [FraudRiskLevel.LOW]: 800,
        [FraudRiskLevel.MEDIUM]: 150,
        [FraudRiskLevel.HIGH]: 40,
        [FraudRiskLevel.CRITICAL]: 10
      }
    };
  }
}

// Default fraud detection configuration
export const defaultFraudConfig: FraudDetectionConfig = {
  enabled: true,
  riskThresholds: {
    low: 20,
    medium: 40,
    high: 70,
    critical: 90
  },
  actions: {
    low: FraudAction.ALLOW,
    medium: FraudAction.REVIEW,
    high: FraudAction.CHALLENGE,
    critical: FraudAction.BLOCK
  },
  machineLearningEnabled: true,
  realTimeAnalysis: true,
  batchAnalysis: false,
  modelVersion: '1.0.0'
};

// Export types and enums
export { FraudRiskLevel, FraudType, FraudAction };
