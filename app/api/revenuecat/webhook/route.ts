import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { subscriptionService } from '../../services/subscription-service';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('RevenueCat-Signature');
  const body = await request.text();

  // Verify webhook signature
  if (!verifySignature(signature, body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  await subscriptionService.handleWebhook(event);

  // Trigger n8n workflows based on subscription events
  await triggerN8NWorkflow(event);

  return NextResponse.json({ received: true });
}

function verifySignature(signature: string | null, body: string): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.REVENUECAT_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

async function triggerN8NWorkflow(event: any) {
  const workflowMap = {
    'INITIAL_PURCHASE': 'subscription-activated',
    'RENEWAL': 'subscription-renewed',
    'CANCELLATION': 'subscription-cancelled',
    'EXPIRATION': 'subscription-expired'
  } as const;

  const workflow = workflowMap[event.type as keyof typeof workflowMap];
  if (workflow) {
    await fetch(`http://165.232.187.195:5678/webhook/${workflow}`, {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }
}
