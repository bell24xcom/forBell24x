import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayXService {
  private readonly logger = new Logger(RazorpayXService.name);
  private readonly baseUrl = 'https://api.razorpay.com/v1';
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    this.keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
  }

  private getAuthHeader(): string {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    return `Basic ${auth}`;
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error) {
      this.logger.error(`RazorpayX API error: ${error.response?.data?.error?.description || error.message}`);
      throw error;
    }
  }

  // Account Management
  async createAccount(accountData: any): Promise<any> {
    try {
      const account = await this.makeRequest('POST', '/accounts', {
        name: accountData.name,
        email: accountData.email,
        contact: accountData.contact,
        type: accountData.type,
        profile: {
          category: 'individual',
          subcategory: 'individual',
          addresses: {
            registered: {
              street1: accountData.address?.street1 || '',
              street2: accountData.address?.street2 || '',
              city: accountData.address?.city || '',
              state: accountData.address?.state || '',
              postal_code: accountData.address?.postalCode || '',
              country: accountData.address?.country || 'IN'
            }
          },
          business: {
            name: accountData.name,
            gstin: accountData.gstin || ''
          }
        }
      });

      this.logger.log(`RazorpayX account created: ${account.id}`);
      return account;
    } catch (error) {
      this.logger.error('Error creating RazorpayX account:', error);
      throw error;
    }
  }

  async getAccount(accountId: string): Promise<any> {
    try {
      const account = await this.makeRequest('GET', `/accounts/${accountId}`);
      return account;
    } catch (error) {
      this.logger.error(`Error fetching RazorpayX account ${accountId}:`, error);
      throw error;
    }
  }

  async updateAccount(accountId: string, updateData: any): Promise<any> {
    try {
      const account = await this.makeRequest('PATCH', `/accounts/${accountId}`, updateData);
      this.logger.log(`RazorpayX account updated: ${accountId}`);
      return account;
    } catch (error) {
      this.logger.error(`Error updating RazorpayX account ${accountId}:`, error);
      throw error;
    }
  }

  // Payment Links
  async createPaymentLink(paymentData: any): Promise<any> {
    try {
      const paymentLink = await this.makeRequest('POST', '/payment_links', {
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        reference_id: paymentData.reference_id,
        callback_url: paymentData.callback_url,
        callback_method: paymentData.callback_method,
        notes: paymentData.notes || {},
        reminder_enable: true,
        notify: {
          sms: true,
          email: true
        }
      });

      this.logger.log(`Payment link created: ${paymentLink.id}`);
      return paymentLink;
    } catch (error) {
      this.logger.error('Error creating payment link:', error);
      throw error;
    }
  }

  async getPaymentLink(paymentLinkId: string): Promise<any> {
    try {
      const paymentLink = await this.makeRequest('GET', `/payment_links/${paymentLinkId}`);
      return paymentLink;
    } catch (error) {
      this.logger.error(`Error fetching payment link ${paymentLinkId}:`, error);
      throw error;
    }
  }

  // Payouts
  async createPayout(payoutData: any): Promise<any> {
    try {
      const payout = await this.makeRequest('POST', '/payouts', {
        account_number: payoutData.account_number,
        fund_account_id: payoutData.fund_account_id,
        amount: payoutData.amount,
        currency: payoutData.currency,
        mode: payoutData.mode,
        purpose: payoutData.purpose,
        queue_if_low_balance: payoutData.queue_if_low_balance,
        reference_id: payoutData.reference_id,
        narration: payoutData.narration,
        notes: payoutData.notes || {}
      });

      this.logger.log(`Payout created: ${payout.id}`);
      return payout;
    } catch (error) {
      this.logger.error('Error creating payout:', error);
      throw error;
    }
  }

  async getPayout(payoutId: string): Promise<any> {
    try {
      const payout = await this.makeRequest('GET', `/payouts/${payoutId}`);
      return payout;
    } catch (error) {
      this.logger.error(`Error fetching payout ${payoutId}:`, error);
      throw error;
    }
  }

  async getAllPayouts(query: any): Promise<any> {
    try {
      const params = new URLSearchParams(query).toString();
      const payouts = await this.makeRequest('GET', `/payouts?${params}`);
      return payouts;
    } catch (error) {
      this.logger.error('Error fetching payouts:', error);
      throw error;
    }
  }

  // Fund Accounts
  async createFundAccount(fundAccountData: any): Promise<any> {
    try {
      const fundAccount = await this.makeRequest('POST', '/fund_accounts', {
        contact_id: fundAccountData.contact_id,
        account_type: fundAccountData.account_type,
        bank_account: fundAccountData.bank_account ? {
          name: fundAccountData.bank_account.name,
          ifsc: fundAccountData.bank_account.ifsc,
          account_number: fundAccountData.bank_account.account_number
        } : undefined,
        vpa: fundAccountData.vpa ? {
          address: fundAccountData.vpa.address
        } : undefined
      });

      this.logger.log(`Fund account created: ${fundAccount.id}`);
      return fundAccount;
    } catch (error) {
      this.logger.error('Error creating fund account:', error);
      throw error;
    }
  }

  async getFundAccount(fundAccountId: string): Promise<any> {
    try {
      const fundAccount = await this.makeRequest('GET', `/fund_accounts/${fundAccountId}`);
      return fundAccount;
    } catch (error) {
      this.logger.error(`Error fetching fund account ${fundAccountId}:`, error);
      throw error;
    }
  }

  // Contacts
  async createContact(contactData: any): Promise<any> {
    try {
      const contact = await this.makeRequest('POST', '/contacts', {
        name: contactData.name,
        email: contactData.email,
        contact: contactData.contact,
        type: contactData.type || 'customer',
        reference_id: contactData.reference_id,
        notes: contactData.notes || {}
      });

      this.logger.log(`Contact created: ${contact.id}`);
      return contact;
    } catch (error) {
      this.logger.error('Error creating contact:', error);
      throw error;
    }
  }

  async getContact(contactId: string): Promise<any> {
    try {
      const contact = await this.makeRequest('GET', `/contacts/${contactId}`);
      return contact;
    } catch (error) {
      this.logger.error(`Error fetching contact ${contactId}:`, error);
      throw error;
    }
  }

  // Transactions
  async getTransactions(accountId: string, query: any = {}): Promise<any> {
    try {
      const params = new URLSearchParams({
        account_number: accountId,
        ...query
      }).toString();
      const transactions = await this.makeRequest('GET', `/transactions?${params}`);
      return transactions;
    } catch (error) {
      this.logger.error(`Error fetching transactions for account ${accountId}:`, error);
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<any> {
    try {
      const transaction = await this.makeRequest('GET', `/transactions/${transactionId}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Error fetching transaction ${transactionId}:`, error);
      throw error;
    }
  }

  // Webhook Verification
  verifyWebhookSignature(payload: string, signature: string, webhookSecret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      this.logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Settlements
  async getSettlements(query: any = {}): Promise<any> {
    try {
      const params = new URLSearchParams(query).toString();
      const settlements = await this.makeRequest('GET', `/settlements?${params}`);
      return settlements;
    } catch (error) {
      this.logger.error('Error fetching settlements:', error);
      throw error;
    }
  }

  async getSettlement(settlementId: string): Promise<any> {
    try {
      const settlement = await this.makeRequest('GET', `/settlements/${settlementId}`);
      return settlement;
    } catch (error) {
      this.logger.error(`Error fetching settlement ${settlementId}:`, error);
      throw error;
    }
  }

  // Reports
  async generateReport(reportData: any): Promise<any> {
    try {
      const report = await this.makeRequest('POST', '/reports', {
        type: reportData.type,
        start_date: reportData.start_date,
        end_date: reportData.end_date,
        format: reportData.format || 'json'
      });

      this.logger.log(`Report generated: ${report.id}`);
      return report;
    } catch (error) {
      this.logger.error('Error generating report:', error);
      throw error;
    }
  }

  async getReport(reportId: string): Promise<any> {
    try {
      const report = await this.makeRequest('GET', `/reports/${reportId}`);
      return report;
    } catch (error) {
      this.logger.error(`Error fetching report ${reportId}:`, error);
      throw error;
    }
  }

  // Account Balance
  async getAccountBalance(accountId: string): Promise<any> {
    try {
      const balance = await this.makeRequest('GET', `/accounts/${accountId}/balance`);
      return balance;
    } catch (error) {
      this.logger.error(`Error fetching balance for account ${accountId}:`, error);
      throw error;
    }
  }

  // Account Statement
  async getAccountStatement(accountId: string, query: any = {}): Promise<any> {
    try {
      const params = new URLSearchParams({
        account_number: accountId,
        ...query
      }).toString();
      const statement = await this.makeRequest('GET', `/accounts/${accountId}/statement?${params}`);
      return statement;
    } catch (error) {
      this.logger.error(`Error fetching statement for account ${accountId}:`, error);
      throw error;
    }
  }
} 