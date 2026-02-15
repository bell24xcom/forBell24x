import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventLog } from '../entities/event-log.entity';
import { AlertService } from './alert.service';
import { EventService } from './event.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(EventLog)
    private readonly eventLogRepository: Repository<EventLog>,
    private readonly alertService: AlertService,
    private readonly eventService: EventService,
  ) {}

  async logEvent(
    eventType: string,
    data: any,
    status: 'success' | 'error',
    error?: string,
  ) {
    try {
      const eventLog = this.eventLogRepository.create({
        eventType,
        data,
        status,
        error,
        timestamp: new Date(),
      });

      await this.eventLogRepository.save(eventLog);

      if (status === 'error') {
        await this.alertService.sendErrorAlert(
          new Error(error || 'Unknown error'),
          `Event: ${eventType}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to log event: ${error.message}`, error.stack);
      await this.alertService.sendErrorAlert(error, 'Event Logging');
    }
  }

  async getEventStats(start: Date, end: Date) {
    try {
      const stats = await this.eventLogRepository
        .createQueryBuilder('eventLog')
        .select('eventLog.eventType', 'eventType')
        .addSelect('eventLog.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('eventLog.timestamp BETWEEN :start AND :end', { start, end })
        .groupBy('eventLog.eventType')
        .addGroupBy('eventLog.status')
        .getRawMany();

      return stats;
    } catch (error) {
      this.logger.error(`Failed to get event stats: ${error.message}`, error.stack);
      await this.alertService.sendErrorAlert(error, 'Event Stats');
      throw error;
    }
  }

  async getErrorLogs(start: Date, end: Date) {
    try {
      return await this.eventLogRepository.find({
        where: {
          status: 'error',
          timestamp: Between(start, end),
        },
        order: {
          timestamp: 'DESC',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get error logs: ${error.message}`, error.stack);
      await this.alertService.sendErrorAlert(error, 'Error Logs');
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [totalEvents, errorEvents] = await Promise.all([
        this.eventLogRepository.count({
          where: {
            timestamp: Between(oneHourAgo, new Date()),
          },
        }),
        this.eventLogRepository.count({
          where: {
            status: 'error',
            timestamp: Between(oneHourAgo, new Date()),
          },
        }),
      ]);

      const errorRate = totalEvents > 0 ? ((errorEvents / totalEvents) * 100).toFixed(2) : '0.00';
      const status = parseFloat(errorRate) > 5 ? 'degraded' : 'healthy';

      if (status === 'degraded') {
        await this.alertService.sendWarningAlert(
          'System health degraded',
          {
            errorRate,
            totalEvents,
            errorEvents,
          },
        );
      }

      return {
        status,
        metrics: {
          totalEvents,
          errorEvents,
          errorRate,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get system health: ${error.message}`, error.stack);
      await this.alertService.sendErrorAlert(error, 'System Health');
      throw error;
    }
  }

  async replayEvent(id: string) {
    try {
      const eventLog = await this.eventLogRepository.findOne({ where: { id } });
      if (!eventLog) {
        throw new NotFoundException(`Event log with ID ${id} not found`);
      }

      // Attempt to replay the event
      await this.eventService.sendEvent(eventLog.eventType, eventLog.data);

      // Log the replay attempt
      await this.logEvent(
        eventLog.eventType,
        {
          ...eventLog.data,
          originalEventId: id,
          replayed: true,
        },
        'success',
      );

      await this.alertService.sendInfoAlert(
        `Event replayed successfully: ${eventLog.eventType}`,
        {
          originalEventId: id,
          eventType: eventLog.eventType,
        },
      );

      return { message: 'Event replayed successfully' };
    } catch (error) {
      this.logger.error(`Failed to replay event: ${error.message}`, error.stack);
      await this.alertService.sendErrorAlert(error, 'Event Replay');
      throw error;
    }
  }
} 