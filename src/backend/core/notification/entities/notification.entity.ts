import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['error', 'warning', 'info'],
  })
  type: 'error' | 'warning' | 'info';

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('text', { array: true })
  channels: string[];

  @Column({
    type: 'enum',
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  })
  status: 'sent' | 'failed' | 'pending';

  @CreateDateColumn()
  timestamp: Date;
} 