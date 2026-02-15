import { Controller, Post, Body } from '@nestjs/common';
import { RazorpayService } from '../services/payment/razorpay.service';
import { WalletService } from '../services/wallet/wallet.service';

type CreatePaymentDto = {
  userId: string;
  amount: number;
  currency?: string;
};

type ConfirmPaymentDto = {
  paymentId: string;
  userId: string;
  amount: number;
};

type RollbackDto = {
  transactionId: string;
};

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly razorpayService: RazorpayService,
    private readonly walletService: WalletService,
  ) {}

  @Post('initiate')
  async initiatePayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const payment = await this.razorpayService.createPayment({
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'INR',
      });
      return {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
      };
    } catch (error) {
      throw new Error(`Payment initiation failed: ${error.message}`);
    }
  }

  @Post('confirm')
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    try {
      const isValid = await this.razorpayService.verifyPayment(confirmPaymentDto.paymentId);
      if (!isValid) {
        throw new Error('Payment verification failed');
      }

      await this.walletService.createTransaction({
        userId: confirmPaymentDto.userId,
        amount: confirmPaymentDto.amount,
        type: 'credit',
        description: `Payment from Razorpay: ${confirmPaymentDto.paymentId}`,
      });

      return { status: 'success' };
    } catch (error) {
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  @Post('rollback')
  async rollbackTransaction(@Body() rollbackDto: RollbackDto) {
    try {
      await this.walletService.rollbackTransaction(rollbackDto.transactionId);
      return { status: 'rollback_success' };
    } catch (error) {
      throw new Error(`Transaction rollback failed: ${error.message}`);
    }
  }
}
