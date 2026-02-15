import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EscrowService } from '../../core/escrow/escrow.service';
import { CreateEscrowDto, ReleaseEscrowDto, RefundEscrowDto } from '../../core/escrow/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('escrow')
@UseGuards(AuthGuard)
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Get()
  async getAllEscrows(@Query() query: any) {
    return this.escrowService.getAllEscrows(query);
  }

  @Get(':id')
  async getEscrow(@Param('id') id: string) {
    return this.escrowService.getEscrowById(id);
  }

  @Get('rfq/:rfqId')
  async getEscrowByRFQ(@Param('rfqId') rfqId: string) {
    return this.escrowService.getEscrowByRFQ(rfqId);
  }

  @Get('user/:userId')
  async getUserEscrows(@Param('userId') userId: string) {
    return this.escrowService.getEscrowsByUser(userId);
  }

  @Post()
  async createEscrow(@Body() dto: CreateEscrowDto) {
    return this.escrowService.createEscrow(dto);
  }

  @Post(':id/release')
  async releaseEscrow(@Param('id') id: string, @Body() dto: ReleaseEscrowDto) {
    return this.escrowService.releaseEscrow(id, dto);
  }

  @Post(':id/refund')
  async refundEscrow(@Param('id') id: string, @Body() dto: RefundEscrowDto) {
    return this.escrowService.refundEscrow(id, dto);
  }

  @Post(':id/dispute')
  async disputeEscrow(@Param('id') id: string, @Body() disputeData: any) {
    return this.escrowService.disputeEscrow(id, disputeData);
  }

  @Post(':id/resolve-dispute')
  @UseGuards(RoleGuard)
  async resolveDispute(@Param('id') id: string, @Body() resolution: any) {
    return this.escrowService.resolveDispute(id, resolution);
  }

  @Get(':id/status')
  async getEscrowStatus(@Param('id') id: string) {
    return this.escrowService.getEscrowStatus(id);
  }

  @Get(':id/transactions')
  async getEscrowTransactions(@Param('id') id: string) {
    return this.escrowService.getEscrowTransactions(id);
  }

  @Post(':id/extend')
  async extendEscrow(@Param('id') id: string, @Body() extensionData: any) {
    return this.escrowService.extendEscrow(id, extensionData);
  }

  @Post(':id/cancel')
  async cancelEscrow(@Param('id') id: string, @Body() cancellationData: any) {
    return this.escrowService.cancelEscrow(id, cancellationData);
  }

  @Get(':id/razorpayx-details')
  async getRazorpayXDetails(@Param('id') id: string) {
    return this.escrowService.getRazorpayXDetails(id);
  }

  @Post(':id/sync-razorpayx')
  async syncRazorpayX(@Param('id') id: string) {
    return this.escrowService.syncWithRazorpayX(id);
  }

  @Get('analytics/summary')
  async getEscrowAnalytics(@Query() query: any) {
    return this.escrowService.getAnalytics(query);
  }
} 