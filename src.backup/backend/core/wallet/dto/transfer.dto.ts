import { IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';

export class TransferDto {
  @IsString()
  toWalletId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(['INR', 'USD', 'EUR', 'GBP'])
  @IsOptional()
  currency?: string = 'INR';

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  metadata?: any;
} 