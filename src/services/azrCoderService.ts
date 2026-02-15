import axios from 'axios';

const AZR_CODER_API_URL = process.env.NEXT_PUBLIC_AZR_CODER_API_URL || 'http://localhost:5000/api';

interface AZRCodeAnalysis {
  suggestions: Array<{
    type: 'optimization' | 'refactor' | 'bug' | 'documentation';
    message: string;
    codeSnippet: string;
    severity: 'low' | 'medium' | 'high';
    file?: string;
    line?: number;
    recommendedFix?: string;
  }>;
  metrics: {
    complexity: number;
    maintainability: number;
    performance: number;
    security: number;
  };
  summary: string;
}

interface AZRCodeCompletion {
  completions: Array<{
    text: string;
    score: number;
    docstring?: string;
    parameters?: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  }>;
}

interface AZRTestGeneration {
  testCode: string;
  testFramework: 'jest' | 'mocha' | 'jasmine' | 'pytest';
  testCases: Array<{
    description: string;
    input: any;
    expected: any;
  }>;
  coverageReport?: {
    statement: number;
    branch: number;
    function: number;
    line: number;
  };
}

class AZRCoderService {
  private static instance: AZRCoderService;
  private apiKey: string | null = null;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_AZR_CODER_API_KEY || null;
  }

  public static getInstance(): AZRCoderService {
    if (!AZRCoderService.instance) {
      AZRCoderService.instance = new AZRCoderService();
    }
    return AZRCoderService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
    };
  }

  public async analyzeCode(code: string, filePath?: string): Promise<AZRCodeAnalysis> {
    try {
      const response = await axios.post(
        `${AZR_CODER_API_URL}/analyze`,
        { code, filePath },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing code with AZR-CODER-7B:', error);
      throw error;
    }
  }

  public async getCodeCompletions(
    prefix: string,
    suffix: string = '',
    context: Record<string, any> = {}
  ): Promise<AZRCodeCompletion> {
    try {
      const response = await axios.post(
        `${AZR_CODER_API_URL}/complete`,
        { prefix, suffix, context },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting code completions from AZR-CODER-7B:', error);
      throw error;
    }
  }

  public async generateTests(
    code: string,
    testFramework: 'jest' | 'mocha' | 'jasmine' | 'pytest' = 'jest',
    options: {
      includeEdgeCases?: boolean;
      mockExternalDeps?: boolean;
      testType?: 'unit' | 'integration' | 'e2e';
    } = {}
  ): Promise<AZRTestGeneration> {
    try {
      const response = await axios.post(
        `${AZR_CODER_API_URL}/generate-tests`,
        { code, testFramework, ...options },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating tests with AZR-CODER-7B:', error);
      throw error;
    }
  }

  public async refactorCode(
    code: string,
    goals: Array<'performance' | 'readability' | 'security' | 'best-practices'> = ['best-practices']
  ): Promise<{ original: string; refactored: string; explanation: string }> {
    try {
      const response = await axios.post(
        `${AZR_CODER_API_URL}/refactor`,
        { code, goals },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error refactoring code with AZR-CODER-7B:', error);
      throw error;
    }
  }

  public async generateDocumentation(
    code: string,
    format: 'jsdoc' | 'tsdoc' | 'markdown' = 'jsdoc',
    options: {
      includeExamples?: boolean;
      language?: string;
      styleGuide?: 'google' | 'airbnb' | 'standard';
    } = {}
  ): Promise<{ documentation: string; examples?: string[] }> {
    try {
      const response = await axios.post(
        `${AZR_CODER_API_URL}/document`,
        { code, format, ...options },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating documentation with AZR-CODER-7B:', error);
      throw error;
    }
  }
}

export const azrCoderService = AZRCoderService.getInstance();
export type { AZRCodeAnalysis, AZRCodeCompletion, AZRTestGeneration };
