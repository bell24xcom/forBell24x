import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SupplierService } from '../../core/supplier/supplier.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierSearchDto } from '../../core/supplier/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('supplier')
@UseGuards(AuthGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  async getAllSuppliers(@Query() query: SupplierSearchDto) {
    return this.supplierService.getAllSuppliers(query);
  }

  @Get(':id')
  async getSupplier(@Param('id') id: string) {
    return this.supplierService.getSupplierById(id);
  }

  @Post()
  @UseGuards(RoleGuard)
  async createSupplier(@Body() dto: CreateSupplierDto) {
    return this.supplierService.createSupplier(dto);
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  async updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.updateSupplier(id, dto);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  async deleteSupplier(@Param('id') id: string) {
    return this.supplierService.deleteSupplier(id);
  }

  @Get(':id/qualification')
  async getSupplierQualification(@Param('id') id: string) {
    return this.supplierService.getQualificationStatus(id);
  }

  @Post(':id/qualify')
  @UseGuards(RoleGuard)
  async qualifySupplier(@Param('id') id: string, @Body() qualificationData: any) {
    return this.supplierService.qualifySupplier(id, qualificationData);
  }

  @Get(':id/performance')
  async getSupplierPerformance(@Param('id') id: string) {
    return this.supplierService.getPerformanceMetrics(id);
  }

  @Get(':id/compliance')
  async getSupplierCompliance(@Param('id') id: string) {
    return this.supplierService.getComplianceStatus(id);
  }

  @Post('search')
  async searchSuppliers(@Body() searchCriteria: any) {
    return this.supplierService.searchSuppliers(searchCriteria);
  }

  @Get(':id/risk-assessment')
  async getRiskAssessment(@Param('id') id: string) {
    return this.supplierService.getRiskAssessment(id);
  }
} 