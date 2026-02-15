import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RFQService } from './rfq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { SubmitProposalDto } from './dto/submit-proposal.dto';
import { EvaluateProposalDto } from './dto/evaluate-proposal.dto';

@Controller('rfq')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @Post()
  @Roles(UserRole.BUYER)
  async createRFQ(@Body() createRFQDto: CreateRFQDto, @Request() req) {
    try {
      return await this.rfqService.createRFQ(createRFQDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create RFQ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @Roles(UserRole.BUYER, UserRole.SUPPLIER)
  async getRFQs(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req,
  ) {
    try {
      return await this.rfqService.getRFQs(
        {
          status,
          category,
          page: Number(page),
          limit: Number(limit),
        },
        req.user,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch RFQs',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  @Roles(UserRole.BUYER, UserRole.SUPPLIER)
  async getRFQDetails(@Param('id') id: string, @Request() req) {
    try {
      return await this.rfqService.getRFQDetails(id, req.user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch RFQ details',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put(':id')
  @Roles(UserRole.BUYER)
  async updateRFQ(
    @Param('id') id: string,
    @Body() updateRFQDto: UpdateRFQDto,
    @Request() req,
  ) {
    try {
      return await this.rfqService.updateRFQ(id, updateRFQDto, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update RFQ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @Roles(UserRole.BUYER)
  async deleteRFQ(@Param('id') id: string, @Request() req) {
    try {
      return await this.rfqService.deleteRFQ(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete RFQ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/publish')
  @Roles(UserRole.BUYER)
  async publishRFQ(@Param('id') id: string, @Request() req) {
    try {
      return await this.rfqService.publishRFQ(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to publish RFQ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/close')
  @Roles(UserRole.BUYER)
  async closeRFQ(@Param('id') id: string, @Request() req) {
    try {
      return await this.rfqService.closeRFQ(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to close RFQ',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/proposals')
  @Roles(UserRole.SUPPLIER)
  async submitProposal(
    @Param('id') id: string,
    @Body() submitProposalDto: SubmitProposalDto,
    @Request() req,
  ) {
    try {
      return await this.rfqService.submitProposal(
        id,
        submitProposalDto,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to submit proposal',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/proposals')
  @Roles(UserRole.BUYER)
  async getProposals(@Param('id') id: string, @Request() req) {
    try {
      return await this.rfqService.getProposals(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch proposals',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/proposals/:proposalId/evaluate')
  @Roles(UserRole.BUYER)
  async evaluateProposal(
    @Param('id') id: string,
    @Param('proposalId') proposalId: string,
    @Body() evaluateProposalDto: EvaluateProposalDto,
    @Request() req,
  ) {
    try {
      return await this.rfqService.evaluateProposal(
        id,
        proposalId,
        evaluateProposalDto,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to evaluate proposal',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/award/:proposalId')
  @Roles(UserRole.BUYER)
  async awardProposal(
    @Param('id') id: string,
    @Param('proposalId') proposalId: string,
    @Request() req,
  ) {
    try {
      return await this.rfqService.awardProposal(id, proposalId, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to award proposal',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/stats')
  @Roles(UserRole.BUYER)
  async getRFQStats(@Param('id') id: string, @Request() req) {
    try {
      return await this.rfqService.getRFQStats(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch RFQ stats',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/audit-log')
  @Roles(UserRole.BUYER)
  async getRFQAuditLog(@Param('id') id: string, @Request() req) {
    try {
      return await this.rfqService.getRFQAuditLog(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch RFQ audit log',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 