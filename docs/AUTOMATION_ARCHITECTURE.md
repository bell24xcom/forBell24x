# VyaparSethu Automation Architecture

## Overview

VyaparSethu uses a **scheduler abstraction layer** that separates business logic from scheduling infrastructure. This allows the platform to evolve from simple cron jobs to a sophisticated job engine without rewriting business processes.

## Current Phase

### Phase 1: Stabilization (Current)
- **Scheduler:** GitHub Actions
- **Security:** CRON_SECRET required for all endpoints
- **Business Logic:** Inside API routes (`/api/cron/*`, `/api/admin/*`)
- **Admin:** `/admin/automation` dashboard

## Architecture Principles

1. **Business Logic in APIs** — All job logic lives in Next.js API routes
2. **Scheduler Agnostic** — Business code doesn't know which scheduler is calling it
3. **Flexible Scheduling** — Can switch schedulers without changing business logic
4. **Secure by Default** — All cron endpoints require `Authorization: Bearer CRON_SECRET`

## Scheduler Abstraction

### Interface

```typescript
interface SchedulerProvider {
  name: string;
  executeJob(job: JobDefinition): Promise<JobExecution>;
  getStatus(executionId: string): Promise<JobExecution | null>;
  listExecutions(jobId: string, limit: number): Promise<JobExecution[]>;
}
```

### Current Implementations

1. **ManualScheduler** — Direct API calls for ad-hoc execution
2. **GitHubActionsScheduler** — Metadata only (actual execution via GitHub infrastructure)

### Future Implementations

3. **TriggerDevScheduler** — Durable jobs with retries and timeouts
4. **UpstashQStashScheduler** — Serverless queue-based scheduling
5. **KubernetesScheduler** — Kubernetes CronJobs for self-hosted

## Migration Path

```
Manual (dev)
    ↓
Vercel Cron (hobby - limited to 2 jobs)
    ↓
GitHub Actions (current - unlimited jobs, free)
    ↓
Trigger.dev (future - durable jobs, better observability)
    ↓
Dedicated Job Engine (scale - custom queue + workers)
```

## Job Registry

All jobs are defined in `src/lib/scheduler/registry.ts`:

| Job ID | Name | Schedule | Endpoint |
|--------|------|----------|----------|
| expire-rfqs | Expire RFQs | Daily 2 AM | `/api/cron/expire-rfqs` |
| supplier-drip | Supplier Drip | Daily 3 AM | `/api/cron/supplier-drip` |
| follow-up-due | Follow-up Due | Daily 4 AM | `/api/cron/follow-up-due` |
| demand-loop | Demand Loop | Daily 5 AM | `/api/cron/demand-loop` |
| analyze-behavior | Behavior Analysis | Daily 6 AM | `/api/cron/analyze-behavior` |
| update-insights | Update Insights | Daily 7 AM | `/api/cron/update-insights` |
| churn-check | Churn Check | Mondays 3 AM | `/api/cron/churn-check` |
| weekly-digest | Weekly Digest | Mondays 4 AM | `/api/cron/weekly-digest` |
| morning-brief-refresh | Morning Brief | Daily 1 AM | `/api/admin/morning-brief` |

## GitHub Actions Workflows

### `daily-cron.yml`
Runs every day at 2 AM UTC:
- Expire RFQs
- Supplier Drip
- Follow-up Due
- Demand Loop
- Behavior Analysis
- Update Insights
- Morning Brief Refresh

### `weekly-cron.yml`
Runs every Monday at 3 AM UTC:
- Weekly Digest
- Churn Check

### `manual-job.yml`
Workflow dispatch for ad-hoc job execution via GitHub UI.

## Security

All cron endpoints require:
```
Authorization: Bearer CRON_SECRET
```

Without CRON_SECRET configured, all requests return HTTP 401.

### Configuration

Set in Vercel Environment Variables:
- `CRON_SECRET` — Secure random string
- `NEXT_PUBLIC_SITE_URL` — Production URL

Set in GitHub Repository Secrets:
- `CRON_SECRET` — Same as Vercel
- `SITE_URL` — Production URL

## Admin Dashboard

Access `/admin/automation` to:
- View all registered jobs
- See current scheduler provider
- Execute jobs manually (via ManualScheduler)
- View GitHub Actions workflow links

## Future Enhancements

### Phase 2: Trigger.dev (After 50+ suppliers)

When real operational patterns emerge:
- Migrate from GitHub Actions to Trigger.dev
- Gain durable execution, automatic retries
- Better observability and debugging
- Longer timeouts for complex jobs

### Phase 3: Dedicated Job Engine (Scale)

When volume requires it:
- Custom queue system (Bull MQ / RabbitMQ)
- Worker processes separate from web servers
- Advanced scheduling (priority, rate limiting)
- Real-time job monitoring

## Why GitHub Actions Now?

1. **Free** — No additional cost
2. **Unlimited Jobs** — Not limited by Vercel Hobby plan
3. **Visible Logs** — GitHub Actions UI shows history
4. **Manual Triggers** — workflow_dispatch for ad-hoc runs
5. **Easy Migration** — Can switch to Trigger.dev without code changes

## Key Files

- `src/lib/scheduler/types.ts` — Core interfaces
- `src/lib/scheduler/registry.ts` — Job definitions
- `src/lib/scheduler/providers/*.ts` — Scheduler implementations
- `src/app/api/admin/automation/jobs/route.ts` — Admin API
- `src/app/admin/automation/page.tsx` — Admin UI
- `.github/workflows/*.yml` — GitHub Actions workflows
- `lib/cronAuth.ts` — Authentication middleware

## Decision Log

| Decision | Rationale |
|----------|-----------|
| GitHub Actions over Vercel Cron | Unlimited jobs vs 2-job limit |
| No full Job Engine yet | Build after real operational patterns emerge |
| Business logic in API routes | Scheduler-agnostic architecture |
| CRON_SECRET required | Security by default |
| Manual + GitHub providers only | Other providers stubbed for future |

---

*Last Updated: June 27, 2026*
*Current Scheduler: GitHub Actions*
*Next Review: After 50 suppliers onboarded*
