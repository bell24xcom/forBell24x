import { z } from 'zod';

// GST Compliance Configuration
export const GST_CONFIG = {
  // GST rates for different categories
  rates: {
    '0': 0, // Zero-rated goods
    '5': 5, // 5% GST
    '12': 12, // 12% GST
    '18': 18, // 18% GST
    '28': 28, // 28% GST
  },

  // GST categories and their rates
  categories: {
    agriculture: '0',
    books: '0',
    food_grains: '0',
    milk: '0',
    fruits: '0',
    vegetables: '0',
    textiles: '5',
    footwear: '5',
    coal: '5',
    fertilizers: '5',
    medicines: '12',
    computers: '18',
    electronics: '18',
    automobiles: '28',
    luxury_items: '28',
    tobacco: '28',
    alcohol: '28',
  },

  // GST number validation
  gstValidation: {
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    stateCodes: {
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
    },
  },

  // Invoice requirements
  invoice: {
    requiredFields: [
      'invoiceNumber',
      'invoiceDate',
      'supplierGST',
      'buyerGST',
      'itemDescription',
      'quantity',
      'unitPrice',
      'gstRate',
      'cgst',
      'sgst',
      'igst',
      'totalAmount',
    ],
    format: {
      invoiceNumber: /^INV-\d{4}-\d{6}$/,
      dateFormat: 'YYYY-MM-DD',
    },
  },
};

// GST Number Validation Schema
export const gstNumberSchema = z
  .string()
  .regex(GST_CONFIG.gstValidation.pattern, 'Invalid GST number format')
  .refine(gst => {
    const stateCode = gst.substring(0, 2);
    return Object.keys(GST_CONFIG.gstValidation.stateCodes).includes(stateCode);
  }, 'Invalid state code in GST number');

// GST Invoice Schema
export const gstInvoiceSchema = z.object({
  invoiceNumber: z
    .string()
    .regex(GST_CONFIG.invoice.format.invoiceNumber, 'Invalid invoice number format'),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  supplierGST: gstNumberSchema,
  buyerGST: gstNumberSchema.optional(),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'Item description is required'),
        quantity: z.number().positive('Quantity must be positive'),
        unitPrice: z.number().positive('Unit price must be positive'),
        gstRate: z.enum(['0', '5', '12', '18', '28']),
        category: z.string().optional(),
      })
    )
    .min(1, 'At least one item is required'),
  placeOfSupply: z.string().min(1, 'Place of supply is required'),
  reverseCharge: z.boolean().default(false),
  export: z.boolean().default(false),
});

// GST Calculation Functions
export function calculateGST(
  amount: number,
  rate: number
): {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
} {
  const gstAmount = (amount * rate) / 100;

  // Determine if IGST or CGST+SGST applies
  // For now, assuming IGST for inter-state transactions
  const isInterState = true; // This should be determined by supplier and buyer state

  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: amount + gstAmount,
    };
  } else {
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    return {
      cgst,
      sgst,
      igst: 0,
      total: amount + gstAmount,
    };
  }
}

