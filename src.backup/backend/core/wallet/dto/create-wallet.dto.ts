import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  userId: string;

  @IsEnum(['INR', 'USD', 'EUR', 'GBP'])
  @IsOptional()
  currency?: string = 'INR';

  @IsString()
  @IsOptional()
  type?: string = 'individual';

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  initialBalance?: number = 0;

  @IsString()
  @IsOptional()
  metadata?: any;
} 