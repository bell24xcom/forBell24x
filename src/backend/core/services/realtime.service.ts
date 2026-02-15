import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import { CloudConfigService } from '../config/cloud.config';
import { Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeService.name);
  private redisSubscriber: Redis;
  private redisPublisher: Redis;

  constructor(private readonly cloudConfig: CloudConfigService) {}

  async onModuleInit() {
    // Initialize Redis connections
    this.redisSubscriber = new Redis(this.cloudConfig.redisConfig);
    this.redisPublisher = new Redis(this.cloudConfig.redisConfig);

    // Subscribe to channels
    await this.redisSubscriber.subscribe('rfq-updates');
    await this.redisSubscriber.subscribe('escrow-updates');
    await this.redisSubscriber.subscribe('user-updates');

    // Handle Redis messages
    this.redisSubscriber.on('message', (channel, message) => {
      this.handleRedisMessage(channel, message);
    });

    this.logger.log('Realtime service initialized');
  }

  async onModuleDestroy() {
    await this.redisSubscriber.quit();
    await this.redisPublisher.quit();
    this.logger.log('Realtime service destroyed');
  }

  private handleRedisMessage(channel: string, message: string) {
    try {
      const data = JSON.parse(message);
      this.server.emit(channel, data);
    } catch (error) {
      this.logger.error(`Error handling Redis message: ${error.message}`);
    }
  }

  async publishRFQUpdate(data: any) {
    await this.redisPublisher.publish('rfq-updates', JSON.stringify(data));
  }

  async publishEscrowUpdate(data: any) {
    await this.redisPublisher.publish('escrow-updates', JSON.stringify(data));
  }

  async publishUserUpdate(data: any) {
    await this.redisPublisher.publish('user-updates', JSON.stringify(data));
  }

  async subscribeToChannel(channel: string, callback: (data: any) => void) {
    this.server.on('connection', (socket) => {
      socket.on(`subscribe:${channel}`, () => {
        socket.join(channel);
      });

      socket.on(`unsubscribe:${channel}`, () => {
        socket.leave(channel);
      });
    });
  }

  async broadcastToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  async broadcastToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  async broadcastToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  async broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
} 