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
import { RFQ } from './rfq.entity';
import { Supplier } from './supplier.entity';
import { Document } from './document.entity';

export enum ProposalStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RFQ)
  @JoinColumn({ name: 'rfqId' })
  rfq: RFQ;

  @Column()
  rfqId: string;

  @ManyToOne(() => Supplier)
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  supplierId: string;

  @Column('text')
  proposal: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  deliveryTime: string;

  @Column('text', { nullable: true })
  additionalNotes: string;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.DRAFT,
  })
  status: ProposalStatus;

  @Column('jsonb', { nullable: true })
  evaluation: {
    score: number;
    criteria: {
      [key: string]: {
        score: number;
        comments: string;
      };
    };
    reviewerId: string;
    reviewedAt: Date;
  };

  @Column('jsonb', { nullable: true })
  metadata: {
    currency?: string;
    paymentTerms?: string;
    warranty?: string;
    [key: string]: any;
  };

  @Column({ default: false })
  isEncrypted: boolean;

  @Column({ nullable: true })
  encryptionKey: string;

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

  @OneToMany(() => Document, (document) => document.proposal)
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

  @Column('jsonb', { nullable: true })
  revisions: Array<{
    version: number;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    timestamp: Date;
    userId: string;
  }>;

  @Column('jsonb', { nullable: true })
  communication: Array<{
    type: 'message' | 'question' | 'clarification';
    content: string;
    timestamp: Date;
    userId: string;
    isInternal: boolean;
  }>;
} 