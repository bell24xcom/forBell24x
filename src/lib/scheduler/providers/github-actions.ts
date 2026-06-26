/**
 * GitHub Actions Scheduler Provider
 *
 * Uses GitHub Actions workflows as the scheduler.
 * This is the current production scheduler for VyaparSethu.
 *
 * Note: This provider does not actually trigger workflows directly
 * (that requires GitHub API authentication). Instead, it provides
 * metadata about jobs that are scheduled via GitHub Actions.
 */

import { JobDefinition, JobExecution, SchedulerProvider } from '../types';

export class GitHubActionsSchedulerProvider implements SchedulerProvider {
  name = 'github-actions';

  async executeJob(job: JobDefinition): Promise<JobExecution> {
    // GitHub Actions workflows are triggered by:
    // 1. Schedule (cron)
    // 2. Manual trigger (workflow_dispatch)
    // 3. API call to GitHub API (requires token)
    
    // This implementation documents the execution
    // but actual triggering happens via GitHub's infrastructure
    
    const execution: JobExecution = {
      id: `gha-${Date.now()}`,
      jobId: job.id,
      status: 'pending',
      trigger: 'schedule',
      retryCount: 0,
      schedulerProvider: this.name,
      metadata: {
        workflow: `.github/workflows/${job.schedule ? 'daily-cron' : 'manual-job'}.yml`,
        note: 'Job is managed by GitHub Actions. View runs at: https://github.com/bell24xcom/forBell24x/actions',
      },
    };

    return execution;
  }

  async getStatus(executionId: string): Promise<JobExecution | null> {
    // Would need GitHub API integration to fetch real status
    // For now, return null indicating external tracking
    return null;
  }

  async listExecutions(jobId: string, limit: number): Promise<JobExecution[]> {
    // Would need GitHub API integration
    // For now, return empty array
    return [];
  }
}

export const githubActionsScheduler = new GitHubActionsSchedulerProvider();
