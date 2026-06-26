/**
 * Scheduler Abstraction Layer
 * 
 * This module provides interfaces for job scheduling that are
 * independent of the underlying scheduler implementation.
 * 
 * Current implementations:
 * - ManualTrigger: Direct API calls
 * - VercelCron: Vercel Cron (limited to 2 jobs on Hobby)
 * - GitHubActions: GitHub Actions workflows (current)
 * 
 * Future implementations:
 * - TriggerDev: Trigger.dev for durable jobs
 * - UpstashQStash: Upstash QStash for serverless queues
 * - KubernetesJobs: Kubernetes CronJobs
 */

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobTrigger = 'manual' | 'schedule' | 'api' | 'webhook';

export interface JobDefinition {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  schedule?: string; // Cron expression
  enabled: boolean;
  retryCount: number;
  timeoutSeconds: number;
}

export interface JobExecution {
  id: string;
  jobId: string;
  status: JobStatus;
  trigger: JobTrigger;
  startedAt?: Date;
  finishedAt?: Date;
  durationMs?: number;
  retryCount: number;
  error?: string;
  metadata?: Record<string, unknown>;
  schedulerProvider: string;
}

export interface SchedulerProvider {
  name: string;
  
  /**
   * Execute a job immediately
   */
  executeJob(job: JobDefinition): Promise<JobExecution>;
  
  /**
   * Get job execution status
   */
  getStatus(executionId: string): Promise<JobExecution | null>;
  
  /**
   * List recent executions for a job
   */
  listExecutions(jobId: string, limit: number): Promise<JobExecution[]>;
  
  /**
   * Cancel a running job (if supported)
   */
  cancel?(executionId: string): Promise<boolean>;
  
  /**
   * Retry a failed job
   */
  retry?(executionId: string): Promise<JobExecution | null>;
}

export interface JobRegistry {
  getJob(id: string): JobDefinition | undefined;
  listJobs(): JobDefinition[];
  registerJob(job: JobDefinition): void;
}
