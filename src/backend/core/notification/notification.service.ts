import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { subHours, subDays } from 'date-fns';

interface NotificationQuery {
  timeRange: string;
  channel: string;
  type: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(query: NotificationQuery) {
    const { timeRange, channel, type } = query;
    const startDate = this.getStartDate(timeRange);

    const whereClause: any = {
      timestamp: Between(startDate, new Date()),
    };

    if (channel !== 'all') {
      whereClause.channels = In([channel]);
    }

    if (type !== 'all') {
      whereClause.type = type;
    }

    const notifications = await this.notificationRepository.find({
      where: whereClause,
      order: {
        timestamp: 'DESC',
      },
    });

    return notifications;
  }

  async getNotificationStats(timeRange: string) {
    const startDate = this.getStartDate(timeRange);

    const [total, byType, byChannel, byStatus] = await Promise.all([
      this.notificationRepository.count({
        where: {
          timestamp: Between(startDate, new Date()),
        },
      }),
      this.getStatsByType(startDate),
      this.getStatsByChannel(startDate),
      this.getStatsByStatus(startDate),
    ]);

    return {
      total,
      byType,
      byChannel,
      byStatus,
    };
  }

  async getNotificationChannels() {
    const channels = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('DISTINCT unnest(notification.channels)', 'channel')
      .getRawMany();

    return channels.map((c) => c.channel);
  }

  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return subHours(now, 1);
      case '6h':
        return subHours(now, 6);
      case '24h':
        return subHours(now, 24);
      case '7d':
        return subDays(now, 7);
      default:
        return subHours(now, 24);
    }
  }

  private async getStatsByType(startDate: Date) {
    const stats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate: new Date(),
      })
      .groupBy('notification.type')
      .getRawMany();

    return stats.reduce((acc, curr) => {
      acc[curr.type] = parseInt(curr.count);
      return acc;
    }, {});
  }

  private async getStatsByChannel(startDate: Date) {
    const stats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('unnest(notification.channels)', 'channel')
      .addSelect('COUNT(*)', 'count')
      .where('notification.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate: new Date(),
      })
      .groupBy('channel')
      .getRawMany();

    return stats.reduce((acc, curr) => {
      acc[curr.channel] = parseInt(curr.count);
      return acc;
    }, {});
  }

  private async getStatsByStatus(startDate: Date) {
    const stats = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('notification.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate: new Date(),
      })
      .groupBy('notification.status')
      .getRawMany();

    return stats.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count);
      return acc;
    }, {});
  }
} 