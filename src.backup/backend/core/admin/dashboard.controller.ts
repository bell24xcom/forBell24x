import {
  Controller,
  Get,
  Query,
  UseGuards,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { DashboardService } from './dashboard.service';
import { RealtimeService } from '../services/realtime.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly realtimeService: RealtimeService,
  ) {}

  @Get('rfq-stats')
  async getRFQStats(@Query('start') start: string, @Query('end') end: string) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };
    return this.dashboardService.getRFQStats(timeRange);
  }

  @Get('escrow-stats')
  async getEscrowStats(@Query('start') start: string, @Query('end') end: string) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };
    return this.dashboardService.getEscrowStats(timeRange);
  }

  @Get('user-stats')
  async getUserStats(@Query('start') start: string, @Query('end') end: string) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };
    return this.dashboardService.getUserStats(timeRange);
  }

  @Get('performance-metrics')
  async getPerformanceMetrics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };
    return this.dashboardService.getPerformanceMetrics(timeRange);
  }

  @Sse('realtime-updates')
  realtimeUpdates(): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const rfqHandler = (data: any) => {
        subscriber.next({
          data: { type: 'rfq', data },
          id: Date.now().toString(),
          type: 'message',
        });
      };

      const escrowHandler = (data: any) => {
        subscriber.next({
          data: { type: 'escrow', data },
          id: Date.now().toString(),
          type: 'message',
        });
      };

      const userHandler = (data: any) => {
        subscriber.next({
          data: { type: 'user', data },
          id: Date.now().toString(),
          type: 'message',
        });
      };

      // Subscribe to real-time updates
      this.realtimeService.subscribeToChannel('rfq-updates', rfqHandler);
      this.realtimeService.subscribeToChannel('escrow-updates', escrowHandler);
      this.realtimeService.subscribeToChannel('user-updates', userHandler);

      // Cleanup on unsubscribe
      return () => {
        // Unsubscribe logic here
      };
    });
  }

  @Get('system-health')
  async getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }

  @Get('active-users')
  async getActiveUsers() {
    return this.dashboardService.getActiveUsers();
  }

  @Get('recent-activities')
  async getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('alerts')
  async getAlerts() {
    return this.dashboardService.getAlerts();
  }
} 