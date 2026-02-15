import { OCRService, DocumentVerificationService, DocumentType } from './ocr-integration';
import { FraudDetectionService, defaultFraudConfig } from './fraud-detection';

// Real document testing interface
export interface DocumentTestCase {
  id: string;
  name: string;
  documentType: DocumentType;
  filePath: string;
  expectedFields: Record<string, any>;
  expectedAccuracy: number;
  description: string;
  testData: {
    aadhaarNumber?: string;
    panNumber?: string;
    gstNumber?: string;
    businessName?: string;
    name?: string;
    dob?: string;
    address?: string;
  };
}

export interface TestResult {
  testCaseId: string;
  success: boolean;
  accuracy: number;
  extractedFields: Record<string, any>;
  expectedFields: Record<string, any>;
  errors: string[];
  processingTime: number;
  confidence: number;
  validationResults: Record<string, boolean>;
}

export interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageAccuracy: number;
  totalProcessingTime: number;
  results: TestResult[];
  summary: {
    byDocumentType: Record<DocumentType, { passed: number; failed: number; accuracy: number }>;
    byAccuracy: { high: number; medium: number; low: number };
  };
}

// Real Document Testing Suite
export class DocumentTestingSuite {
  private ocrService: OCRService;
  private verificationService: DocumentVerificationService;
  private fraudDetectionService: FraudDetectionService;
  private testCases: DocumentTestCase[];

  constructor() {
    this.ocrService = new OCRService({
      provider: 'tesseract',
      confidence: 0.8,
      languages: ['eng', 'hin'],
      imageFormats: ['jpg', 'jpeg', 'png', 'pdf']
    });

    this.verificationService = new DocumentVerificationService({
      provider: 'tesseract',
      confidence: 0.8,
      languages: ['eng', 'hin'],
      imageFormats: ['jpg', 'jpeg', 'png', 'pdf']
    });

    this.fraudDetectionService = new FraudDetectionService(defaultFraudConfig);
    this.testCases = this.initializeTestCases();
  }

