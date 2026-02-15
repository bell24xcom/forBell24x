import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PaymentService } from '../../core/payment/payment.service';
import { CreatePaymentDto, PaymentWebhookDto } from '../../core/payment/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('payment')
@UseGuards(AuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async getAllPayments(@Query() query: any) {
    return this.paymentService.getAllPayments(query);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string) {
    return this.paymentService.getPaymentById(id);
  }

  @Get('user/:userId')
  async getUserPayments(@Param('userId') userId: string) {
    return this.paymentService.getPaymentsByUser(userId);
  }

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  @Post('razorpayx/initiate')
  async initiateRazorpayXPayment(@Body() paymentData: any) {
    return this.paymentService.initiateRazorpayXPayment(paymentData);
  }

  @Post('razorpayx/verify')
  async verifyRazorpayXPayment(@Body() verificationData: any) {
    return this.paymentService.verifyRazorpayXPayment(verificationData);
  }

  @Post('webhook/razorpayx')
  async razorpayXWebhook(@Body() webhookData: PaymentWebhookDto) {
    return this.paymentService.handleRazorpayXWebhook(webhookData);
  }

  @Post(':id/capture')
  async capturePayment(@Param('id') id: string, @Body() captureData: any) {
    return this.paymentService.capturePayment(id, captureData);
  }

  @Post(':id/refund')
  async refundPayment(@Param('id') id: string, @Body() refundData: any) {
    return this.paymentService.refundPayment(id, refundData);
  }

  @Get(':id/status')
  async getPaymentStatus(@Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id);
  }

  @Get(':id/transactions')
  async getPaymentTransactions(@Param('id') id: string) {
    return this.paymentService.getPaymentTransactions(id);
  }

  @Post(':id/cancel')
  async cancelPayment(@Param('id') id: string, @Body() cancellationData: any) {
    return this.paymentService.cancelPayment(id, cancellationData);
  }

  @Get('methods/available')
  async getAvailablePaymentMethods() {
    return this.paymentService.getAvailablePaymentMethods();
  }

  @Post('methods/add')
  async addPaymentMethod(@Body() methodData: any) {
    return this.paymentService.addPaymentMethod(methodData);
  }

  @Delete('methods/:id')
  async removePaymentMethod(@Param('id') id: string) {
    return this.paymentService.removePaymentMethod(id);
  }

  @Get('analytics/summary')
  async getPaymentAnalytics(@Query() query: any) {
    return this.paymentService.getAnalytics(query);
  }

  @Get('reports/transaction')
  async getTransactionReport(@Query() query: any) {
    return this.paymentService.getTransactionReport(query);
  }
} 