import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DiscordService } from '../services/discord.service';
import { TeamsService } from '../services/teams.service';
import { SlackService } from '../services/slack.service';
import { EmailService } from '../services/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    NotificationService,
    DiscordService,
    TeamsService,
    SlackService,
    EmailService,
  ],
  controllers: [NotificationController],
  exports: [
    NotificationService,
    DiscordService,
    TeamsService,
    SlackService,
    EmailService,
  ],
})
export class NotificationModule {} 