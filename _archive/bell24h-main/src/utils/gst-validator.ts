// GST Number Validation for Indian Businesses
// Format: 2 digits (State Code) + 10 digits (PAN) + 1 digit (Entity Code) + 1 digit (Check Sum)

export interface GSTValidationResult {
  isValid: boolean;
  message: string;
  stateCode?: string;
  stateName?: string;
  panNumber?: string;
  entityCode?: string;
  checkSum?: string;
}

// Indian State Codes and Names
const STATE_CODES: { [key: string]: string } = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction'
};

// Entity Types
const ENTITY_TYPES: { [key: string]: string } = {
  '1': 'Regular Taxpayer',
  '2': 'Composition Taxpayer',
  '3': 'Unregistered Person',
  '4': 'Consumer',
  '5': 'Overseas',
  '6': 'SEZ Unit',
  '7': 'SEZ Developer',
  '8': 'Deemed Export',
  '9': 'UIN Holder',
  '0': 'GST Practitioner'
};

export function validateGSTNumber(gstNumber: string): GSTValidationResult {
  // Remove spaces and convert to uppercase
  const cleanGST = gstNumber.replace(/\s/g, '').toUpperCase();

  // Basic format check
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGST)) {
    return {
      isValid: false,
      message: 'Invalid GST number format. Expected format: 22AAAAA0000A1Z5'
    };
  }

  // Extract components
  const stateCode = cleanGST.substring(0, 2);
  const panNumber = cleanGST.substring(2, 12);
  const entityCode = cleanGST.substring(12, 13);
  const checkSum = cleanGST.substring(13, 14);

  // Validate state code
  if (!STATE_CODES[stateCode]) {
    return {
      isValid: false,
      message: `Invalid state code: ${stateCode}`
    };
  }

  // Validate PAN format
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    return {
      isValid: false,
      message: 'Invalid PAN number format in GST'
    };
  }

  // Validate entity code
  if (!ENTITY_TYPES[entityCode]) {
    return {
      isValid: false,
      message: `Invalid entity code: ${entityCode}`
    };
  }

  // Validate check sum (simplified validation)
  const expectedCheckSum = calculateCheckSum(cleanGST.substring(0, 13));
  if (checkSum !== expectedCheckSum) {
    return {
      isValid: false,
      message: 'Invalid check sum in GST number'
    };
  }

  return {
    isValid: true,
    message: 'Valid GST number',
    stateCode,
    stateName: STATE_CODES[stateCode],
    panNumber,
    entityCode,
    checkSum,
    entityType: ENTITY_TYPES[entityCode]
  };
}

function calculateCheckSum(gstWithoutCheckSum: string): string {
  // Simplified check sum calculation
  // In real implementation, this would follow the official GST algorithm
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    const char = gstWithoutCheckSum[i];
    const value = char >= '0' && char <= '9' ? parseInt(char) : char.charCodeAt(0) - 55;
    sum += value * weights[i];
  }
  
  const remainder = sum % 36;
  return remainder < 10 ? remainder.toString() : String.fromCharCode(remainder + 55);
}

export function formatGSTNumber(gstNumber: string): string {
  const cleanGST = gstNumber.replace(/\s/g, '').toUpperCase();
  
  if (cleanGST.length !== 15) {
    return gstNumber; // Return original if invalid length
  }
  
  // Format: XX XXXX XXXX X X Z X
  return `${cleanGST.substring(0, 2)} ${cleanGST.substring(2, 6)} ${cleanGST.substring(6, 10)} ${cleanGST.substring(10, 11)} ${cleanGST.substring(11, 12)} ${cleanGST.substring(12, 13)} ${cleanGST.substring(13, 14)} ${cleanGST.substring(14, 15)}`;
}

export function getGSTStateInfo(stateCode: string): { name: string; code: string } | null {
  const stateName = STATE_CODES[stateCode];
  return stateName ? { name: stateName, code: stateCode } : null;
}

export function getEntityTypeInfo(entityCode: string): { type: string; code: string } | null {
  const entityType = ENTITY_TYPES[entityCode];
  return entityType ? { type: entityType, code: entityCode } : null;
} 
