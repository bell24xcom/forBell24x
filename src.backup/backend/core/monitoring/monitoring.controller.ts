import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MonitoringService } from '../services/monitoring.service';

@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('events/stats')
  async getEventStats(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.monitoringService.getEventStats(new Date(start), new Date(end));
  }

  @Get('events/errors')
  async getErrorLogs(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.monitoringService.getErrorLogs(new Date(start), new Date(end));
  }

  @Post('events/:id/replay')
  async replayEvent(@Param('id') id: string) {
    return this.monitoringService.replayEvent(id);
  }
} 