  // Initialize real document test cases
  private initializeTestCases(): DocumentTestCase[] {
    return [
      // Aadhaar Card Test Cases
      {
        id: 'aadhaar_001',
        name: 'Standard Aadhaar Card - English',
        documentType: DocumentType.AADHAAR,
        filePath: '/test-documents/aadhaar/standard_english.jpg',
        expectedFields: {
          aadhaarNumber: '123456789012',
          name: 'John Doe',
          dob: '01/01/1990',
          gender: 'Male',
          address: '123 Main Street, City, State'
        },
        expectedAccuracy: 0.95,
        description: 'Standard Aadhaar card with clear English text',
        testData: {
          aadhaarNumber: '123456789012',
          name: 'John Doe',
          dob: '01/01/1990',
          address: '123 Main Street, City, State'
        }
      },
      {
        id: 'aadhaar_002',
        name: 'Aadhaar Card - Hindi',
        documentType: DocumentType.AADHAAR,
        filePath: '/test-documents/aadhaar/hindi_card.jpg',
        expectedFields: {
          aadhaarNumber: '987654321098',
          name: 'राम शर्मा',
          dob: '15/06/1985',
          gender: 'Male',
          address: 'मुख्य सड़क, शहर, राज्य'
        },
        expectedAccuracy: 0.90,
        description: 'Aadhaar card with Hindi text',
        testData: {
          aadhaarNumber: '987654321098',
          name: 'राम शर्मा',
          dob: '15/06/1985',
          address: 'मुख्य सड़क, शहर, राज्य'
        }
      },
      {
        id: 'aadhaar_003',
        name: 'Poor Quality Aadhaar Card',
        documentType: DocumentType.AADHAAR,
        filePath: '/test-documents/aadhaar/poor_quality.jpg',
        expectedFields: {
          aadhaarNumber: '456789123456',
          name: 'Jane Smith',
          dob: '20/12/1988',
          gender: 'Female'
        },
        expectedAccuracy: 0.75,
        description: 'Aadhaar card with poor image quality',
        testData: {
          aadhaarNumber: '456789123456',
          name: 'Jane Smith',
          dob: '20/12/1988'
        }
      },

      // PAN Card Test Cases
      {
        id: 'pan_001',
        name: 'Standard PAN Card',
        documentType: DocumentType.PAN,
        filePath: '/test-documents/pan/standard_pan.jpg',
        expectedFields: {
          panNumber: 'ABCDE1234F',
          name: 'John Doe',
          fatherName: 'Richard Doe',
          dob: '01/01/1990'
        },
        expectedAccuracy: 0.98,
        description: 'Standard PAN card with clear text',
        testData: {
          panNumber: 'ABCDE1234F',
          name: 'John Doe',
          fatherName: 'Richard Doe',
          dob: '01/01/1990'
        }
      },
      {
        id: 'pan_002',
        name: 'Old Format PAN Card',
        documentType: DocumentType.PAN,
        filePath: '/test-documents/pan/old_format.jpg',
        expectedFields: {
          panNumber: 'FGHIJ5678K',
          name: 'Mary Johnson',
          fatherName: 'Robert Johnson',
          dob: '15/03/1985'
        },
        expectedAccuracy: 0.92,
        description: 'Old format PAN card',
        testData: {
          panNumber: 'FGHIJ5678K',
          name: 'Mary Johnson',
          fatherName: 'Robert Johnson',
          dob: '15/03/1985'
        }
      },

      // GST Certificate Test Cases
      {
        id: 'gst_001',
        name: 'Standard GST Certificate',
        documentType: DocumentType.GST,
        filePath: '/test-documents/gst/standard_gst.jpg',
        expectedFields: {
          gstNumber: '07ABCDE1234F1Z5',
          businessName: 'ABC Enterprises Pvt Ltd',
          address: 'Business Park, Delhi',
          registrationDate: '01/07/2017'
        },
        expectedAccuracy: 0.95,
        description: 'Standard GST registration certificate',
        testData: {
          gstNumber: '07ABCDE1234F1Z5',
          businessName: 'ABC Enterprises Pvt Ltd',
          address: 'Business Park, Delhi'
        }
      },
      {
        id: 'gst_002',
        name: 'GST Certificate - Complex Business Name',
        documentType: DocumentType.GST,
        filePath: '/test-documents/gst/complex_business.jpg',
        expectedFields: {
          gstNumber: '27XYZAB9876C2D8',
          businessName: 'M/S XYZ Trading & Manufacturing Co.',
          address: 'Industrial Area, Mumbai'
        },
        expectedAccuracy: 0.88,
        description: 'GST certificate with complex business name',
        testData: {
          gstNumber: '27XYZAB9876C2D8',
          businessName: 'M/S XYZ Trading & Manufacturing Co.',
          address: 'Industrial Area, Mumbai'
        }
      },

      // Udyam Certificate Test Cases
      {
        id: 'udyam_001',
        name: 'Standard Udyam Certificate',
        documentType: DocumentType.UDYAM,
        filePath: '/test-documents/udyam/standard_udyam.jpg',
        expectedFields: {
          udyamNumber: 'UDYAM-UP-01-1234567',
          businessName: 'DEF Industries',
          businessType: 'Manufacturing',
          investment: '₹50,00,000',
          turnover: '₹2,00,00,000'
        },
        expectedAccuracy: 0.93,
        description: 'Standard Udyam registration certificate',
        testData: {
          businessName: 'DEF Industries',
          businessType: 'Manufacturing'
        }
      },

      // Bank Statement Test Cases
      {
        id: 'bank_001',
        name: 'SBI Bank Statement',
        documentType: DocumentType.BANK_STATEMENT,
        filePath: '/test-documents/bank/sbi_statement.pdf',
        expectedFields: {
          accountNumber: '123456789012',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          branchName: 'Main Branch'
        },
        expectedAccuracy: 0.96,
        description: 'SBI bank statement with clear text',
        testData: {
          accountNumber: '123456789012',
          ifscCode: 'SBIN0001234',
          bankName: 'State Bank of India',
          branchName: 'Main Branch'
        }
      },
      {
        id: 'bank_002',
        name: 'HDFC Bank Statement',
        documentType: DocumentType.BANK_STATEMENT,
        filePath: '/test-documents/bank/hdfc_statement.pdf',
        expectedFields: {
          accountNumber: '987654321098',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          branchName: 'Corporate Branch'
        },
        expectedAccuracy: 0.94,
        description: 'HDFC bank statement',
        testData: {
          accountNumber: '987654321098',
          ifscCode: 'HDFC0001234',
          bankName: 'HDFC Bank',
          branchName: 'Corporate Branch'
        }
      }
    ];
  }

