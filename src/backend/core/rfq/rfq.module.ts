import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RFQ } from '../entities/rfq.entity';
import { RFQService } from './rfq.service';
import { RFQController } from './rfq.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RFQ]),
    EventsModule,
  ],
  providers: [RFQService],
  controllers: [RFQController],
  exports: [RFQService],
})
export class RFQModule {} 