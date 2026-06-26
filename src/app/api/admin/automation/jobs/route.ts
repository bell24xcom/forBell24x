/**
 * Automation Jobs API
 *
 * Returns job registry information and execution history.
 * This is read-only - actual job execution happens via
 * manual trigger or scheduled workflows.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';
import { listJobs, getSchedulerInfo, executeJob } from '@/src/lib/scheduler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const jobs = listJobs();
    const scheduler = getSchedulerInfo();

    return NextResponse.json({
      success: true,
      scheduler,
      jobs: jobs.map(job => ({
        id: job.id,
        name: job.name,
        description: job.description,
        endpoint: job.endpoint,
        schedule: job.schedule,
        enabled: job.enabled,
        retryCount: job.retryCount,
        timeoutSeconds: job.timeoutSeconds,
      })),
    });
  } catch (error) {
    console.error('[API_ERROR] /admin/automation/jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  try {
    const body = await request.json();
    const { jobId, action } = body;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'jobId required' },
        { status: 400 }
      );
    }

    if (action === 'execute') {
      const execution = await executeJob(jobId);
      if (!execution) {
        return NextResponse.json(
          { success: false, error: 'Job not found or disabled' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, execution });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API_ERROR] /admin/automation/jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute job' },
      { status: 500 }
    );
  }
}
