import { NextRequest } from 'next/server';

// OCR Service Configuration
interface OCRConfig {
  provider: 'tesseract' | 'google-vision' | 'aws-textract' | 'azure-computer-vision';
  apiKey?: string;
  endpoint?: string;
  confidence: number;
  languages: string[];
  imageFormats: string[];
}

interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  boundingBoxes: BoundingBox[];
  documentType: DocumentType;
  extractedFields: Record<string, any>;
  processingTime: number;
  error?: string;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  confidence: number;
}

enum DocumentType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  GST = 'gst',
  UDYAM = 'udyam',
  BANK_STATEMENT = 'bank_statement',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  VOTER_ID = 'voter_id',
  UNKNOWN = 'unknown'
}

// OCR Service Implementation
export class OCRService {
  private config: OCRConfig;

  constructor(config: OCRConfig) {
    this.config = {
      provider: 'tesseract',
      confidence: 0.8,
      languages: ['eng', 'hin'],
      imageFormats: ['jpg', 'jpeg', 'png', 'pdf'],
      ...config
    };
  }

  // Main OCR processing function
  async processDocument(
    imageBuffer: Buffer,
    fileName: string,
    documentType?: DocumentType
  ): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      // Validate file format
      const isValidFormat = this.validateImageFormat(fileName);
      if (!isValidFormat) {
        throw new Error(`Unsupported file format. Supported formats: ${this.config.imageFormats.join(', ')}`);
      }

      // Detect document type if not provided
      const detectedType = documentType || await this.detectDocumentType(imageBuffer);

      // Process based on provider
      let result: OCRResult;
      switch (this.config.provider) {
        case 'tesseract':
          result = await this.processWithTesseract(imageBuffer, detectedType);
          break;
        case 'google-vision':
          result = await this.processWithGoogleVision(imageBuffer, detectedType);
          break;
        case 'aws-textract':
          result = await this.processWithAWSTextract(imageBuffer, detectedType);
          break;
        case 'azure-computer-vision':
          result = await this.processWithAzureVision(imageBuffer, detectedType);
          break;
        default:
          throw new Error(`Unsupported OCR provider: ${this.config.provider}`);
      }

      result.processingTime = Date.now() - startTime;
      result.documentType = detectedType;
      result.extractedFields = await this.extractDocumentFields(result.text, detectedType);

