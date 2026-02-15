import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LogisticsService } from '../../core/logistics/logistics.service';
import { CreateShipmentDto, UpdateShipmentDto, TrackingQueryDto } from '../../core/logistics/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('logistics')
@UseGuards(AuthGuard)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('shipments')
  async getAllShipments(@Query() query: any) {
    return this.logisticsService.getAllShipments(query);
  }

  @Get('shipments/:id')
  async getShipment(@Param('id') id: string) {
    return this.logisticsService.getShipmentById(id);
  }

  @Post('shipments')
  async createShipment(@Body() dto: CreateShipmentDto) {
    return this.logisticsService.createShipment(dto);
  }

  @Put('shipments/:id')
  async updateShipment(@Param('id') id: string, @Body() dto: UpdateShipmentDto) {
    return this.logisticsService.updateShipment(id, dto);
  }

  @Get('shipments/:id/tracking')
  async getShipmentTracking(@Param('id') id: string) {
    return this.logisticsService.getShipmentTracking(id);
  }

  @Post('shipments/:id/track')
  async updateTracking(@Param('id') id: string, @Body() trackingData: any) {
    return this.logisticsService.updateTracking(id, trackingData);
  }

  @Get('tracking/:trackingNumber')
  async trackByNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.logisticsService.trackByNumber(trackingNumber);
  }

  @Get('carriers')
  async getCarriers() {
    return this.logisticsService.getCarriers();
  }

  @Get('carriers/:id/services')
  async getCarrierServices(@Param('id') id: string) {
    return this.logisticsService.getCarrierServices(id);
  }

  @Post('rates/calculate')
  async calculateRates(@Body() rateRequest: any) {
    return this.logisticsService.calculateRates(rateRequest);
  }

  @Post('shipments/:id/label')
  async generateLabel(@Param('id') id: string, @Body() labelOptions: any) {
    return this.logisticsService.generateLabel(id, labelOptions);
  }

  @Get('shipments/:id/label/download')
  async downloadLabel(@Param('id') id: string) {
    return this.logisticsService.downloadLabel(id);
  }

  @Post('shipments/:id/pickup')
  async schedulePickup(@Param('id') id: string, @Body() pickupData: any) {
    return this.logisticsService.schedulePickup(id, pickupData);
  }

  @Post('shipments/:id/delivery')
  async confirmDelivery(@Param('id') id: string, @Body() deliveryData: any) {
    return this.logisticsService.confirmDelivery(id, deliveryData);
  }

  @Get('warehouses')
  async getWarehouses(@Query() query: any) {
    return this.logisticsService.getWarehouses(query);
  }

  @Get('warehouses/:id/inventory')
  async getWarehouseInventory(@Param('id') id: string) {
    return this.logisticsService.getWarehouseInventory(id);
  }

  @Post('warehouses/:id/inventory/update')
  async updateInventory(@Param('id') id: string, @Body() inventoryData: any) {
    return this.logisticsService.updateInventory(id, inventoryData);
  }

  @Get('routes/optimize')
  async optimizeRoutes(@Query() query: any) {
    return this.logisticsService.optimizeRoutes(query);
  }

  @Get('analytics/shipping')
  async getShippingAnalytics(@Query() query: any) {
    return this.logisticsService.getShippingAnalytics(query);
  }

  @Get('reports/delivery')
  async getDeliveryReport(@Query() query: any) {
    return this.logisticsService.getDeliveryReport(query);
  }

  @Post('webhooks/carrier')
  async handleCarrierWebhook(@Body() webhookData: any) {
    return this.logisticsService.handleCarrierWebhook(webhookData);
  }

  @Get('zones/shipping')
  async getShippingZones() {
    return this.logisticsService.getShippingZones();
  }

  @Get('zones/:zoneId/rates')
  async getZoneRates(@Param('zoneId') zoneId: string) {
    return this.logisticsService.getZoneRates(zoneId);
  }
} 