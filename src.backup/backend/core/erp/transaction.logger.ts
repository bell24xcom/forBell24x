import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionLog } from '../entities/transaction-log.entity';

@Injectable()
export class TransactionLogger {
  private readonly logger = new Logger(TransactionLogger.name);

  constructor(
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
  ) {}

  /**
   * Log a transaction with details
   */
  async logTransaction(data: {
    type: string;
    status: 'SUCCESS' | 'ERROR' | 'PENDING' | 'RECEIVED' | 'PROCESSED';
    details: any;
    correlationId?: string;
  }): Promise<void> {
    try {
      const transactionLog = this.transactionLogRepository.create({
        type: data.type,
        status: data.status,
        details: data.details,
        correlationId: data.correlationId || this.generateCorrelationId(),
        timestamp: new Date(),
      });

      await this.transactionLogRepository.save(transactionLog);

      this.logger.log(
        `Transaction logged: ${data.type} - ${data.status}`,
        data.correlationId,
      );
    } catch (error) {
      this.logger.error('Error logging transaction:', error);
      // Don't throw the error to prevent disrupting the main flow
    }
  }

  /**
   * Get transaction logs with filtering
   */
  async getTransactionLogs(params: {
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    correlationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: TransactionLog[]; total: number }> {
    try {
      const query = this.transactionLogRepository.createQueryBuilder('log');

      if (params.type) {
        query.andWhere('log.type = :type', { type: params.type });
      }

      if (params.status) {
        query.andWhere('log.status = :status', { status: params.status });
      }

      if (params.startDate) {
        query.andWhere('log.timestamp >= :startDate', {
          startDate: params.startDate,
        });
      }

      if (params.endDate) {
        query.andWhere('log.timestamp <= :endDate', { endDate: params.endDate });
      }

      if (params.correlationId) {
        query.andWhere('log.correlationId = :correlationId', {
          correlationId: params.correlationId,
        });
      }

      const total = await query.getCount();

      if (params.limit) {
        query.take(params.limit);
      }

      if (params.offset) {
        query.skip(params.offset);
      }

      query.orderBy('log.timestamp', 'DESC');

      const logs = await query.getMany();

      return { logs, total };
    } catch (error) {
      this.logger.error('Error fetching transaction logs:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(params: {
    startDate: Date;
    endDate: Date;
    type?: string;
  }): Promise<{
    totalTransactions: number;
    successCount: number;
    errorCount: number;
    averageProcessingTime: number;
    typeBreakdown: { [key: string]: number };
  }> {
    try {
      const query = this.transactionLogRepository
        .createQueryBuilder('log')
        .where('log.timestamp BETWEEN :startDate AND :endDate', {
          startDate: params.startDate,
          endDate: params.endDate,
        });

      if (params.type) {
        query.andWhere('log.type = :type', { type: params.type });
      }

      const logs = await query.getMany();

      const stats = {
        totalTransactions: logs.length,
        successCount: logs.filter((log) => log.status === 'SUCCESS').length,
        errorCount: logs.filter((log) => log.status === 'ERROR').length,
        averageProcessingTime: 0,
        typeBreakdown: {} as { [key: string]: number },
      };

      // Calculate type breakdown
      logs.forEach((log) => {
        stats.typeBreakdown[log.type] = (stats.typeBreakdown[log.type] || 0) + 1;
      });

      // Calculate average processing time for transactions with correlation IDs
      const processingTimes: number[] = [];
      const correlationMap = new Map<string, Date>();

      logs.forEach((log) => {
        if (log.correlationId) {
          if (correlationMap.has(log.correlationId)) {
            const startTime = correlationMap.get(log.correlationId)!.getTime();
            const endTime = log.timestamp.getTime();
            processingTimes.push(endTime - startTime);
            correlationMap.delete(log.correlationId);
          } else {
            correlationMap.set(log.correlationId, log.timestamp);
          }
        }
      });

      if (processingTimes.length > 0) {
        stats.averageProcessingTime =
          processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      }

      return stats;
    } catch (error) {
      this.logger.error('Error calculating transaction statistics:', error);
      throw error;
    }
  }

  /**
   * Generate a unique correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 