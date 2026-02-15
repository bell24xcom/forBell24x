import { IsNumber, IsEnum, IsString, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AccountDetailsDto {
  @IsString()
  accountNumber: string;

  @IsString()
  @IsOptional()
  ifscCode?: string;

  @IsString()
  @IsOptional()
  accountHolderName?: string;

  @IsString()
  @IsOptional()
  upiId?: string;
}

export class WithdrawDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(['INR', 'USD', 'EUR', 'GBP'])
  @IsOptional()
  currency?: string = 'INR';

  @IsEnum(['bank_transfer', 'upi'])
  method: string;

  @ValidateNested()
  @Type(() => AccountDetailsDto)
  accountDetails: AccountDetailsDto;

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