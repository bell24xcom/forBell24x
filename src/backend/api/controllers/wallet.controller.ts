import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WalletService } from '../../core/wallet/wallet.service';
import { CreateWalletDto, DepositDto, WithdrawDto, TransferDto } from '../../core/wallet/dto';
import { AuthGuard } from '../middleware/auth.guard';
import { RoleGuard } from '../middleware/role.guard';

@Controller('wallet')
@UseGuards(AuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getAllWallets(@Query() query: any) {
    return this.walletService.getAllWallets(query);
  }

  @Get(':id')
  async getWallet(@Param('id') id: string) {
    return this.walletService.getWalletById(id);
  }

  @Get('user/:userId')
  async getUserWallet(@Param('userId') userId: string) {
    return this.walletService.getWalletByUserId(userId);
  }

  @Post()
  @UseGuards(RoleGuard)
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto);
  }

  @Post(':id/deposit')
  async deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    return this.walletService.deposit(id, dto);
  }

  @Post(':id/withdraw')
  async withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(id, dto);
  }

  @Post(':id/transfer')
  async transfer(@Param('id') id: string, @Body() dto: TransferDto) {
    return this.walletService.transfer(id, dto);
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string) {
    return this.walletService.getBalance(id);
  }

  @Get(':id/transactions')
  async getTransactions(@Param('id') id: string, @Query() query: any) {
    return this.walletService.getTransactions(id, query);
  }

  @Get(':id/statement')
  async getStatement(@Param('id') id: string, @Query() query: any) {
    return this.walletService.getStatement(id, query);
  }

  @Post(':id/freeze')
  @UseGuards(RoleGuard)
  async freezeWallet(@Param('id') id: string) {
    return this.walletService.freezeWallet(id);
  }

  @Post(':id/unfreeze')
  @UseGuards(RoleGuard)
  async unfreezeWallet(@Param('id') id: string) {
    return this.walletService.unfreezeWallet(id);
  }

  @Get(':id/razorpayx-account')
  async getRazorpayXAccount(@Param('id') id: string) {
    return this.walletService.getRazorpayXAccount(id);
  }

  @Post(':id/sync-razorpayx')
  async syncRazorpayX(@Param('id') id: string) {
    return this.walletService.syncWithRazorpayX(id);
  }
} 