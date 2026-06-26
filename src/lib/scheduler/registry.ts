/**
 * Job Registry
 * 
 * Central registry for all automation jobs.
 * Jobs are defined here with their metadata, independent of scheduler implementation.
 */

import { JobDefinition, JobRegistry } from './types';

// Define all VyaparSethu automation jobs
const JOBS: JobDefinition[] = [
  {
    id: 'expire-rfqs',
    name: 'Expire RFQs',
    description: 'Mark expired RFQs as closed',
    endpoint: '/api/cron/expire-rfqs',
    schedule: '0 2 * * *',
    enabled: true,
    retryCount: 3,
    timeoutSeconds: 60,
  },
  {
    id: 'supplier-drip',
    name: 'Supplier Drip Campaign',
    description: 'Send day 3/7/14 supplier onboarding drips',
    endpoint: '/api/cron/supplier-drip',
    schedule: '0 3 * * *',
    enabled: true,
    retryCount: 3,
    timeoutSeconds: 120,
  },
  {
    id: 'follow-up-due',
    name: 'Follow-up Due',
    description: 'Process day 2/5 RFQ follow-ups',
    endpoint: '/api/cron/follow-up-due',
    schedule: '0 4 * * *',
    enabled: true,
    retryCount: 3,
    timeoutSeconds: 60,
  },
  {
    id: 'demand-loop',
    name: 'Demand Loop Analysis',
    description: 'Analyze demand patterns and trigger alerts',
    endpoint: '/api/cron/demand-loop',
    schedule: '0 5 * * *',
    enabled: true,
    retryCount: 3,
    timeoutSeconds: 120,
  },
  {
    id: 'analyze-behavior',
    name: 'Behavior Analysis',
    description: 'Analyze user behavior for insights',
    endpoint: '/api/cron/analyze-behavior',
    schedule: '0 6 * * *',
    enabled: true,
    retryCount: 2,
    timeoutSeconds: 300,
  },
  {
    id: 'update-insights',
    name: 'Update Insights',
    description: 'Update dashboard insights and metrics',
    endpoint: '/api/cron/update-insights',
    schedule: '0 7 * * *',
    enabled: true,
    retryCount: 3,
    timeoutSeconds: 60,
  },
  {
    id: 'churn-check',
    name: 'Churn Risk Check',
    description: 'Identify and flag at-risk users',
    endpoint: '/api/cron/churn-check',
    schedule: '0 3 * * 1', // Mondays
    enabled: true,
    retryCount: 2,
    timeoutSeconds: 60,
  },
  {
    id: 'weekly-digest',
    name: 'Weekly Digest',
    description: 'Send weekly summary emails to suppliers',
    endpoint: '/api/cron/weekly-digest',
    schedule: '0 4 * * 1', // Mondays
    enabled: true,
    retryCount: 3,
    timeoutSeconds: 300,
  },
  {
    id: 'morning-brief-refresh',
    name: 'Morning Brief Refresh',
    description: 'Refresh morning brief cache',
    endpoint: '/api/admin/morning-brief',
    schedule: '0 1 * * *',
    enabled: true,
    retryCount: 2,
    timeoutSeconds: 120,
  },
  // Future jobs (not yet implemented)
  {
    id: 'seo-crawl',
    name: 'SEO Crawl',
    description: 'Crawl site for SEO analysis',
    endpoint: '/api/admin/seo/crawl',
    enabled: false,
    retryCount: 3,
    timeoutSeconds: 600,
  },
  {
    id: 'gsc-sync',
    name: 'Search Console Sync',
    description: 'Sync Google Search Console data',
    endpoint: '/api/admin/seo/gsc',
    enabled: false,
    retryCount: 3,
    timeoutSeconds: 300,
  },
];

class InMemoryJobRegistry implements JobRegistry {
  private jobs = new Map<string, JobDefinition>(JOBS.map(j => [j.id, j]));

  getJob(id: string): JobDefinition | undefined {
    return this.jobs.get(id);
  }

  listJobs(): JobDefinition[] {
    return Array.from(this.jobs.values());
  }

  registerJob(job: JobDefinition): void {
    this.jobs.set(job.id, job);
  }
}

export const jobRegistry = new InMemoryJobRegistry();