export function validateGSTNumber(gstNumber: string): {
  isValid: boolean;
  errors: string[];
  stateCode?: string;
  stateName?: string;
} {
  const errors: string[] = [];

  // Check format
  if (!GST_CONFIG.gstValidation.pattern.test(gstNumber)) {
    errors.push('Invalid GST number format');
  }

  // Check state code
  const stateCode = gstNumber.substring(0, 2);
  const stateName = GST_CONFIG.gstValidation.stateCodes[stateCode];

  if (!stateName) {
    errors.push('Invalid state code in GST number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    stateCode: stateName ? stateCode : undefined,
    stateName,
  };
}

export function generateGSTInvoice(data: z.infer<typeof gstInvoiceSchema>): {
  invoice: any;
  calculations: any;
  compliance: any;
} {
  const calculations = {
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: 0,
    items: [] as any[],
  };

  // Calculate for each item
  data.items.forEach((item, index) => {
    const rate = parseInt(item.gstRate);
    const itemTotal = item.quantity * item.unitPrice;
    const gstCalculation = calculateGST(itemTotal, rate);

    calculations.subtotal += itemTotal;
    calculations.cgst += gstCalculation.cgst;
    calculations.sgst += gstCalculation.sgst;
    calculations.igst += gstCalculation.igst;

    calculations.items.push({
      ...item,
      total: itemTotal,
      gstAmount: gstCalculation.cgst + gstCalculation.sgst + gstCalculation.igst,
      ...gstCalculation,
    });
  });

  calculations.total =
    calculations.subtotal + calculations.cgst + calculations.sgst + calculations.igst;

  // Generate invoice
  const invoice = {
    ...data,
    calculations,
    generatedAt: new Date().toISOString(),
    invoiceId: `INV-${Date.now()}`,
  };

  // Compliance checks
  const compliance = {
    isValid: true,
    warnings: [] as string[],
    errors: [] as string[],
  };

  // Check if buyer GST is provided for B2B transactions
  if (!data.buyerGST && !data.export) {
    compliance.warnings.push(
      'Buyer GST number not provided - may be required for B2B transactions'
    );
  }

  // Check for reverse charge applicability
  if (data.reverseCharge && !data.buyerGST) {
    compliance.errors.push('Reverse charge requires buyer GST number');
    compliance.isValid = false;
  }

  // Validate GST numbers
  const supplierGSTValidation = validateGSTNumber(data.supplierGST);
  if (!supplierGSTValidation.isValid) {
    compliance.errors.push(
      `Supplier GST validation failed: ${supplierGSTValidation.errors.join(', ')}`
    );
    compliance.isValid = false;
  }

  if (data.buyerGST) {
    const buyerGSTValidation = validateGSTNumber(data.buyerGST);
    if (!buyerGSTValidation.isValid) {
      compliance.errors.push(
        `Buyer GST validation failed: ${buyerGSTValidation.errors.join(', ')}`
      );
      compliance.isValid = false;
    }
  }

  return { invoice, calculations, compliance };
}

export function generateGSTReport(
  transactions: any[],
  period: { start: string; end: string }
): {
  summary: any;
  details: any[];
  compliance: any;
} {
  const summary = {
    totalInvoices: transactions.length,
    totalAmount: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalGST: 0,
    period,
  };

  const details = transactions.map(tx => {
    summary.totalAmount += tx.calculations.subtotal;
    summary.totalCGST += tx.calculations.cgst;
    summary.totalSGST += tx.calculations.sgst;
    summary.totalIGST += tx.calculations.igst;
    summary.totalGST += tx.calculations.cgst + tx.calculations.sgst + tx.calculations.igst;

    return {
      invoiceNumber: tx.invoiceNumber,
      date: tx.invoiceDate,
      amount: tx.calculations.subtotal,
      gst: tx.calculations.cgst + tx.calculations.sgst + tx.calculations.igst,
      cgst: tx.calculations.cgst,
      sgst: tx.calculations.sgst,
      igst: tx.calculations.igst,
    };
  });

  summary.totalGST = summary.totalCGST + summary.totalSGST + summary.totalIGST;

  const compliance = {
    isCompliant: true,
    warnings: [] as string[],
    errors: [] as string[],
  };

  // Check for missing GST numbers
  const invoicesWithoutBuyerGST = transactions.filter(tx => !tx.buyerGST && !tx.export);
  if (invoicesWithoutBuyerGST.length > 0) {
    compliance.warnings.push(`${invoicesWithoutBuyerGST.length} invoices without buyer GST number`);
  }

  // Check for zero-rated transactions
  const zeroRatedTransactions = transactions.filter(tx =>
    tx.items.some((item: any) => item.gstRate === '0')
  );
  if (zeroRatedTransactions.length > 0) {
    compliance.warnings.push(`${zeroRatedTransactions.length} zero-rated transactions found`);
  }

  return { summary, details, compliance };
}

// All functions are already exported individually above
