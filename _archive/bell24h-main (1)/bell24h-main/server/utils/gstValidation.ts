/**
 * Bell24H GST Validation Utility with Blockchain Verification
 * 
 * This module provides functions for validating GSTIN numbers and
 * verifying them on the Polygon Mumbai Testnet blockchain.
 */

import axios from 'axios';
import { hashCredential, submitCredentialForVerification, checkVerificationStatus, CredentialType } from './polygonUtils';

// Define GSTIN validation result interface
export interface GSTINValidationResult {
  gstin: string;
  valid: boolean;
  reason?: string;
  gstData?: {
    tradeName?: string;
    legalName?: string;
    address?: string;
    status?: string;
    lastUpdated?: string;
  };
  blockchainVerification?: {
    verified: boolean;
    status: string;
    timestamp?: number;
    transactionHash?: string;
  };
}

/**
 * Validate GSTIN format using regex pattern
 * @param gstin The GSTIN number to validate
 * @returns Whether the GSTIN format is valid
 */
const isValidGSTINFormat = (gstin: string): boolean => {
  // GSTIN format: 2 digits for state code + 10 chars PAN + 1 entity number + 1 check digit + Z for composition levy
  const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z?$/;
  
  return gstinPattern.test(gstin);
};

/**
 * Calculate GSTIN checksum to verify its authenticity
 * @param gstin The GSTIN number to validate
 * @returns Whether the checksum is valid
 */
const isValidGSTINChecksum = (gstin: string): boolean => {
  if (gstin.length < 15) return false;
  
  const checksumChar = gstin.charAt(14);
  const gstinWithoutChecksum = gstin.substring(0, 14);
  
  // Factor values for each position
  const factor = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  
  // Character set for GSTIN
  const charSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Calculate checksum
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const charIndex = charSet.indexOf(gstinWithoutChecksum.charAt(i));
    sum += factor[i] * (charIndex >= 0 ? charIndex : 0);
  }
  
  // Calculate check digit
  const remainder = sum % 36;
  const checkDigit = charSet.charAt((36 - remainder) % 36);
  
  // Compare with the actual check digit
  return checksumChar === checkDigit;
};

/**
 * Validate GSTIN using both format check and checksum
 * @param gstin The GSTIN number to validate
 * @returns Validation result with reason
 */
export const validateGSTIN = (gstin: string): { valid: boolean; reason?: string } => {
  // Normalize: remove spaces and convert to uppercase
  gstin = gstin.replace(/\s+/g, '').toUpperCase();
  
  // Check format
  if (!isValidGSTINFormat(gstin)) {
    return { valid: false, reason: 'Invalid GSTIN format' };
  }
  
  // Check checksum
  if (!isValidGSTINChecksum(gstin)) {
    return { valid: false, reason: 'Invalid GSTIN checksum' };
  }
  
  return { valid: true };
};

/**
 * Fetch GSTIN details from external API (if available)
 * @param gstin The GSTIN number
 * @returns GSTIN data or null if not found
 */
export const fetchGSTINDetails = async (
  gstin: string
): Promise<GSTINValidationResult['gstData'] | null> => {
  try {
    // Normalize: remove spaces and convert to uppercase
    gstin = gstin.replace(/\s+/g, '').toUpperCase();
    
    // Check if GST API key is available
    const apiKey = process.env.GST_API_KEY;
    if (!apiKey) {
      console.warn('GST_API_KEY not set. Using mock data for GSTIN validation.');
      
      // Return mock data for testing without actual API
      return {
        tradeName: `Mock Business for ${gstin}`,
        legalName: `Mock Legal Entity for ${gstin}`,
        address: 'Mock Address, Test City, India',
        status: 'Active',
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Real API call (replace with actual GST verification API)
    const response = await axios.get(`https://gst-api.example.com/v1/search?gstin=${gstin}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.data && response.data.success) {
      return {
        tradeName: response.data.tradeName,
        legalName: response.data.legalName,
        address: response.data.address,
        status: response.data.status,
        lastUpdated: response.data.lastUpdated
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch GSTIN details:', error);
    return null;
  }
};

/**
 * Validate GSTIN and fetch details
 * @param gstin The GSTIN number to validate
 * @returns Validation result with details
 */
export const validateAndFetchGSTIN = async (
  gstin: string
): Promise<GSTINValidationResult> => {
  // Normalize: remove spaces and convert to uppercase
  gstin = gstin.replace(/\s+/g, '').toUpperCase();
  
  // Validate format
  const { valid, reason } = validateGSTIN(gstin);
  
  const result: GSTINValidationResult = {
    gstin,
    valid,
    reason: valid ? undefined : reason
  };
  
  // If valid, fetch details
  if (valid) {
    result.gstData = await fetchGSTINDetails(gstin);
    
    // If details couldn't be fetched but format is valid, still mark as valid
    if (!result.gstData) {
      result.reason = 'GSTIN format is valid, but details could not be fetched';
    }
  }
  
  return result;
};

/**
 * Submit GSTIN for blockchain verification
 * @param gstin The GSTIN number
 * @param businessAddress The Ethereum address of the business
 * @param metadataURI Optional URI for additional metadata
 * @returns Submission result
 */
export const submitGSTINForBlockchainVerification = async (
  gstin: string,
  businessAddress: string,
  metadataURI: string = ''
): Promise<{ success: boolean; transactionHash?: string; error?: string }> => {
  try {
    // Normalize: remove spaces and convert to uppercase
    gstin = gstin.replace(/\s+/g, '').toUpperCase();
    
    // Validate GSTIN first
    const { valid, reason } = validateGSTIN(gstin);
    if (!valid) {
      return {
        success: false,
        error: reason || 'Invalid GSTIN format'
      };
    }
    
    // Submit to blockchain
    const submission = await submitCredentialForVerification(
      gstin,
      CredentialType.GSTIN,
      businessAddress,
      metadataURI
    );
    
    if (submission.success) {
      return {
        success: true,
        transactionHash: submission.transactionHash
      };
    } else {
      return {
        success: false,
        error: submission.error || 'Failed to submit GSTIN for blockchain verification'
      };
    }
  } catch (error) {
    console.error('Failed to submit GSTIN for blockchain verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Check GSTIN blockchain verification status
 * @param gstin The GSTIN number
 * @param businessAddress The Ethereum address of the business
 * @returns Verification status
 */
export const checkGSTINBlockchainVerification = async (
  gstin: string,
  businessAddress: string
): Promise<GSTINValidationResult['blockchainVerification']> => {
  try {
    // Normalize: remove spaces and convert to uppercase
    gstin = gstin.replace(/\s+/g, '').toUpperCase();
    
    // Check blockchain verification status
    const verificationResult = await checkVerificationStatus(gstin, businessAddress);
    
    return {
      verified: verificationResult.status === 2, // 2 = Verified
      status: verificationResult.statusText,
      timestamp: verificationResult.timestamp
    };
  } catch (error) {
    console.error('Failed to check GSTIN blockchain verification:', error);
    return {
      verified: false,
      status: 'Error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Complete GSTIN validation with blockchain verification
 * @param gstin The GSTIN number
 * @param businessAddress The Ethereum address of the business
 * @returns Complete validation result
 */
export const validateGSTINWithBlockchain = async (
  gstin: string,
  businessAddress: string
): Promise<GSTINValidationResult> => {
  // Perform regular validation with details
  const validationResult = await validateAndFetchGSTIN(gstin);
  
  // Check blockchain verification status
  validationResult.blockchainVerification = await checkGSTINBlockchainVerification(
    gstin,
    businessAddress
  );
  
  return validationResult;
};
