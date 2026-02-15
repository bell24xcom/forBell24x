import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationService } from './notification.service';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @Query('timeRange') timeRange: string = '24h',
    @Query('channel') channel: string = 'all',
    @Query('type') type: string = 'all',
  ) {
    const notifications = await this.notificationService.getNotifications({
      timeRange,
      channel,
      type,
    });

    return notifications;
  }

  @Get('stats')
  async getNotificationStats(
    @Query('timeRange') timeRange: string = '24h',
  ) {
    const stats = await this.notificationService.getNotificationStats(timeRange);
    return stats;
  }

  @Get('channels')
  async getNotificationChannels() {
    const channels = await this.notificationService.getNotificationChannels();
    return channels;
  }
} 