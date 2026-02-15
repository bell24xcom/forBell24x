import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { WalletService } from '../wallet/wallet.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [RazorpayService, WalletService, PrismaService],
  exports: [RazorpayService, WalletService],
})
export class PaymentModule {}
