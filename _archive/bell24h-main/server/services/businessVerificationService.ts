import axios from 'axios';

interface BusinessVerificationResult {
  verified: boolean;
  score: number;
  details: {
    addressMatch: boolean;
    registryMatch: boolean;
    taxIdValid: boolean;
    locationConfirmed: boolean;
  };
  message: string;
}

export const verifyBusiness = async (
  businessName: string,
  taxId: string,
  address: string,
  country: string,
  region: string
): Promise<BusinessVerificationResult> => {
  try {
    // Step 1: Validate address using Google Maps API
    const addressValid = await validateAddress(address, country);
    
    // Step 2: Check business registry based on region/country
    const registryResult = await checkBusinessRegistry(businessName, taxId, country, region);
    
    // Step 3: Calculate verification score
    const score = calculateVerificationScore(addressValid, registryResult);
    
    // Step 4: Return verification result
    return {
      verified: score >= 70, // Threshold for verification
      score,
      details: {
        addressMatch: addressValid,
        registryMatch: registryResult.registryMatch,
        taxIdValid: registryResult.taxIdValid,
        locationConfirmed: registryResult.locationConfirmed
      },
      message: getVerificationMessage(score)
    };
  } catch (error) {
    console.error('Business verification failed:', error);
    return {
      verified: false,
      score: 0,
      details: {
        addressMatch: false,
        registryMatch: false,
        taxIdValid: false,
        locationConfirmed: false
      },
      message: 'Verification failed due to technical error. Please try again later.'
    };
  }
};

// Helper functions
async function validateAddress(address: string, country: string): Promise<boolean> {
  // In production, use Google Maps API or similar
  // For now, simple validation
  return address.length > 10 && country.length > 0;
}

async function checkBusinessRegistry(
  businessName: string,
  taxId: string,
  country: string,
  region: string
): Promise<{
  registryMatch: boolean;
  taxIdValid: boolean;
  locationConfirmed: boolean;
}> {
  // In production, integrate with local business registry APIs
  // For now, simulate verification
  const taxIdRegex = /^[A-Z0-9]{8,15}$/;
  
  return {
    registryMatch: businessName.length > 3,
    taxIdValid: taxIdRegex.test(taxId),
    locationConfirmed: country.length > 0 && region.length > 0
  };
}

function calculateVerificationScore(
  addressValid: boolean,
  registryResult: {
    registryMatch: boolean;
    taxIdValid: boolean;
    locationConfirmed: boolean;
  }
): number {
  let score = 0;
  
  // Address validation (30 points)
  if (addressValid) score += 30;
  
  // Registry checks (70 points total)
  if (registryResult.registryMatch) score += 25;
  if (registryResult.taxIdValid) score += 25;
  if (registryResult.locationConfirmed) score += 20;
  
  return score;
}

function getVerificationMessage(score: number): string {
  if (score >= 90) return 'Business fully verified with high confidence.';
  if (score >= 70) return 'Business verified.';
  if (score >= 50) return 'Business partially verified. Additional documentation may be required.';
  return 'Business verification failed. Please check your information and try again.';
}
