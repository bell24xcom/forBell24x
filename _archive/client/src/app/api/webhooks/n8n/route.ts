import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/webhooks/n8n - Handle N8N webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, workflowId, executionId } = body;

    // Verify webhook signature if needed
    const signature = request.headers.get('x-n8n-signature');
    if (signature && !verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Process different webhook events
    switch (event) {
      case 'workflow.started':
        await handleWorkflowStarted(workflowId, executionId, data);
        break;
      
      case 'workflow.completed':
        await handleWorkflowCompleted(workflowId, executionId, data);
        break;
      
      case 'workflow.failed':
        await handleWorkflowFailed(workflowId, executionId, data);
        break;
      
      case 'execution.started':
        await handleExecutionStarted(workflowId, executionId, data);
        break;
      
      case 'execution.completed':
        await handleExecutionCompleted(workflowId, executionId, data);
        break;
      
      case 'execution.failed':
        await handleExecutionFailed(workflowId, executionId, data);
        break;
      
      case 'rfq.created':
        await handleRFQCreated(data);
        break;
      
      case 'rfq.updated':
        await handleRFQUpdated(data);
        break;
      
      case 'supplier.registered':
        await handleSupplierRegistered(data);
        break;
      
      case 'payment.processed':
        await handlePaymentProcessed(data);
        break;
      
      default:
        console.log(`Unknown webhook event: ${event}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Error processing N8N webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle workflow started event
async function handleWorkflowStarted(workflowId: string, executionId: string, data: any) {
  console.log(`Workflow ${workflowId} started with execution ${executionId}`);
  
  // Update workflow status
  await prisma.$executeRaw`
    UPDATE n8n_workflows 
    SET status = 'running', updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `, [workflowId];

  // Create execution record
  await prisma.$executeRaw`
    INSERT INTO n8n_executions (workflow_id, status, data)
    VALUES ($1, 'running', $2)
    ON CONFLICT (id) DO NOTHING
  `, [workflowId, JSON.stringify(data)];
}

// Handle workflow completed event
async function handleWorkflowCompleted(workflowId: string, executionId: string, data: any) {
  console.log(`Workflow ${workflowId} completed with execution ${executionId}`);
  
  // Update workflow status
  await prisma.$executeRaw`
    UPDATE n8n_workflows 
    SET status = 'active', updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `, [workflowId];

  // Update execution record
  await prisma.$executeRaw`
    UPDATE n8n_executions 
    SET status = 'completed', finished_at = CURRENT_TIMESTAMP, data = $3
    WHERE workflow_id = $1 AND id = $2
  `, [workflowId, executionId, JSON.stringify(data)];
}

// Handle workflow failed event
async function handleWorkflowFailed(workflowId: string, executionId: string, data: any) {
  console.log(`Workflow ${workflowId} failed with execution ${executionId}`);
  
  // Update workflow status
  await prisma.$executeRaw`
    UPDATE n8n_workflows 
    SET status = 'error', updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `, [workflowId];

  // Update execution record
  await prisma.$executeRaw`
    UPDATE n8n_executions 
    SET status = 'failed', finished_at = CURRENT_TIMESTAMP, error = $3, data = $4
    WHERE workflow_id = $1 AND id = $2
  `, [workflowId, executionId, data.error, JSON.stringify(data)];
}

// Handle execution started event
async function handleExecutionStarted(workflowId: string, executionId: string, data: any) {
  console.log(`Execution ${executionId} started for workflow ${workflowId}`);
  
  // Create or update execution record
  await prisma.$executeRaw`
    INSERT INTO n8n_executions (id, workflow_id, status, data)
    VALUES ($1, $2, 'running', $3)
    ON CONFLICT (id) DO UPDATE SET
      status = 'running',
      data = $3,
      started_at = CURRENT_TIMESTAMP
  `, [executionId, workflowId, JSON.stringify(data)];
}

// Handle execution completed event
async function handleExecutionCompleted(workflowId: string, executionId: string, data: any) {
  console.log(`Execution ${executionId} completed for workflow ${workflowId}`);
  
  // Update execution record
  await prisma.$executeRaw`
    UPDATE n8n_executions 
    SET status = 'completed', finished_at = CURRENT_TIMESTAMP, data = $3
    WHERE id = $1 AND workflow_id = $2
  `, [executionId, workflowId, JSON.stringify(data)];
}

// Handle execution failed event
async function handleExecutionFailed(workflowId: string, executionId: string, data: any) {
  console.log(`Execution ${executionId} failed for workflow ${workflowId}`);
  
  // Update execution record
  await prisma.$executeRaw`
    UPDATE n8n_executions 
    SET status = 'failed', finished_at = CURRENT_TIMESTAMP, error = $3, data = $4
    WHERE id = $1 AND workflow_id = $2
  `, [executionId, workflowId, data.error, JSON.stringify(data)];
}

// Handle RFQ created event
async function handleRFQCreated(data: any) {
  console.log('RFQ created via N8N webhook:', data);
  
  // Process RFQ creation
  if (data.rfqId) {
    // Update RFQ status or trigger additional workflows
    await prisma.$executeRaw`
      UPDATE rfqs 
      SET status = 'open', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [data.rfqId];
  }
}

// Handle RFQ updated event
async function handleRFQUpdated(data: any) {
  console.log('RFQ updated via N8N webhook:', data);
  
  // Process RFQ update
  if (data.rfqId) {
    await prisma.$executeRaw`
      UPDATE rfqs 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [data.rfqId];
  }
}

// Handle supplier registered event
async function handleSupplierRegistered(data: any) {
  console.log('Supplier registered via N8N webhook:', data);
  
  // Process supplier registration
  if (data.userId) {
    await prisma.$executeRaw`
      UPDATE users 
      SET is_verified = true, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [data.userId];
  }
}

// Handle payment processed event
async function handlePaymentProcessed(data: any) {
  console.log('Payment processed via N8N webhook:', data);
  
  // Process payment
  if (data.paymentId) {
    await prisma.$executeRaw`
      UPDATE payments 
      SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [data.paymentId];
  }
}

// Verify webhook signature (implement based on your security requirements)
function verifyWebhookSignature(body: any, signature: string): boolean {
  // Implement webhook signature verification
  // This is a placeholder - implement proper signature verification
  return true;
}
