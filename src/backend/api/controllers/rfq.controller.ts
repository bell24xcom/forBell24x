import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { RFQService } from '../../core/rfq/rfq.service';
import { CreateRFQDto } from '../../core/rfq/dto/create-rfq.dto';
import { SubmitProposalDto } from '../../core/rfq/dto/submit-proposal.dto';
import { EvaluateProposalDto } from '../../core/rfq/dto/evaluate-proposal.dto';
import { processVoiceRFQ } from '../../../server/openai';

@Controller('rfq')
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @Get(':id')
  async getRFQ(@Param('id') id: string) {
    try {
      return await this.rfqService.getRFQById(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get()
  async listRFQs(@Query() query: any) {
    try {
      return await this.rfqService.listRFQs(query);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  async createRFQ(@Body() dto: CreateRFQDto) {
    try {
      return await this.rfqService.createRFQ(dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async updateRFQ(@Param('id') id: string, @Body() dto: Partial<CreateRFQDto>) {
    try {
      return await this.rfqService.updateRFQ(id, dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async deleteRFQ(@Param('id') id: string) {
    try {
      return await this.rfqService.deleteRFQ(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/match')
  async matchSuppliers(@Param('id') id: string) {
    try {
      return await this.rfqService.findMatchingSuppliers(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/proposal')
  async submitProposal(@Param('id') id: string, @Body() dto: SubmitProposalDto) {
    try {
      return await this.rfqService.submitProposal({ ...dto, rfqId: id });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/evaluate')
  async evaluateProposals(@Param('id') id: string) {
    try {
      return await this.rfqService.evaluateProposals(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('voice')
  async voiceRFQ(@Body() body: { audioBase64: string; languagePreference?: string }) {
    try {
      const { audioBase64, languagePreference } = body;
      const result = await processVoiceRFQ(audioBase64, languagePreference);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
} 