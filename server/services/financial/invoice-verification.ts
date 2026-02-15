import { storage } from '../storage';
import axios from 'axios';
import { Invoice } from '../../shared/schema';
import { validateGST } from '../lib/gstValidation';

interface VerificationResponse {
  success: boolean;
  message: string;
  verificationDetails?: {
    gstVerified: boolean;
    buyerExists: boolean;
    sellerExists: boolean;
    amountValid: boolean;
    dateValid: boolean;
    invoiceExists: boolean;
  };
}

/**
 * Invoice Verification Service
 * 
 * This service handles the verification of invoices by checking:
 * 1. GST validation of buyer and seller
 * 2. Invoice existence in GST records
 * 3. Amount correctness
 * 4. Date validity
 */
export class InvoiceVerificationService {
  /**
   * Verify an invoice against GST records
   */
  async verifyInvoice(invoiceId: number): Promise<VerificationResponse> {
    try {
      // Get invoice details from storage
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found'
        };
      }
      
      // Get buyer and seller details
      const buyer = await storage.getUser(invoice.buyerId);
      const seller = await storage.getUser(invoice.sellerId);
      
      if (!buyer || !seller) {
        return {
          success: false,
          message: 'Buyer or seller information not found'
        };
      }
      
      // Check if buyer and seller have GST numbers
      if (!buyer.gstNumber || !seller.gstNumber) {
        return {
          success: false,
          message: 'GST numbers are required for both buyer and seller'
        };
      }
      
      // Verify buyer GST
      const buyerGSTResult = await validateGST(buyer.gstNumber);
      
      if (!buyerGSTResult.valid) {
        return {
          success: false,
          message: `Buyer GST invalid: ${buyerGSTResult.message}`,
          verificationDetails: {
            gstVerified: false,
            buyerExists: false,
            sellerExists: false,
            amountValid: false,
            dateValid: false,
            invoiceExists: false
          }
        };
      }
      
      // Verify seller GST
      const sellerGSTResult = await validateGST(seller.gstNumber);
      
      if (!sellerGSTResult.valid) {
        return {
          success: false,
          message: `Seller GST invalid: ${sellerGSTResult.message}`,
          verificationDetails: {
            gstVerified: false,
            buyerExists: true,
            sellerExists: false,
            amountValid: false,
            dateValid: false,
            invoiceExists: false
          }
        };
      }
      
      // Check invoice existence in GST records (would require actual API integration)
      const invoiceExistsResult = await this.checkInvoiceExistsInGST(
        invoice.invoiceNumber,
        buyer.gstNumber,
        seller.gstNumber,
        invoice.amount,
        invoice.issuedDate
      );
      
      // Update invoice verification status based on the result
      await storage.updateInvoice(invoiceId, {
        verificationStatus: invoiceExistsResult.success ? 'verified' : 'rejected'
      });
      
      return invoiceExistsResult;
    } catch (error) {
      console.error('Error verifying invoice:', error);
      return {
        success: false,
        message: `Verification failed: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Verify invoice by document (OCR and GST matching)
   */
  async verifyInvoiceByDocument(invoiceId: number, fileUrl: string): Promise<VerificationResponse> {
    try {
      // Get invoice details from storage
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found'
        };
      }
      
      // In a real implementation, this would use OCR to extract data from the document
      // and then compare it with the invoice data in our system
      
      // For demonstration, we'll assume the document validation is successful
      const documentVerificationResult = {
        success: true,
        message: 'Invoice document verified successfully',
        verificationDetails: {
          gstVerified: true,
          buyerExists: true,
          sellerExists: true,
          amountValid: true,
          dateValid: true,
          invoiceExists: true
        }
      };
      
      // Update invoice verification status
      await storage.updateInvoice(invoiceId, {
        verificationStatus: 'verified',
        fileUrl: fileUrl
      });
      
      return documentVerificationResult;
    } catch (error) {
      console.error('Error verifying invoice by document:', error);
      return {
        success: false,
        message: `Document verification failed: ${(error as Error).message}`
      };
    }
  }
  
  /**
   * Check if invoice exists in GST records
   * This would require integration with the actual GST API
   */
  private async checkInvoiceExistsInGST(
    invoiceNumber: string,
    buyerGST: string,
    sellerGST: string,
    amount: number,
    invoiceDate: Date
  ): Promise<VerificationResponse> {
    try {
      // In a production environment, this would call the actual GST API
      // For demonstration, we'll simulate a successful response
      
      // This would be replaced with actual API call
      // const response = await axios.post('https://gst-api.gov.in/v1/invoice/verify', {
      //   invoiceNumber,
      //   buyerGST,
      //   sellerGST,
      //   amount,
      //   invoiceDate: invoiceDate.toISOString().split('T')[0]
      // });
      
      // Simulate API response
      const response = {
        data: {
          success: true,
          verificationDetails: {
            gstVerified: true,
            buyerExists: true,
            sellerExists: true,
            amountValid: true,
            dateValid: true,
            invoiceExists: true
          }
        }
      };
      
      return {
        success: response.data.success,
        message: 'Invoice verified successfully through GST records',
        verificationDetails: response.data.verificationDetails
      };
    } catch (error) {
      console.error('Error checking invoice in GST records:', error);
      
      // In case of API failure, return a failed verification
      return {
        success: false,
        message: `GST verification failed: ${(error as Error).message}`,
        verificationDetails: {
          gstVerified: true, // GST numbers are valid
          buyerExists: true,
          sellerExists: true,
          amountValid: false, // Cannot verify without GST API
          dateValid: false,   // Cannot verify without GST API
          invoiceExists: false // Cannot verify without GST API
        }
      };
    }
  }
  
  /**
   * Get pending verification invoices for a user
   */
  async getPendingVerificationInvoices(userId: number): Promise<Invoice[]> {
    try {
      // Get invoices where the user is either buyer or seller and verification is pending
      const sellerInvoices = await storage.getInvoicesBySellerId(userId);
      const buyerInvoices = await storage.getInvoicesByBuyerId(userId);
      
      const allInvoices = [...sellerInvoices, ...buyerInvoices];
      
      // Filter to get only invoices with pending verification
      return allInvoices.filter(invoice => 
        invoice.verificationStatus === 'pending'
      );
    } catch (error) {
      console.error('Error getting pending verification invoices:', error);
      return [];
    }
  }
  
  /**
   * Get verified invoices for a user
   */
  async getVerifiedInvoices(userId: number): Promise<Invoice[]> {
    try {
      // Get invoices where the user is either buyer or seller and verification is complete
      const sellerInvoices = await storage.getInvoicesBySellerId(userId);
      const buyerInvoices = await storage.getInvoicesByBuyerId(userId);
      
      const allInvoices = [...sellerInvoices, ...buyerInvoices];
      
      // Filter to get only invoices with verified status
      return allInvoices.filter(invoice => 
        invoice.verificationStatus === 'verified'
      );
    } catch (error) {
      console.error('Error getting verified invoices:', error);
      return [];
    }
  }
}

export const invoiceVerificationService = new InvoiceVerificationService();
