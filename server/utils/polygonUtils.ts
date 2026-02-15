/**
 * Bell24H Polygon Blockchain Utilities
 * 
 * Provides functions for interacting with the BusinessVerification smart contract
 * on Polygon Mumbai Testnet.
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

// Type definitions
interface DeploymentInfo {
  contractAddress: string;
  deploymentTimestamp: string;
  network: string;
  transactionHash: string;
  verificationFee: string;
}

interface CredentialSubmission {
  businessAddress: string;
  credentialHash: string;
  credentialType: number;
  metadataURI: string;
  success: boolean;
  transactionHash?: string;
  error?: string;
}

interface VerificationResult {
  businessAddress: string;
  credentialHash: string;
  status: number; // 0=NotVerified, 1=Pending, 2=Verified, 3=Rejected
  statusText: string;
  timestamp?: number;
  verifier?: string;
  metadataURI?: string;
}

// ABI for BusinessVerification contract (minimal ABI with just the functions we need)
const businessVerificationABI = [
  "function submitCredential(bytes32 credentialHash, uint8 credType, string metadataURI) external payable",
  "function verifyCredential(address business, bytes32 credentialHash) external",
  "function rejectCredential(address business, bytes32 credentialHash) external",
  "function getVerificationStatus(address business, bytes32 credentialHash) external view returns (uint8)",
  "function getCredential(address business, bytes32 credentialHash) external view returns (bytes32, uint8, uint8, uint256, address, string memory)",
  "function getBusinessCredentials(address business) external view returns (bytes32[] memory)",
  "function getVerificationFee() external view returns (uint256)",
  "event CredentialSubmitted(address indexed business, bytes32 indexed credentialHash, uint8 credType)"
];

// Status text mapping
const statusTextMap = [
  "Not Verified",
  "Pending",
  "Verified",
  "Rejected"
];

// Credential types
export enum CredentialType {
  GSTIN = 0,
  PAN = 1,
  BusinessLicense = 2,
  TradeLicense = 3,
  ImportExport = 4,
  Other = 5
}

/**
 * Initialize provider and contract instance
 * @returns Provider and contract instance
 */
export const initPolygonConnection = async () => {
  try {
    // Environment variables
    const rpcUrl = process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com/';
    const privateKey = process.env.PRIVATE_KEY;
    
    // Read deployment info if available
    let contractAddress = process.env.BUSINESS_VERIFICATION_ADDRESS;
    if (!contractAddress) {
      try {
        const deploymentPath = path.join(__dirname, '../../deployments/BusinessVerification.json');
        if (fs.existsSync(deploymentPath)) {
          const deploymentInfo: DeploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
          contractAddress = deploymentInfo.contractAddress;
        }
      } catch (error) {
        console.error('Failed to read deployment info:', error);
      }
    }
    
    // Make sure we have a contract address
    if (!contractAddress) {
      throw new Error('Contract address not found. Please deploy the contract first or set BUSINESS_VERIFICATION_ADDRESS in environment variables.');
    }
    
    // Create provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    // If privateKey is provided, create a signer, otherwise use a read-only provider
    let contract;
    if (privateKey) {
      const wallet = new ethers.Wallet(privateKey, provider);
      contract = new ethers.Contract(contractAddress, businessVerificationABI, wallet);
    } else {
      contract = new ethers.Contract(contractAddress, businessVerificationABI, provider);
    }
    
    return {
      provider,
      contract,
      contractAddress
    };
  } catch (error) {
    console.error('Failed to initialize Polygon connection:', error);
    throw error;
  }
};

/**
 * Create a hash for a credential
 * @param credential The credential string (e.g. GSTIN number)
 * @returns Bytes32 hash of the credential
 */
export const hashCredential = (credential: string): string => {
  // Remove spaces and convert to lowercase
  const cleanCredential = credential.replace(/\s+/g, '').toLowerCase();
  
  // Create keccak256 hash (Ethereum standard)
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(cleanCredential));
  
  return hash;
};

/**
 * Submit a credential for verification
 * @param credential The credential string (e.g. GSTIN number)
 * @param credentialType The type of credential
 * @param businessAddress The Ethereum address of the business
 * @param metadataURI URI pointing to additional metadata (can be IPFS URI)
 * @returns Result of submission
 */
