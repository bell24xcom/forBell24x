import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Supplier } from './supplier.entity';
import { Document } from './document.entity';

export enum RFQStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
}

export enum RFQPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('rfqs')
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  requirements: string[];

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({
    type: 'enum',
    enum: RFQStatus,
    default: RFQStatus.DRAFT,
  })
  status: RFQStatus;

  @Column({
    type: 'enum',
    enum: RFQPriority,
    default: RFQPriority.MEDIUM,
  })
  priority: RFQPriority;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  awardedAt: Date;

  @Column('simple-array', { nullable: true })
  matchedSupplierIds: string[];

  @Column('jsonb', { nullable: true })
  proposalScores: {
    [proposalId: string]: {
      score: number;
      details: any;
    };
  };

  @Column('jsonb', { nullable: true })
  metadata: {
    industry?: string;
    location?: string;
    certifications?: string[];
    [key: string]: any;
  };

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ nullable: true })
  encryptionKey: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  proposalCount: number;

  @Column({ nullable: true })
  awardedSupplierId: string;

  @Column('jsonb', { nullable: true })
  workflowState: {
    currentStep: string;
    history: Array<{
      step: string;
      timestamp: Date;
      userId: string;
      notes?: string;
    }>;
  };

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @Column()
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;

  @OneToMany(() => Document, (document) => document.rfq)
  documents: Document[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  deletedById: string;

  @Column('jsonb', { nullable: true })
  auditLog: Array<{
    action: string;
    timestamp: Date;
    userId: string;
    details: any;
  }>;
} 