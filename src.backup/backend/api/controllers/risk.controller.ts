import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RiskService } from '../../core/risk/risk.service';
import { RiskAssessmentDto, RiskMitigationDto } from '../../core/risk/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('risk')
@UseGuards(AuthGuard)
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get('dashboard')
  async getRiskDashboard(@Query() query: any) {
    return this.riskService.getRiskDashboard(query);
  }

  @Get('assessments')
  async getAllAssessments(@Query() query: any) {
    return this.riskService.getAllAssessments(query);
  }

  @Get('assessments/:id')
  async getAssessment(@Param('id') id: string) {
    return this.riskService.getAssessmentById(id);
  }

  @Post('assessments')
  async createAssessment(@Body() dto: RiskAssessmentDto) {
    return this.riskService.createAssessment(dto);
  }

  @Put('assessments/:id')
  async updateAssessment(@Param('id') id: string, @Body() dto: RiskAssessmentDto) {
    return this.riskService.updateAssessment(id, dto);
  }

  @Get('supplier/:supplierId/assessment')
  async getSupplierRiskAssessment(@Param('supplierId') supplierId: string) {
    return this.riskService.getSupplierRiskAssessment(supplierId);
  }

  @Post('supplier/:supplierId/assess')
  async assessSupplierRisk(@Param('supplierId') supplierId: string, @Body() assessmentData: any) {
    return this.riskService.assessSupplierRisk(supplierId, assessmentData);
  }

  @Get('financial/analysis')
  async getFinancialRiskAnalysis(@Query() query: any) {
    return this.riskService.getFinancialRiskAnalysis(query);
  }

  @Get('operational/analysis')
  async getOperationalRiskAnalysis(@Query() query: any) {
    return this.riskService.getOperationalRiskAnalysis(query);
  }

  @Get('compliance/analysis')
  async getComplianceRiskAnalysis(@Query() query: any) {
    return this.riskService.getComplianceRiskAnalysis(query);
  }

  @Get('market/analysis')
  async getMarketRiskAnalysis(@Query() query: any) {
    return this.riskService.getMarketRiskAnalysis(query);
  }

  @Post('mitigation')
  async createMitigationPlan(@Body() dto: RiskMitigationDto) {
    return this.riskService.createMitigationPlan(dto);
  }

  @Put('mitigation/:id')
  async updateMitigationPlan(@Param('id') id: string, @Body() dto: RiskMitigationDto) {
    return this.riskService.updateMitigationPlan(id, dto);
  }

  @Get('mitigation/:id')
  async getMitigationPlan(@Param('id') id: string) {
    return this.riskService.getMitigationPlan(id);
  }

  @Post('mitigation/:id/execute')
  async executeMitigationPlan(@Param('id') id: string, @Body() executionData: any) {
    return this.riskService.executeMitigationPlan(id, executionData);
  }

  @Get('alerts')
  async getRiskAlerts(@Query() query: any) {
    return this.riskService.getRiskAlerts(query);
  }

  @Post('alerts/configure')
  @UseGuards(RoleGuard)
  async configureRiskAlerts(@Body() alertConfig: any) {
    return this.riskService.configureRiskAlerts(alertConfig);
  }

  @Get('scenarios')
  async getRiskScenarios(@Query() query: any) {
    return this.riskService.getRiskScenarios(query);
  }

  @Post('scenarios/simulate')
  async simulateRiskScenario(@Body() scenarioData: any) {
    return this.riskService.simulateRiskScenario(scenarioData);
  }

  @Get('metrics/trends')
  async getRiskMetricsTrends(@Query() query: any) {
    return this.riskService.getRiskMetricsTrends(query);
  }

  @Get('reports/summary')
  async getRiskSummaryReport(@Query() query: any) {
    return this.riskService.getRiskSummaryReport(query);
  }

  @Get('reports/detailed')
  async getDetailedRiskReport(@Query() query: any) {
    return this.riskService.getDetailedRiskReport(query);
  }

  @Post('monitoring/start')
  @UseGuards(RoleGuard)
  async startRiskMonitoring(@Body() monitoringConfig: any) {
    return this.riskService.startRiskMonitoring(monitoringConfig);
  }

  @Post('monitoring/stop')
  @UseGuards(RoleGuard)
  async stopRiskMonitoring(@Body() stopConfig: any) {
    return this.riskService.stopRiskMonitoring(stopConfig);
  }

  @Get('explainability/:assessmentId')
  async getRiskExplainability(@Param('assessmentId') assessmentId: string) {
    return this.riskService.getRiskExplainability(assessmentId);
  }
} 