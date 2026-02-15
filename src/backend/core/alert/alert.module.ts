import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AlertService } from '../services/alert.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {} 