export const submitCredentialForVerification = async (
  credential: string,
  credentialType: CredentialType,
  businessAddress: string,
  metadataURI: string = ''
): Promise<CredentialSubmission> => {
  try {
    const { contract } = await initPolygonConnection();
    
    // Hash the credential
    const credentialHash = hashCredential(credential);
    
    // Get verification fee
    const fee = await contract.getVerificationFee();
    
    // Submit credential
    const tx = await contract.submitCredential(
      credentialHash,
      credentialType,
      metadataURI,
      { value: fee }
    );
    
    // Wait for transaction confirmation
    await tx.wait();
    
    return {
      businessAddress,
      credentialHash,
      credentialType,
      metadataURI,
      success: true,
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error('Failed to submit credential for verification:', error);
    
    return {
      businessAddress,
      credentialHash: hashCredential(credential),
      credentialType,
      metadataURI,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Check verification status of a credential
 * @param credential The credential string (e.g. GSTIN number)
 * @param businessAddress The Ethereum address of the business
 * @returns Verification status
 */
export const checkVerificationStatus = async (
  credential: string,
  businessAddress: string
): Promise<VerificationResult> => {
  try {
    const { contract } = await initPolygonConnection();
    
    // Hash the credential
    const credentialHash = hashCredential(credential);
    
    // Get verification status
    const status = await contract.getVerificationStatus(businessAddress, credentialHash);
    
    const result: VerificationResult = {
      businessAddress,
      credentialHash,
      status,
      statusText: statusTextMap[status] || 'Unknown'
    };
    
    // If credential exists and is not just "NotVerified", get full details
    if (status > 0) {
      try {
        const [_, credType, __, timestamp, verifier, metadataURI] = await contract.getCredential(
          businessAddress,
          credentialHash
        );
        
        result.timestamp = timestamp.toNumber();
        result.verifier = verifier;
        result.metadataURI = metadataURI;
      } catch (error) {
        // If getCredential fails, continue with basic status info
        console.error('Failed to get credential details:', error);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Failed to check verification status:', error);
    
    return {
      businessAddress,
      credentialHash: hashCredential(credential),
      status: 0, // NotVerified
      statusText: 'Error',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Get all credentials for a business
 * @param businessAddress The Ethereum address of the business
 * @returns Array of credential hashes
 */
export const getBusinessCredentials = async (
  businessAddress: string
): Promise<string[]> => {
  try {
    const { contract } = await initPolygonConnection();
    
    // Get credential hashes
    const hashes = await contract.getBusinessCredentials(businessAddress);
    
    return hashes;
  } catch (error) {
    console.error('Failed to get business credentials:', error);
    return [];
  }
};

/**
 * Verify a credential (admin only)
 * @param credentialHash The hash of the credential
 * @param businessAddress The Ethereum address of the business
 * @returns Success status and transaction hash
 */
export const verifyCredential = async (
  credentialHash: string,
  businessAddress: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> => {
  try {
    const { contract } = await initPolygonConnection();
    
    // Verify credential
    const tx = await contract.verifyCredential(businessAddress, credentialHash);
    
    // Wait for transaction confirmation
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error('Failed to verify credential:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Reject a credential (admin only)
 * @param credentialHash The hash of the credential
 * @param businessAddress The Ethereum address of the business
 * @returns Success status and transaction hash
 */
export const rejectCredential = async (
  credentialHash: string,
  businessAddress: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> => {
  try {
    const { contract } = await initPolygonConnection();
    
    // Reject credential
    const tx = await contract.rejectCredential(businessAddress, credentialHash);
    
    // Wait for transaction confirmation
    await tx.wait();
    
    return {
      success: true,
      transactionHash: tx.hash
    };
  } catch (error) {
    console.error('Failed to reject credential:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Get the verification fee
 * @returns Current verification fee in wei
 */
export const getVerificationFee = async (): Promise<string> => {
  try {
    const { contract } = await initPolygonConnection();
    
    // Get fee
    const fee = await contract.getVerificationFee();
    
    return fee.toString();
  } catch (error) {
    console.error('Failed to get verification fee:', error);
    throw error;
  }
};
