import { IsNumber, IsEnum, IsString, IsOptional, Min } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(['INR', 'USD', 'EUR', 'GBP'])
  @IsOptional()
  currency?: string = 'INR';

  @IsEnum(['razorpayx', 'bank_transfer', 'upi', 'card'])
  method: string;

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