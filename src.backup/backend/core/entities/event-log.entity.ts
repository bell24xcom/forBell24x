import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { EventType } from '../services/event.service';

@Entity('event_logs')
export class EventLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: [
      'rfq.created',
      'rfq.updated',
      'rfq.completed',
      'escrow.created',
      'escrow.released',
      'user.registered',
      'user.updated',
      'transaction.created',
      'transaction.completed',
    ],
  })
  eventType: EventType;

  @Column('jsonb')
  data: any;

  @Column({
    type: 'enum',
    enum: ['success', 'error'],
  })
  status: 'success' | 'error';

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn()
  timestamp: Date;
} 