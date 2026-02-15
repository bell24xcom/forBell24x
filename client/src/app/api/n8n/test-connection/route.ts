import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/n8n-service';

export async function GET(request: NextRequest) {
  try {
    // Test N8N connection
    const connectionTest = await n8nService.testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: connectionTest.message,
        status: 'disconnected'
      }, { status: 503 });
    }

    // Get workflows if connection is successful
    const workflows = await n8nService.getWorkflows();
    
    return NextResponse.json({
      success: true,
      message: connectionTest.message,
      status: 'connected',
      data: {
        workflows: workflows.length,
        workflowList: workflows.map(w => ({
          id: w.id,
          name: w.name,
          active: w.active,
          createdAt: w.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('N8N connection test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to test N8N connection',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflowId, data } = body;

    switch (action) {
      case 'execute_workflow':
        if (!workflowId) {
          return NextResponse.json({
            success: false,
            message: 'Workflow ID is required'
          }, { status: 400 });
        }

        const execution = await n8nService.executeWorkflow(workflowId, data);
        return NextResponse.json({
          success: true,
          message: 'Workflow executed successfully',
          execution
        });

      case 'get_workflow_stats':
        if (!workflowId) {
          return NextResponse.json({
            success: false,
            message: 'Workflow ID is required'
          }, { status: 400 });
        }

        const stats = await n8nService.getWorkflowStats(workflowId);
        return NextResponse.json({
          success: true,
          message: 'Workflow stats retrieved successfully',
          stats
        });

      case 'get_executions':
        if (!workflowId) {
          return NextResponse.json({
            success: false,
            message: 'Workflow ID is required'
          }, { status: 400 });
        }

        const executions = await n8nService.getWorkflowExecutions(workflowId, 20);
        return NextResponse.json({
          success: true,
          message: 'Executions retrieved successfully',
          executions
        });

      default:
        return NextResponse.json({
          success: false,
          message: 'Unknown action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('N8N API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to process N8N request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