  // Run complete test suite
  async runTestSuite(): Promise<TestSuiteResult> {
    console.log('Starting Document Testing Suite...');
    const results: TestResult[] = [];
    const startTime = Date.now();

    for (const testCase of this.testCases) {
      try {
        console.log(`Running test: ${testCase.name}`);
        const result = await this.runSingleTest(testCase);
        results.push(result);
        console.log(`Test ${testCase.name}: ${result.success ? 'PASSED' : 'FAILED'} (${result.accuracy.toFixed(2)} accuracy)`);
      } catch (error: any) {
        console.error(`Test ${testCase.name} failed with error:`, error.message);
        results.push({
          testCaseId: testCase.id,
          success: false,
          accuracy: 0,
          extractedFields: {},
          expectedFields: testCase.expectedFields,
          errors: [error.message],
          processingTime: 0,
          confidence: 0,
          validationResults: {}
        });
      }
    }

    const totalProcessingTime = Date.now() - startTime;
    return this.generateTestSuiteResult(results, totalProcessingTime);
  }

  // Run single test case
  async runSingleTest(testCase: DocumentTestCase): Promise<TestResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const validationResults: Record<string, boolean> = {};

    try {
      // Load test document (mock implementation - in production, load actual files)
      const documentBuffer = await this.loadTestDocument(testCase.filePath);
      
      // Process document with OCR
      const ocrResult = await this.ocrService.processDocument(
        documentBuffer,
        testCase.filePath,
        testCase.documentType
      );

      if (!ocrResult.success) {
        errors.push(`OCR processing failed: ${ocrResult.error}`);
        return {
          testCaseId: testCase.id,
          success: false,
          accuracy: 0,
          extractedFields: {},
          expectedFields: testCase.expectedFields,
          errors,
          processingTime: Date.now() - startTime,
          confidence: 0,
          validationResults: {}
        };
      }

      // Verify document
      const verificationResult = await this.verificationService.verifyDocument(
        documentBuffer,
        testCase.filePath,
        testCase.documentType,
        testCase.expectedFields
      );

      // Calculate accuracy
      const accuracy = this.calculateAccuracy(
        ocrResult.extractedFields,
        testCase.expectedFields
      );

      // Validate individual fields
      for (const [field, expectedValue] of Object.entries(testCase.expectedFields)) {
        const extractedValue = ocrResult.extractedFields[field];
        const isValid = this.compareFieldValues(extractedValue, expectedValue);
        validationResults[field] = isValid;
        
        if (!isValid) {
          errors.push(`Field '${field}' validation failed. Expected: ${expectedValue}, Found: ${extractedValue}`);
        }
      }

      // Test fraud detection on document
      const fraudTestResult = await this.testFraudDetection(testCase);

      const success = accuracy >= testCase.expectedAccuracy && errors.length === 0;

      return {
        testCaseId: testCase.id,
        success,
        accuracy,
        extractedFields: ocrResult.extractedFields,
        expectedFields: testCase.expectedFields,
        errors,
        processingTime: Date.now() - startTime,
        confidence: ocrResult.confidence,
        validationResults
      };

    } catch (error: any) {
      errors.push(`Test execution failed: ${error.message}`);
      return {
        testCaseId: testCase.id,
        success: false,
        accuracy: 0,
        extractedFields: {},
        expectedFields: testCase.expectedFields,
        errors,
        processingTime: Date.now() - startTime,
        confidence: 0,
        validationResults: {}
      };
    }
  }

  // Test fraud detection capabilities
  private async testFraudDetection(testCase: DocumentTestCase): Promise<{
    fraudDetected: boolean;
    riskScore: number;
    fraudTypes: string[];
  }> {
    try {
      // Create mock transaction data for fraud detection testing
      const mockTransactionData = {
        userId: 'test_user_123',
        amount: 50000,
        currency: 'INR',
        paymentMethod: 'card',
        deviceFingerprint: 'test_device_123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          country: 'IN',
          city: 'Delhi',
          timezone: 'Asia/Kolkata'
        },
        sessionData: {
          sessionId: 'test_session_123',
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          pageViews: 5,
          timeOnSite: 300
        },
        userProfile: {
          accountAge: 30,
          previousTransactions: 10,
          averageTransactionAmount: 25000,
          riskHistory: [],
          kycStatus: 'verified',
          verificationLevel: 'high'
        },
        merchantData: {
          merchantId: 'test_merchant',
          category: 'ecommerce',
          reputation: 85,
          chargebackRate: 0.02
        },
        timestamp: new Date().toISOString(),
        metadata: {
          documentType: testCase.documentType,
          testCase: testCase.id
        }
      };

      const fraudResult = await this.fraudDetectionService.detectFraud(
        mockTransactionData,
        `test_${testCase.id}_${Date.now()}`
      );

      return {
        fraudDetected: fraudResult.isFraud,
        riskScore: fraudResult.riskScore,
        fraudTypes: fraudResult.fraudTypes
      };

    } catch (error: any) {
      console.error('Fraud detection test failed:', error);
      return {
        fraudDetected: false,
        riskScore: 0,
        fraudTypes: []
      };
    }
  }

  // Load test document (mock implementation)
  private async loadTestDocument(filePath: string): Promise<Buffer> {
    // In production, this would load actual document files
    // For testing, we'll create mock document buffers
    console.log(`Loading test document: ${filePath}`);
    
    // Simulate document loading delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock buffer (in production, this would be actual file content)
    return Buffer.from('mock document content for testing');
  }

  // Calculate accuracy between extracted and expected fields
  private calculateAccuracy(extracted: Record<string, any>, expected: Record<string, any>): number {
    let correctFields = 0;
    let totalFields = Object.keys(expected).length;

    for (const [field, expectedValue] of Object.entries(expected)) {
      const extractedValue = extracted[field];
      if (this.compareFieldValues(extractedValue, expectedValue)) {
        correctFields++;
      }
    }

    return totalFields > 0 ? correctFields / totalFields : 0;
  }

  // Compare field values with fuzzy matching
  private compareFieldValues(extracted: any, expected: any): boolean {
    if (!extracted || !expected) return false;
    
    // Convert to strings for comparison
    const extractedStr = String(extracted).toLowerCase().trim();
    const expectedStr = String(expected).toLowerCase().trim();
    
    // Exact match
    if (extractedStr === expectedStr) return true;
    
    // Fuzzy matching for common variations
    if (this.isFuzzyMatch(extractedStr, expectedStr)) return true;
    
    return false;
  }

  // Fuzzy matching for common OCR variations
  private isFuzzyMatch(extracted: string, expected: string): boolean {
    // Remove common OCR errors
    const cleanExtracted = extracted
      .replace(/[0O]/g, '0')  // Replace O with 0
      .replace(/[1I]/g, '1')  // Replace I with 1
      .replace(/[5S]/g, '5')  // Replace S with 5
      .replace(/[8B]/g, '8')  // Replace B with 8
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();
    
    const cleanExpected = expected
      .replace(/[0O]/g, '0')
      .replace(/[1I]/g, '1')
      .replace(/[5S]/g, '5')
      .replace(/[8B]/g, '8')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanExtracted === cleanExpected;
  }

  // Generate test suite result summary
  private generateTestSuiteResult(results: TestResult[], totalProcessingTime: number): TestSuiteResult {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const averageAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;

    // Group by document type
    const byDocumentType: Record<DocumentType, { passed: number; failed: number; accuracy: number }> = {} as any;
    for (const testCase of this.testCases) {
      const testResults = results.filter(r => r.testCaseId === testCase.id);
      if (testResults.length > 0) {
        const passed = testResults.filter(r => r.success).length;
        const failed = testResults.length - passed;
        const accuracy = testResults.reduce((sum, r) => sum + r.accuracy, 0) / testResults.length;
        
        byDocumentType[testCase.documentType] = { passed, failed, accuracy };
      }
    }

    // Group by accuracy level
    const byAccuracy = {
      high: results.filter(r => r.accuracy >= 0.9).length,
      medium: results.filter(r => r.accuracy >= 0.7 && r.accuracy < 0.9).length,
      low: results.filter(r => r.accuracy < 0.7).length
    };

    return {
      totalTests,
      passedTests,
      failedTests,
      averageAccuracy,
      totalProcessingTime,
      results,
      summary: {
        byDocumentType,
        byAccuracy
      }
    };
  }

  // Generate detailed test report
  generateTestReport(result: TestSuiteResult): string {
    let report = `
# Document Testing Suite Report
Generated: ${new Date().toISOString()}

## Summary
- Total Tests: ${result.totalTests}
- Passed: ${result.passedTests} (${((result.passedTests / result.totalTests) * 100).toFixed(1)}%)
- Failed: ${result.failedTests} (${((result.failedTests / result.totalTests) * 100).toFixed(1)}%)
- Average Accuracy: ${(result.averageAccuracy * 100).toFixed(2)}%
- Total Processing Time: ${result.totalProcessingTime}ms

## Results by Document Type
`;

    for (const [docType, stats] of Object.entries(result.summary.byDocumentType)) {
      report += `
### ${docType.toUpperCase()}
- Passed: ${stats.passed}
- Failed: ${stats.failed}
- Accuracy: ${(stats.accuracy * 100).toFixed(2)}%
`;
    }

    report += `
## Results by Accuracy Level
- High Accuracy (≥90%): ${result.summary.byAccuracy.high}
- Medium Accuracy (70-89%): ${result.summary.byAccuracy.medium}
- Low Accuracy (<70%): ${result.summary.byAccuracy.low}

## Detailed Test Results
`;

    for (const testResult of result.results) {
      const testCase = this.testCases.find(tc => tc.id === testResult.testCaseId);
      report += `
### ${testCase?.name || testResult.testCaseId}
- Status: ${testResult.success ? '✅ PASSED' : '❌ FAILED'}
- Accuracy: ${(testResult.accuracy * 100).toFixed(2)}%
- Processing Time: ${testResult.processingTime}ms
- Confidence: ${(testResult.confidence * 100).toFixed(2)}%

#### Field Validation Results:
`;
      for (const [field, isValid] of Object.entries(testResult.validationResults)) {
        report += `- ${field}: ${isValid ? '✅' : '❌'}\n`;
      }

      if (testResult.errors.length > 0) {
        report += `
#### Errors:
`;
        for (const error of testResult.errors) {
          report += `- ${error}\n`;
        }
      }
    }

    return report;
  }

  // Export test results to JSON
  exportTestResults(result: TestSuiteResult): string {
    return JSON.stringify(result, null, 2);
  }

  // Get test cases by document type
  getTestCasesByDocumentType(documentType: DocumentType): DocumentTestCase[] {
    return this.testCases.filter(tc => tc.documentType === documentType);
  }

  // Add custom test case
  addCustomTestCase(testCase: DocumentTestCase): void {
    this.testCases.push(testCase);
  }

  // Remove test case
  removeTestCase(testCaseId: string): boolean {
    const index = this.testCases.findIndex(tc => tc.id === testCaseId);
    if (index !== -1) {
      this.testCases.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export testing suite
export { DocumentTestingSuite, DocumentTestCase, TestResult, TestSuiteResult };
