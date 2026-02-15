import { NextRequest } from 'next/server';

// Biometric authentication types
export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACIAL = 'facial',
  VOICE = 'voice',
  IRIS = 'iris',
  RETINA = 'retina',
  SIGNATURE = 'signature',
  BEHAVIORAL = 'behavioral'
}

export enum BiometricAuthStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  NOT_AVAILABLE = 'not_available',
  NOT_ENROLLED = 'not_enrolled',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  ERROR = 'error'
}

export interface BiometricAuthResult {
  status: BiometricAuthStatus;
  confidence: number;
  biometricType: BiometricType;
  userId: string;
  transactionId: string;
  timestamp: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface BiometricEnrollment {
  userId: string;
  biometricType: BiometricType;
  template: string; // Encrypted biometric template
  metadata: {
    deviceInfo: string;
    enrollmentDate: string;
    quality: number;
    attempts: number;
  };
  isActive: boolean;
}

export interface BiometricAuthConfig {
  enabledTypes: BiometricType[];
  requiredTypes: BiometricType[];
  minConfidence: number;
  maxAttempts: number;
  timeout: number; // in milliseconds
  fallbackToPIN: boolean;
  encryptionKey: string;
  allowMultipleDevices: boolean;
}

// WebAuthn API Integration
export class WebAuthnBiometricService {
  private config: BiometricAuthConfig;

  constructor(config: BiometricAuthConfig) {
    this.config = config;
  }

  // Check if biometric authentication is supported
  async isSupported(): Promise<{
    supported: boolean;
    availableTypes: BiometricType[];
    error?: string;
  }> {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        return {
          supported: false,
          availableTypes: [],
          error: 'WebAuthn not supported in this browser'
        };
      }

      const availableTypes: BiometricType[] = [];

      // Check for platform authenticators (fingerprint, face)
      const platformAuthenticators = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (platformAuthenticators) {
        availableTypes.push(BiometricType.FINGERPRINT, BiometricType.FACIAL);
      }

      // Check for cross-platform authenticators (USB keys, etc.)
      const crossPlatformAuthenticators = await PublicKeyCredential.isConditionalMediationAvailable();
      if (crossPlatformAuthenticators) {
        availableTypes.push(BiometricType.FINGERPRINT);
      }

