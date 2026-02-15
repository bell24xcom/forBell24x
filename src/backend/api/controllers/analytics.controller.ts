import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from '../../core/analytics/analytics.service';
import { AnalyticsQueryDto, ExportRequestDto } from '../../core/analytics/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboardData(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboardData(query);
  }

  @Get('rfq/summary')
  async getRFQSummary(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRFQSummary(query);
  }

  @Get('supplier/performance')
  async getSupplierPerformance(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getSupplierPerformance(query);
  }

  @Get('financial/summary')
  async getFinancialSummary(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getFinancialSummary(query);
  }

  @Get('user/activity')
  async getUserActivity(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getUserActivity(query);
  }

  @Get('market/trends')
  async getMarketTrends(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getMarketTrends(query);
  }

  @Get('risk/assessment')
  async getRiskAssessment(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRiskAssessment(query);
  }

  @Get('compliance/status')
  async getComplianceStatus(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getComplianceStatus(query);
  }

  @Get('revenue/analysis')
  async getRevenueAnalysis(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRevenueAnalysis(query);
  }

  @Get('cost/analysis')
  async getCostAnalysis(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getCostAnalysis(query);
  }

  @Get('efficiency/metrics')
  async getEfficiencyMetrics(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getEfficiencyMetrics(query);
  }

  @Get('predictions/forecast')
  async getPredictions(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getPredictions(query);
  }

  @Post('export')
  @UseGuards(RoleGuard)
  async exportData(@Body() dto: ExportRequestDto) {
    return this.analyticsService.exportData(dto);
  }

  @Get('export/:id/status')
  async getExportStatus(@Param('id') id: string) {
    return this.analyticsService.getExportStatus(id);
  }

  @Get('export/:id/download')
  async downloadExport(@Param('id') id: string) {
    return this.analyticsService.downloadExport(id);
  }

  @Get('reports/custom')
  async getCustomReports(@Query() query: any) {
    return this.analyticsService.getCustomReports(query);
  }

  @Post('reports/schedule')
  @UseGuards(RoleGuard)
  async scheduleReport(@Body() scheduleData: any) {
    return this.analyticsService.scheduleReport(scheduleData);
  }

  @Get('alerts/active')
  async getActiveAlerts(@Query() query: any) {
    return this.analyticsService.getActiveAlerts(query);
  }

  @Post('alerts/configure')
  @UseGuards(RoleGuard)
  async configureAlerts(@Body() alertConfig: any) {
    return this.analyticsService.configureAlerts(alertConfig);
  }

  @Get('kpi/dashboard')
  async getKPIDashboard(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getKPIDashboard(query);
  }

  @Get('comparison/period')
  async getPeriodComparison(@Query() query: any) {
    return this.analyticsService.getPeriodComparison(query);
  }
} 