import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { OracleConfig } from '../config/oracle.config';
import { EDIProcessor } from './edi.processor';
import { TransactionLogger } from './transaction.logger';

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);
  private readonly config: OracleConfig;
  private readonly baseUrl: string;
  private readonly authToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly ediProcessor: EDIProcessor,
    private readonly transactionLogger: TransactionLogger,
  ) {
    this.config = this.configService.get<OracleConfig>('oracle');
    this.baseUrl = this.config.baseUrl;
    this.authToken = this.config.authToken;
  }

  /**
   * Fetch purchase orders from Oracle ERP
   */
  async fetchPurchaseOrders(params: {
    startDate: Date;
    endDate: Date;
    status?: string;
  }): Promise<any> {
    try {
      const response = await this.httpService
        .get(`${this.baseUrl}/purchaseOrders`, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
          params: {
            startDate: params.startDate.toISOString(),
            endDate: params.endDate.toISOString(),
            status: params.status,
          },
        })
        .pipe(
          retry(3),
          map((res) => res.data),
          catchError((error) => {
            this.logger.error('Error fetching purchase orders:', error);
            return throwError(() => error);
          }),
        )
        .toPromise();

      await this.transactionLogger.logTransaction({
        type: 'PURCHASE_ORDER_FETCH',
        status: 'SUCCESS',
        details: {
          startDate: params.startDate,
          endDate: params.endDate,
          count: response.length,
        },
      });

      return response;
    } catch (error) {
      await this.transactionLogger.logTransaction({
        type: 'PURCHASE_ORDER_FETCH',
        status: 'ERROR',
        details: {
          error: error.message,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      });
      throw error;
    }
  }

  /**
   * Send supplier data to Oracle ERP
   */
  async sendSupplierData(supplierData: any): Promise<any> {
    try {
      const ediMessage = await this.ediProcessor.transformToEDI(supplierData);

      const response = await this.httpService
        .post(`${this.baseUrl}/suppliers`, ediMessage, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/edi',
          },
        })
        .pipe(
          retry(3),
          map((res) => res.data),
          catchError((error) => {
            this.logger.error('Error sending supplier data:', error);
            return throwError(() => error);
          }),
        )
        .toPromise();

      await this.transactionLogger.logTransaction({
        type: 'SUPPLIER_DATA_SYNC',
        status: 'SUCCESS',
        details: {
          supplierId: supplierData.id,
          oracleId: response.oracleId,
        },
      });

      return response;
    } catch (error) {
      await this.transactionLogger.logTransaction({
        type: 'SUPPLIER_DATA_SYNC',
        status: 'ERROR',
        details: {
          error: error.message,
          supplierId: supplierData.id,
        },
      });
      throw error;
    }
  }

  /**
   * Sync inventory data with Oracle ERP
   */
  async syncInventory(inventoryData: any): Promise<any> {
    try {
      const ediMessage = await this.ediProcessor.transformToEDI(inventoryData);

      const response = await this.httpService
        .post(`${this.baseUrl}/inventory/sync`, ediMessage, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            'Content-Type': 'application/edi',
          },
        })
        .pipe(
          retry(3),
          map((res) => res.data),
          catchError((error) => {
            this.logger.error('Error syncing inventory:', error);
            return throwError(() => error);
          }),
        )
        .toPromise();

      await this.transactionLogger.logTransaction({
        type: 'INVENTORY_SYNC',
        status: 'SUCCESS',
        details: {
          itemsCount: inventoryData.items.length,
          oracleSyncId: response.syncId,
        },
      });

      return response;
    } catch (error) {
      await this.transactionLogger.logTransaction({
        type: 'INVENTORY_SYNC',
        status: 'ERROR',
        details: {
          error: error.message,
          itemsCount: inventoryData.items.length,
        },
      });
      throw error;
    }
  }

  /**
   * Handle webhook notifications from Oracle ERP
   */
  async handleWebhook(payload: any): Promise<void> {
    try {
      await this.transactionLogger.logTransaction({
        type: 'ORACLE_WEBHOOK',
        status: 'RECEIVED',
        details: {
          eventType: payload.eventType,
          timestamp: payload.timestamp,
        },
      });

      // Process webhook based on event type
      switch (payload.eventType) {
        case 'PURCHASE_ORDER_CREATED':
          await this.handlePurchaseOrderCreated(payload.data);
          break;
        case 'INVENTORY_UPDATED':
          await this.handleInventoryUpdated(payload.data);
          break;
        default:
          this.logger.warn(`Unhandled webhook event type: ${payload.eventType}`);
      }

      await this.transactionLogger.logTransaction({
        type: 'ORACLE_WEBHOOK',
        status: 'PROCESSED',
        details: {
          eventType: payload.eventType,
          timestamp: payload.timestamp,
        },
      });
    } catch (error) {
      await this.transactionLogger.logTransaction({
        type: 'ORACLE_WEBHOOK',
        status: 'ERROR',
        details: {
          error: error.message,
          eventType: payload.eventType,
          timestamp: payload.timestamp,
        },
      });
      throw error;
    }
  }

  private async handlePurchaseOrderCreated(data: any): Promise<void> {
    // Implementation for handling purchase order creation
    this.logger.log('Processing purchase order creation:', data);
  }

  private async handleInventoryUpdated(data: any): Promise<void> {
    // Implementation for handling inventory updates
    this.logger.log('Processing inventory update:', data);
  }
} 