      return result;

    } catch (error: any) {
      return {
        success: false,
        text: '',
        confidence: 0,
        boundingBoxes: [],
        documentType: DocumentType.UNKNOWN,
        extractedFields: {},
        processingTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  // Tesseract OCR Implementation (Open Source)
  private async processWithTesseract(imageBuffer: Buffer, documentType: DocumentType): Promise<OCRResult> {
    try {
      // In a real implementation, you would use tesseract.js or a server-side tesseract
      // This is a mock implementation
      const mockResult = await this.mockOCRProcessing(imageBuffer, documentType);
      
      return {
        success: true,
        text: mockResult.text,
        confidence: mockResult.confidence,
        boundingBoxes: mockResult.boundingBoxes,
        documentType,
        extractedFields: {},
        processingTime: 0
      };
    } catch (error: any) {
      throw new Error(`Tesseract OCR failed: ${error.message}`);
    }
  }

  // Google Vision API Implementation
  private async processWithGoogleVision(imageBuffer: Buffer, documentType: DocumentType): Promise<OCRResult> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Google Vision API key not configured');
      }

      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: imageBuffer.toString('base64')
            },
            features: [{
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.statusText}`);
      }

      const data = await response.json();
      const textAnnotation = data.responses[0].fullTextAnnotation;

      if (!textAnnotation) {
        throw new Error('No text detected in image');
      }

      const boundingBoxes: BoundingBox[] = textAnnotation.pages[0].blocks.map((block: any) => ({
        x: block.boundingBox.vertices[0].x,
        y: block.boundingBox.vertices[0].y,
        width: block.boundingBox.vertices[2].x - block.boundingBox.vertices[0].x,
        height: block.boundingBox.vertices[2].y - block.boundingBox.vertices[0].y,
        text: block.text,
        confidence: 0.9 // Google Vision doesn't provide confidence scores
      }));

      return {
        success: true,
        text: textAnnotation.text,
        confidence: 0.9,
        boundingBoxes,
        documentType,
        extractedFields: {},
        processingTime: 0
      };

    } catch (error: any) {
      throw new Error(`Google Vision OCR failed: ${error.message}`);
    }
  }

  // AWS Textract Implementation
  private async processWithAWSTextract(imageBuffer: Buffer, documentType: DocumentType): Promise<OCRResult> {
    try {
      // This would require AWS SDK integration
      // Mock implementation for now
      const mockResult = await this.mockOCRProcessing(imageBuffer, documentType);
      
      return {
        success: true,
        text: mockResult.text,
        confidence: mockResult.confidence,
        boundingBoxes: mockResult.boundingBoxes,
        documentType,
        extractedFields: {},
        processingTime: 0
      };
    } catch (error: any) {
      throw new Error(`AWS Textract OCR failed: ${error.message}`);
    }
  }

  // Azure Computer Vision Implementation
  private async processWithAzureVision(imageBuffer: Buffer, documentType: DocumentType): Promise<OCRResult> {
    try {
      if (!this.config.apiKey || !this.config.endpoint) {
        throw new Error('Azure Computer Vision API key and endpoint not configured');
      }

      const response = await fetch(`${this.config.endpoint}/vision/v3.2/read/analyze`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer
      });

      if (!response.ok) {
        throw new Error(`Azure Vision API error: ${response.statusText}`);
      }

      const operationLocation = response.headers.get('Operation-Location');
      if (!operationLocation) {
        throw new Error('No operation location returned from Azure Vision API');
      }

      // Poll for results
      let result;
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const statusResponse = await fetch(operationLocation, {
          headers: {
            'Ocp-Apim-Subscription-Key': this.config.apiKey,
          }
        });

        result = await statusResponse.json();
        
        if (result.status === 'succeeded') {
          break;
        } else if (result.status === 'failed') {
          throw new Error('Azure Vision API processing failed');
        }
        
        attempts++;
      }

      if (!result || result.status !== 'succeeded') {
        throw new Error('Azure Vision API processing timed out');
      }

      const text = result.analyzeResult.readResults
        .map((page: any) => page.lines.map((line: any) => line.text).join(' '))
        .join(' ');

      const boundingBoxes: BoundingBox[] = result.analyzeResult.readResults
        .flatMap((page: any) => page.lines.map((line: any) => ({
          x: line.boundingBox[0],
          y: line.boundingBox[1],
          width: line.boundingBox[4] - line.boundingBox[0],
          height: line.boundingBox[5] - line.boundingBox[1],
          text: line.text,
          confidence: 0.9
        })));

      return {
        success: true,
        text,
        confidence: 0.9,
        boundingBoxes,
        documentType,
        extractedFields: {},
        processingTime: 0
      };

    } catch (error: any) {
      throw new Error(`Azure Vision OCR failed: ${error.message}`);
    }
  }

  // Document type detection
  private async detectDocumentType(imageBuffer: Buffer): Promise<DocumentType> {
    // In a real implementation, you would use ML models or image analysis
    // For now, return unknown and let the user specify
    return DocumentType.UNKNOWN;
  }

  // Extract specific fields based on document type
  private async extractDocumentFields(text: string, documentType: DocumentType): Promise<Record<string, any>> {
    const extractedFields: Record<string, any> = {};

    switch (documentType) {
      case DocumentType.AADHAAR:
        extractedFields.aadhaarNumber = this.extractAadhaarNumber(text);
        extractedFields.name = this.extractAadhaarName(text);
        extractedFields.dob = this.extractAadhaarDOB(text);
        extractedFields.gender = this.extractAadhaarGender(text);
        extractedFields.address = this.extractAadhaarAddress(text);
        break;

      case DocumentType.PAN:
        extractedFields.panNumber = this.extractPANNumber(text);
        extractedFields.name = this.extractPANName(text);
        extractedFields.fatherName = this.extractPANFatherName(text);
        extractedFields.dob = this.extractPANDOB(text);
        break;

      case DocumentType.GST:
        extractedFields.gstNumber = this.extractGSTNumber(text);
        extractedFields.businessName = this.extractGSTBusinessName(text);
        extractedFields.address = this.extractGSTAddress(text);
        extractedFields.registrationDate = this.extractGSTRegistrationDate(text);
        break;

      case DocumentType.UDYAM:
        extractedFields.udyamNumber = this.extractUdyamNumber(text);
        extractedFields.businessName = this.extractUdyamBusinessName(text);
        extractedFields.businessType = this.extractUdyamBusinessType(text);
        extractedFields.investment = this.extractUdyamInvestment(text);
        extractedFields.turnover = this.extractUdyamTurnover(text);
        break;

      case DocumentType.BANK_STATEMENT:
        extractedFields.accountNumber = this.extractBankAccountNumber(text);
        extractedFields.ifscCode = this.extractBankIFSC(text);
        extractedFields.bankName = this.extractBankName(text);
        extractedFields.branchName = this.extractBankBranch(text);
        break;
    }

    return extractedFields;
  }

  // Field extraction methods
  private extractAadhaarNumber(text: string): string | null {
    const regex = /\b\d{4}\s\d{4}\s\d{4}\b/;
    const match = text.match(regex);
    return match ? match[0].replace(/\s/g, '') : null;
  }

  private extractAadhaarName(text: string): string | null {
    // Look for name patterns in Aadhaar card
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('Name') || line.includes('नाम')) {
        return lines[i + 1]?.trim() || null;
      }
    }
    return null;
  }

  private extractAadhaarDOB(text: string): string | null {
    const regex = /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractAadhaarGender(text: string): string | null {
    if (text.includes('Male') || text.includes('MALE') || text.includes('पुरुष')) return 'Male';
    if (text.includes('Female') || text.includes('FEMALE') || text.includes('महिला')) return 'Female';
    return null;
  }

  private extractAadhaarAddress(text: string): string | null {
    // Extract address from Aadhaar card
    const lines = text.split('\n');
    const addressStartIndex = lines.findIndex(line => 
      line.includes('Address') || line.includes('पता')
    );
    
    if (addressStartIndex !== -1) {
      const addressLines = lines.slice(addressStartIndex + 1, addressStartIndex + 5);
      return addressLines.join(' ').trim();
    }
    
    return null;
  }

  private extractPANNumber(text: string): string | null {
    const regex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractPANName(text: string): string | null {
    const lines = text.split('\n');
    const nameIndex = lines.findIndex(line => 
      line.includes('Name') || line.includes('नाम')
    );
    return nameIndex !== -1 ? lines[nameIndex + 1]?.trim() : null;
  }

  private extractPANFatherName(text: string): string | null {
    const lines = text.split('\n');
    const fatherNameIndex = lines.findIndex(line => 
      line.includes('Father') || line.includes('पिता')
    );
    return fatherNameIndex !== -1 ? lines[fatherNameIndex + 1]?.trim() : null;
  }

  private extractPANDOB(text: string): string | null {
    const regex = /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractGSTNumber(text: string): string | null {
    const regex = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractGSTBusinessName(text: string): string | null {
    const lines = text.split('\n');
    const businessNameIndex = lines.findIndex(line => 
      line.includes('Business Name') || line.includes('व्यवसाय का नाम')
    );
    return businessNameIndex !== -1 ? lines[businessNameIndex + 1]?.trim() : null;
  }

  private extractGSTAddress(text: string): string | null {
    const lines = text.split('\n');
    const addressStartIndex = lines.findIndex(line => 
      line.includes('Address') || line.includes('पता')
    );
    
    if (addressStartIndex !== -1) {
      const addressLines = lines.slice(addressStartIndex + 1, addressStartIndex + 4);
      return addressLines.join(' ').trim();
    }
    
    return null;
  }

  private extractGSTRegistrationDate(text: string): string | null {
    const regex = /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/;
    const matches = text.match(regex);
    return matches ? matches[matches.length - 1] : null; // Get the last date found
  }

  private extractUdyamNumber(text: string): string | null {
    const regex = /UDYAM-[A-Z]{2}-\d{2}-\d{7}/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractUdyamBusinessName(text: string): string | null {
    const lines = text.split('\n');
    const businessNameIndex = lines.findIndex(line => 
      line.includes('Business Name') || line.includes('व्यवसाय का नाम')
    );
    return businessNameIndex !== -1 ? lines[businessNameIndex + 1]?.trim() : null;
  }

  private extractUdyamBusinessType(text: string): string | null {
    if (text.includes('Manufacturing')) return 'Manufacturing';
    if (text.includes('Service')) return 'Service';
    if (text.includes('Trading')) return 'Trading';
    return null;
  }

  private extractUdyamInvestment(text: string): string | null {
    const regex = /₹\s*[\d,]+/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractUdyamTurnover(text: string): string | null {
    const regex = /₹\s*[\d,]+/g;
    const matches = text.match(regex);
    return matches ? matches[matches.length - 1] : null; // Get the last amount found
  }

  private extractBankAccountNumber(text: string): string | null {
    const regex = /\b\d{9,18}\b/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractBankIFSC(text: string): string | null {
    const regex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }

  private extractBankName(text: string): string | null {
    const commonBanks = [
      'SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank',
      'Bank of Baroda', 'Canara Bank', 'Union Bank', 'Indian Bank'
    ];
    
    for (const bank of commonBanks) {
      if (text.includes(bank)) {
        return bank;
      }
    }
    
    return null;
  }

  private extractBankBranch(text: string): string | null {
    const lines = text.split('\n');
    const branchIndex = lines.findIndex(line => 
      line.includes('Branch') || line.includes('शाखा')
    );
    return branchIndex !== -1 ? lines[branchIndex + 1]?.trim() : null;
  }

  // Validation methods
  private validateImageFormat(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? this.config.imageFormats.includes(extension) : false;
  }

  // Mock OCR processing for development/testing
  private async mockOCRProcessing(imageBuffer: Buffer, documentType: DocumentType): Promise<{
    text: string;
    confidence: number;
    boundingBoxes: BoundingBox[];
  }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockTexts: Record<DocumentType, string> = {
      [DocumentType.AADHAAR]: 'Government of India\nName: John Doe\nDOB: 01/01/1990\nGender: Male\nAddress: 123 Main St, City\nAadhaar: 1234 5678 9012',
      [DocumentType.PAN]: 'INCOME TAX DEPARTMENT\nPermanent Account Number Card\nName: John Doe\nFather\'s Name: Richard Doe\nDOB: 01/01/1990\nABCDE1234F',
      [DocumentType.GST]: 'GST Registration Certificate\nBusiness Name: ABC Enterprises\nGSTIN: 07ABCDE1234F1Z5\nAddress: 123 Business St, City\nRegistration Date: 01/01/2020',
      [DocumentType.UDYAM]: 'Udyam Registration Certificate\nBusiness Name: ABC Enterprises\nUDYAM-UP-01-1234567\nType: Manufacturing\nInvestment: ₹50,00,000\nTurnover: ₹2,00,00,000',
      [DocumentType.BANK_STATEMENT]: 'Account Statement\nAccount Number: 123456789012\nIFSC: SBIN0001234\nBank: State Bank of India\nBranch: Main Branch',
      [DocumentType.PASSPORT]: 'Republic of India\nPassport\nName: John Doe\nPassport No: A1234567\nDOB: 01/01/1990',
      [DocumentType.DRIVING_LICENSE]: 'Driving License\nName: John Doe\nLicense No: DL123456789\nDOB: 01/01/1990',
      [DocumentType.VOTER_ID]: 'Elector\'s Photo Identity Card\nName: John Doe\nEPIC No: ABC1234567\nDOB: 01/01/1990',
      [DocumentType.UNKNOWN]: 'Document text extracted successfully'
    };

    return {
      text: mockTexts[documentType] || mockTexts[DocumentType.UNKNOWN],
      confidence: 0.85,
      boundingBoxes: []
    };
  }
}

// Document verification service
export class DocumentVerificationService {
  private ocrService: OCRService;

  constructor(ocrConfig: OCRConfig) {
    this.ocrService = new OCRService(ocrConfig);
  }

  async verifyDocument(
    imageBuffer: Buffer,
    fileName: string,
    documentType: DocumentType,
    expectedFields?: Record<string, any>
  ): Promise<{
    isValid: boolean;
    confidence: number;
    extractedFields: Record<string, any>;
    verificationResults: Record<string, boolean>;
    errors: string[];
  }> {
    const errors: string[] = [];
    const verificationResults: Record<string, boolean> = {};

    try {
      // Process document with OCR
      const ocrResult = await this.ocrService.processDocument(imageBuffer, fileName, documentType);
      
      if (!ocrResult.success) {
        errors.push(`OCR processing failed: ${ocrResult.error}`);
        return {
          isValid: false,
          confidence: 0,
          extractedFields: {},
          verificationResults: {},
          errors
        };
      }

      // Verify extracted fields if expected fields are provided
      if (expectedFields) {
        for (const [field, expectedValue] of Object.entries(expectedFields)) {
          const extractedValue = ocrResult.extractedFields[field];
          verificationResults[field] = this.compareValues(extractedValue, expectedValue);
          
          if (!verificationResults[field]) {
            errors.push(`Field '${field}' verification failed. Expected: ${expectedValue}, Found: ${extractedValue}`);
          }
        }
      }

      // Document-specific validation
      const documentValidation = this.validateDocumentSpecific(ocrResult.extractedFields, documentType);
      verificationResults.documentValid = documentValidation.isValid;
      
      if (!documentValidation.isValid) {
        errors.push(...documentValidation.errors);
      }

      const isValid = Object.values(verificationResults).every(result => result === true);

      return {
        isValid,
        confidence: ocrResult.confidence,
        extractedFields: ocrResult.extractedFields,
        verificationResults,
        errors
      };

    } catch (error: any) {
      errors.push(`Document verification failed: ${error.message}`);
      return {
        isValid: false,
        confidence: 0,
        extractedFields: {},
        verificationResults: {},
        errors
      };
    }
  }

  private compareValues(extracted: any, expected: any): boolean {
    if (typeof extracted === 'string' && typeof expected === 'string') {
      return extracted.toLowerCase().trim() === expected.toLowerCase().trim();
    }
    return extracted === expected;
  }

  private validateDocumentSpecific(
    extractedFields: Record<string, any>,
    documentType: DocumentType
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (documentType) {
      case DocumentType.AADHAAR:
        if (!extractedFields.aadhaarNumber || !this.validateAadhaarNumber(extractedFields.aadhaarNumber)) {
          errors.push('Invalid Aadhaar number format');
        }
        if (!extractedFields.name) {
          errors.push('Name not found in Aadhaar card');
        }
        break;

      case DocumentType.PAN:
        if (!extractedFields.panNumber || !this.validatePANNumber(extractedFields.panNumber)) {
          errors.push('Invalid PAN number format');
        }
        if (!extractedFields.name) {
          errors.push('Name not found in PAN card');
        }
        break;

      case DocumentType.GST:
        if (!extractedFields.gstNumber || !this.validateGSTNumber(extractedFields.gstNumber)) {
          errors.push('Invalid GST number format');
        }
        if (!extractedFields.businessName) {
          errors.push('Business name not found in GST certificate');
        }
        break;

      case DocumentType.UDYAM:
        if (!extractedFields.udyamNumber || !this.validateUdyamNumber(extractedFields.udyamNumber)) {
          errors.push('Invalid Udyam number format');
        }
        if (!extractedFields.businessName) {
          errors.push('Business name not found in Udyam certificate');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateAadhaarNumber(aadhaar: string): boolean {
    const regex = /^\d{12}$/;
    return regex.test(aadhaar);
  }

  private validatePANNumber(pan: string): boolean {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan);
  }

  private validateGSTNumber(gst: string): boolean {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gst);
  }

  private validateUdyamNumber(udyam: string): boolean {
    const regex = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;
    return regex.test(udyam);
  }
}

// Export default OCR configuration
export const defaultOCRConfig: OCRConfig = {
  provider: 'tesseract',
  confidence: 0.8,
  languages: ['eng', 'hin'],
  imageFormats: ['jpg', 'jpeg', 'png', 'pdf']
};

// Export document types
export { DocumentType };
