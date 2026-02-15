import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLog } from '../entities/event-log.entity';
import { MonitoringService } from '../services/monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { AlertModule } from '../alert/alert.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventLog]),
    AlertModule,
    NotificationModule,
  ],
  providers: [MonitoringService],
  controllers: [MonitoringController],
  exports: [MonitoringService],
})
export class MonitoringModule {} 