/**
 * Manual Scheduler Provider
 *
 * Allows direct execution of jobs via API calls.
 * Used for:
 * - Manual admin triggers
 * - Development/testing
 * - Emergency job execution
 */

import { JobDefinition, JobExecution, JobStatus, SchedulerProvider } from '../types';

export class ManualSchedulerProvider implements SchedulerProvider {
  name = 'manual';
  private executions = new Map<string, JobExecution>();
  private executionCounter = 0;

  async executeJob(job: JobDefinition): Promise<JobExecution> {
    const execution: JobExecution = {
      id: `manual-${++this.executionCounter}`,
      jobId: job.id,
      status: 'pending',
      trigger: 'manual',
      retryCount: 0,
      schedulerProvider: this.name,
    };

    this.executions.set(execution.id, execution);

    try {
      execution.status = 'running';
      execution.startedAt = new Date();

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vyaparsethu.com';
      const cronSecret = process.env.CRON_SECRET;

      if (!cronSecret) {
        throw new Error('CRON_SECRET not configured');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), job.timeoutSeconds * 1000);

      const response = await fetch(`${baseUrl}${job.endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      execution.finishedAt = new Date();
      execution.durationMs = execution.finishedAt.getTime() - execution.startedAt.getTime();

      if (response.ok) {
        execution.status = 'completed';
        execution.metadata = { statusCode: response.status };
      } else {
        execution.status = 'failed';
        execution.error = `HTTP ${response.status}: ${await response.text()}`;
      }
    } catch (error) {
      execution.status = 'failed';
      execution.finishedAt = new Date();
      execution.error = error instanceof Error ? error.message : String(error);
      if (execution.startedAt) {
        execution.durationMs = execution.finishedAt.getTime() - execution.startedAt.getTime();
      }
    }

    this.executions.set(execution.id, execution);
    return execution;
  }

  async getStatus(executionId: string): Promise<JobExecution | null> {
    return this.executions.get(executionId) || null;
  }

  async listExecutions(jobId: string, limit: number): Promise<JobExecution[]> {
    return Array.from(this.executions.values())
      .filter(e => e.jobId === jobId)
      .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0))
      .slice(0, limit);
  }

  async retry(executionId: string): Promise<JobExecution | null> {
    const execution = this.executions.get(executionId);
    if (!execution) return null;

    // Get the job definition from the registry
    const { jobRegistry } = await import('../registry');
    const job = jobRegistry.getJob(execution.jobId);
    if (!job) return null;

    return this.executeJob(job);
  }
}

export const manualScheduler = new ManualSchedulerProvider();
