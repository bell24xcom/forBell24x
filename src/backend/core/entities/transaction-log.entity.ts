import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('transaction_logs')
export class TransactionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  type: string;

  @Column()
  @Index()
  status: string;

  @Column('jsonb')
  details: any;

  @Column({ nullable: true })
  @Index()
  correlationId: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  errorMessage: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  target: string;

  @Column({ type: 'int', nullable: true })
  processingTime: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  environment: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'boolean', default: false })
  isRetry: boolean;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
} 