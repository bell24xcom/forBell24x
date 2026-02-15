import { IsString, IsArray, IsOptional, IsNumber, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { RFQPriority, RFQStatus } from '../../entities/rfq.entity';

export class UpdateRFQDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsEnum(RFQPriority)
  priority?: RFQPriority;

  @IsOptional()
  @IsEnum(RFQStatus)
  status?: RFQStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @IsOptional()
  metadata?: {
    industry?: string;
    location?: string;
    certifications?: string[];
    [key: string]: any;
  };
} 