      return {
        supported: availableTypes.length > 0,
        availableTypes
      };

    } catch (error: any) {
      return {
        supported: false,
        availableTypes: [],
        error: error.message
      };
    }
  }

  // Enroll user for biometric authentication
  async enrollUser(
    userId: string,
    biometricType: BiometricType,
    displayName?: string
  ): Promise<{
    success: boolean;
    credentialId?: string;
    error?: string;
  }> {
    try {
      const challenge = this.generateChallenge();
      
      const credentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: 'Bell24h',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: displayName || userId,
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: this.getAuthenticatorAttachment(biometricType),
          userVerification: 'required',
          residentKey: 'required',
        },
        timeout: this.config.timeout,
        attestation: 'direct',
      };

      const credential = await navigator.credentials.create({
        publicKey: credentialCreationOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        return {
          success: false,
          error: 'Failed to create credential'
        };
      }

      // Store credential ID and public key
      const credentialId = this.arrayBufferToBase64(credential.rawId);
      
      // Send to server for storage
      const enrollmentResult = await this.sendEnrollmentToServer({
        userId,
        credentialId,
        publicKey: credential.response,
        biometricType,
        challenge
      });

      return {
        success: enrollmentResult.success,
        credentialId,
        error: enrollmentResult.error
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Authenticate user with biometric
  async authenticateUser(
    userId: string,
    biometricType: BiometricType,
    transactionId: string
  ): Promise<BiometricAuthResult> {
    try {
      // Get stored credentials for user
      const storedCredentials = await this.getUserCredentials(userId, biometricType);
      
      if (!storedCredentials || storedCredentials.length === 0) {
        return {
          status: BiometricAuthStatus.NOT_ENROLLED,
          confidence: 0,
          biometricType,
          userId,
          transactionId,
          timestamp: new Date().toISOString(),
          error: 'User not enrolled for biometric authentication'
        };
      }

      const challenge = this.generateChallenge();
      
      const credentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: storedCredentials.map(cred => ({
          type: 'public-key',
          id: this.base64ToArrayBuffer(cred.credentialId),
          transports: ['internal', 'usb', 'nfc', 'ble'],
        })),
        userVerification: 'required',
        timeout: this.config.timeout,
      };

      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        return {
          status: BiometricAuthStatus.FAILED,
          confidence: 0,
          biometricType,
          userId,
          transactionId,
          timestamp: new Date().toISOString(),
          error: 'Authentication failed'
        };
      }

      // Verify authentication with server
      const verificationResult = await this.verifyAuthenticationWithServer({
        userId,
        credentialId: this.arrayBufferToBase64(credential.rawId),
        response: credential.response,
        challenge,
        transactionId
      });

      return {
        status: verificationResult.success ? BiometricAuthStatus.SUCCESS : BiometricAuthStatus.FAILED,
        confidence: verificationResult.confidence || 0.9,
        biometricType,
        userId,
        transactionId,
        timestamp: new Date().toISOString(),
        error: verificationResult.error
      };

    } catch (error: any) {
      return {
        status: BiometricAuthStatus.ERROR,
        confidence: 0,
        biometricType,
        userId,
        transactionId,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Get authenticator attachment based on biometric type
  private getAuthenticatorAttachment(biometricType: BiometricType): AuthenticatorAttachment | undefined {
    switch (biometricType) {
      case BiometricType.FINGERPRINT:
      case BiometricType.FACIAL:
        return 'platform';
      case BiometricType.SIGNATURE:
        return 'cross-platform';
      default:
        return undefined;
    }
  }

  // Generate random challenge
  private generateChallenge(): ArrayBuffer {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array.buffer;
  }

  // Convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert Base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Send enrollment data to server
  private async sendEnrollmentToServer(data: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/biometric/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return {
        success: result.success,
        error: result.error
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user credentials from server
  private async getUserCredentials(userId: string, biometricType: BiometricType): Promise<Array<{
    credentialId: string;
    publicKey: string;
  }> | null> {
    try {
      const response = await fetch(`/api/biometric/credentials?userId=${userId}&type=${biometricType}`);
      const result = await response.json();
      return result.success ? result.credentials : null;

    } catch (error) {
      return null;
    }
  }

  // Verify authentication with server
  private async verifyAuthenticationWithServer(data: any): Promise<{
    success: boolean;
    confidence?: number;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/biometric/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return {
        success: result.success,
        confidence: result.confidence,
        error: result.error
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Mobile biometric authentication service
export class MobileBiometricService {
  private config: BiometricAuthConfig;

  constructor(config: BiometricAuthConfig) {
    this.config = config;
  }

  // Check if mobile biometric is available
  async isAvailable(): Promise<{
    available: boolean;
    supportedTypes: BiometricType[];
    error?: string;
  }> {
    try {
      // Check for mobile biometric APIs
      const supportedTypes: BiometricType[] = [];

      // Check for Touch ID / Face ID (iOS)
      if (typeof window !== 'undefined' && 'TouchEvent' in window) {
        supportedTypes.push(BiometricType.FINGERPRINT);
      }

      // Check for Android fingerprint
      if (typeof window !== 'undefined' && 'navigator' in window) {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android')) {
          supportedTypes.push(BiometricType.FINGERPRINT);
        }
      }

      // Check for facial recognition
      if (typeof window !== 'undefined' && 'MediaDevices' in navigator) {
        supportedTypes.push(BiometricType.FACIAL);
      }

      return {
        available: supportedTypes.length > 0,
        supportedTypes
      };

    } catch (error: any) {
      return {
        available: false,
        supportedTypes: [],
        error: error.message
      };
    }
  }

  // Enroll mobile biometric
  async enrollMobileBiometric(
    userId: string,
    biometricType: BiometricType
  ): Promise<{
    success: boolean;
    enrollmentId?: string;
    error?: string;
  }> {
    try {
      // Create enrollment request
      const enrollmentData = {
        userId,
        biometricType,
        deviceInfo: await this.getDeviceInfo(),
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/biometric/mobile-enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentData)
      });

      const result = await response.json();
      return {
        success: result.success,
        enrollmentId: result.enrollmentId,
        error: result.error
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Authenticate with mobile biometric
  async authenticateMobileBiometric(
    userId: string,
    biometricType: BiometricType,
    transactionId: string
  ): Promise<BiometricAuthResult> {
    try {
      // Trigger mobile biometric authentication
      const authData = {
        userId,
        biometricType,
        transactionId,
        deviceInfo: await this.getDeviceInfo(),
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/biometric/mobile-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData)
      });

      const result = await response.json();

      return {
        status: result.success ? BiometricAuthStatus.SUCCESS : BiometricAuthStatus.FAILED,
        confidence: result.confidence || 0.9,
        biometricType,
        userId,
        transactionId,
        timestamp: new Date().toISOString(),
        error: result.error
      };

    } catch (error: any) {
      return {
        status: BiometricAuthStatus.ERROR,
        confidence: 0,
        biometricType,
        userId,
        transactionId,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Get device information
  private async getDeviceInfo(): Promise<{
    userAgent: string;
    platform: string;
    language: string;
    timezone: string;
    screenResolution: string;
  }> {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`
    };
  }
}

// Voice biometric authentication service
export class VoiceBiometricService {
  private config: BiometricAuthConfig;

  constructor(config: BiometricAuthConfig) {
    this.config = config;
  }

  // Enroll voice biometric
  async enrollVoiceBiometric(
    userId: string,
    passphrase: string
  ): Promise<{
    success: boolean;
    voiceTemplate?: string;
    error?: string;
  }> {
    try {
      // Record voice sample
      const voiceSample = await this.recordVoiceSample(passphrase);
      
      if (!voiceSample) {
        return {
          success: false,
          error: 'Failed to record voice sample'
        };
      }

      // Process voice sample and create template
      const voiceTemplate = await this.processVoiceSample(voiceSample);
      
      // Store template on server
      const response = await fetch('/api/biometric/voice-enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          voiceTemplate,
          passphrase,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      return {
        success: result.success,
        voiceTemplate,
        error: result.error
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Authenticate with voice biometric
  async authenticateVoiceBiometric(
    userId: string,
    passphrase: string,
    transactionId: string
  ): Promise<BiometricAuthResult> {
    try {
      // Record voice sample for authentication
      const voiceSample = await this.recordVoiceSample(passphrase);
      
      if (!voiceSample) {
        return {
          status: BiometricAuthStatus.FAILED,
          confidence: 0,
          biometricType: BiometricType.VOICE,
          userId,
          transactionId,
          timestamp: new Date().toISOString(),
          error: 'Failed to record voice sample'
        };
      }

      // Send for verification
      const response = await fetch('/api/biometric/voice-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          voiceSample,
          passphrase,
          transactionId,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      return {
        status: result.success ? BiometricAuthStatus.SUCCESS : BiometricAuthStatus.FAILED,
        confidence: result.confidence || 0.8,
        biometricType: BiometricType.VOICE,
        userId,
        transactionId,
        timestamp: new Date().toISOString(),
        error: result.error
      };

    } catch (error: any) {
      return {
        status: BiometricAuthStatus.ERROR,
        confidence: 0,
        biometricType: BiometricType.VOICE,
        userId,
        transactionId,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // Record voice sample
  private async recordVoiceSample(passphrase: string): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          resolve(blob);
        };

        mediaRecorder.start();
        
        // Stop recording after 5 seconds
        setTimeout(() => {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }, 5000);
      });

    } catch (error) {
      console.error('Voice recording error:', error);
      return null;
    }
  }

  // Process voice sample (mock implementation)
  private async processVoiceSample(voiceSample: Blob): Promise<string> {
    // In a real implementation, you would use voice processing algorithms
    // to extract voice characteristics and create a template
    return 'voice_template_' + Date.now();
  }
}

// Main biometric authentication manager
export class BiometricAuthManager {
  private config: BiometricAuthConfig;
  private webAuthnService: WebAuthnBiometricService;
  private mobileBiometricService: MobileBiometricService;
  private voiceBiometricService: VoiceBiometricService;

  constructor(config: BiometricAuthConfig) {
    this.config = config;
    this.webAuthnService = new WebAuthnBiometricService(config);
    this.mobileBiometricService = new MobileBiometricService(config);
    this.voiceBiometricService = new VoiceBiometricService(config);
  }

  // Get available biometric types
  async getAvailableBiometricTypes(): Promise<BiometricType[]> {
    const availableTypes: BiometricType[] = [];

    // Check WebAuthn support
    const webAuthnSupport = await this.webAuthnService.isSupported();
    if (webAuthnSupport.supported) {
      availableTypes.push(...webAuthnSupport.availableTypes);
    }

    // Check mobile biometric support
    const mobileSupport = await this.mobileBiometricService.isAvailable();
    if (mobileSupport.available) {
      availableTypes.push(...mobileSupport.supportedTypes);
    }

    // Voice biometric is always available if microphone access is granted
    availableTypes.push(BiometricType.VOICE);

    return [...new Set(availableTypes)]; // Remove duplicates
  }

  // Enroll user for biometric authentication
  async enrollUser(
    userId: string,
    biometricType: BiometricType,
    displayName?: string
  ): Promise<{
    success: boolean;
    enrollmentId?: string;
    error?: string;
  }> {
    switch (biometricType) {
      case BiometricType.FINGERPRINT:
      case BiometricType.FACIAL:
        return await this.webAuthnService.enrollUser(userId, biometricType, displayName);
      
      case BiometricType.VOICE:
        return await this.voiceBiometricService.enrollVoiceBiometric(userId, 'Please say: Bell24h authentication');
      
      default:
        return {
          success: false,
          error: `Biometric type ${biometricType} not supported`
        };
    }
  }

  // Authenticate user with biometric
  async authenticateUser(
    userId: string,
    biometricType: BiometricType,
    transactionId: string,
    passphrase?: string
  ): Promise<BiometricAuthResult> {
    switch (biometricType) {
      case BiometricType.FINGERPRINT:
      case BiometricType.FACIAL:
        return await this.webAuthnService.authenticateUser(userId, biometricType, transactionId);
      
      case BiometricType.VOICE:
        return await this.voiceBiometricService.authenticateVoiceBiometric(
          userId, 
          passphrase || 'Please say: Bell24h authentication',
          transactionId
        );
      
      default:
        return {
          status: BiometricAuthStatus.NOT_AVAILABLE,
          confidence: 0,
          biometricType,
          userId,
          transactionId,
          timestamp: new Date().toISOString(),
          error: `Biometric type ${biometricType} not supported`
        };
    }
  }

  // Multi-factor biometric authentication
  async multiFactorBiometricAuth(
    userId: string,
    requiredTypes: BiometricType[],
    transactionId: string
  ): Promise<{
    success: boolean;
    results: BiometricAuthResult[];
    overallConfidence: number;
    error?: string;
  }> {
    const results: BiometricAuthResult[] = [];
    let successfulAuths = 0;
    let totalConfidence = 0;

    for (const biometricType of requiredTypes) {
      const result = await this.authenticateUser(userId, biometricType, transactionId);
      results.push(result);

      if (result.status === BiometricAuthStatus.SUCCESS) {
        successfulAuths++;
        totalConfidence += result.confidence;
      }
    }

    const overallConfidence = successfulAuths > 0 ? totalConfidence / successfulAuths : 0;
    const success = successfulAuths === requiredTypes.length && overallConfidence >= this.config.minConfidence;

    return {
      success,
      results,
      overallConfidence,
      error: success ? undefined : 'Multi-factor authentication failed'
    };
  }

  // Check if user is enrolled for specific biometric type
  async isUserEnrolled(userId: string, biometricType: BiometricType): Promise<boolean> {
    try {
      const response = await fetch(`/api/biometric/check-enrollment?userId=${userId}&type=${biometricType}`);
      const result = await response.json();
      return result.enrolled;

    } catch (error) {
      return false;
    }
  }

  // Get user's enrolled biometric types
  async getUserEnrolledTypes(userId: string): Promise<BiometricType[]> {
    try {
      const response = await fetch(`/api/biometric/user-types?userId=${userId}`);
      const result = await response.json();
      return result.success ? result.types : [];

    } catch (error) {
      return [];
    }
  }
}

// Default biometric configuration
export const defaultBiometricConfig: BiometricAuthConfig = {
  enabledTypes: [
    BiometricType.FINGERPRINT,
    BiometricType.FACIAL,
    BiometricType.VOICE
  ],
  requiredTypes: [BiometricType.FINGERPRINT], // At least fingerprint required
  minConfidence: 0.8,
  maxAttempts: 3,
  timeout: 30000, // 30 seconds
  fallbackToPIN: true,
  encryptionKey: process.env.BIOMETRIC_ENCRYPTION_KEY || 'default_key_change_in_production',
  allowMultipleDevices: true
};

// Export biometric types and status
export { BiometricType, BiometricAuthStatus };
