import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class SubmitProposalDto {
  @IsString()
  proposal: string;

  @IsNumber()
  price: number;

  @IsString()
  deliveryTime: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    currency?: string;
    paymentTerms?: string;
    warranty?: string;
    [key: string]: any;
  };
} 