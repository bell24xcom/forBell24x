import { IsString, IsArray, IsOptional, IsNumber, IsEnum, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { RFQPriority } from '../../entities/rfq.entity';

export class CreateRFQDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsEnum(RFQPriority)
  priority?: RFQPriority;

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