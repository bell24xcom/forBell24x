import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { EventService } from '../services/event.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [EventService],
  exports: [EventService],
})
export class EventsModule {} 