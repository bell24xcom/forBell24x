/**
 * Scheduler Module
 *
 * Central export point for all scheduler functionality.
 * Business logic should use this module, not specific providers.
 */

export * from './types';
export * from './registry';
export { manualScheduler } from './providers/manual';
export { githubActionsScheduler } from './providers/github-actions';

import { jobRegistry } from './registry';
import { manualScheduler } from './providers/manual';
import { githubActionsScheduler } from './providers/github-actions';
import { JobDefinition, JobExecution, SchedulerProvider } from './types';

/**
 * Default scheduler provider
 * Currently uses manual scheduler for direct API calls
 * GitHub Actions handles scheduled execution
 */
export const defaultScheduler: SchedulerProvider = manualScheduler;

/**
 * Execute a job by ID
 */
export async function executeJob(jobId: string): Promise<JobExecution | null> {
  const job = jobRegistry.getJob(jobId);
  if (!job || !job.enabled) {
    return null;
  }

  return defaultScheduler.executeJob(job);
}

/**
 * List all registered jobs
 */
export function listJobs(): JobDefinition[] {
  return jobRegistry.listJobs();
}

/**
 * Get job by ID
 */
export function getJob(jobId: string): JobDefinition | undefined {
  return jobRegistry.getJob(jobId);
}

/**
 * Get current scheduler info
 */
export function getSchedulerInfo() {
  return {
    current: defaultScheduler.name,
    available: [
      'manual',
      'github-actions',
      'vercel-cron',
      // Future:
      // 'trigger-dev',
      // 'upstash-qstash',
      // 'kubernetes',
    ],
    migrationPath: [
      'manual (dev) →',
      'vercel-cron (hobby, limited) →',
      'github-actions (current) →',
      'trigger-dev (future)',
    ],
  };
}
