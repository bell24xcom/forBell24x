import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class EvaluateProposalDto {
  @IsNumber()
  score: number;

  @IsObject()
  criteria: Record<string, {
    score: number;
    comments: string;
  }>;

  @IsOptional()
  @IsString()
  notes?: string;
} 