import crypto from 'crypto';
import { WebhookDelivery, WebhookStatus } from '@prisma/client';
import prisma from '../lib/prisma';

type WebhookPayload = {
  id: string;
  event: string;
  data: any;
  attempt: number;
  created: number;
};

export const verifyWebhookSignature = (
  payload: any,
  signature: string,
  secret: string
): boolean => {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
};

export const createWebhookDelivery = async (
  event: string,
  payload: any,
  endpoint: string,
  provider: string
): Promise<WebhookDelivery> => {
  return prisma.webhookDelivery.create({
    data: {
      id: crypto.randomUUID(),
      event,
      payload: JSON.parse(JSON.stringify(payload)),
      endpoint,
      provider,
      status: WebhookStatus.PENDING,
      attempt: 0,
    },
  });
};

export const updateWebhookDelivery = async (
  id: string,
  status: WebhookStatus,
  response?: any,
  error?: string
): Promise<void> => {
  await prisma.webhookDelivery.update({
    where: { id },
    data: {
      status,
      response: response ? JSON.parse(JSON.stringify(response)) : undefined,
      error,
      attempt: { increment: 1 },
      lastAttemptAt: new Date(),
    },
  });
};

export const retryFailedWebhooks = async (maxRetries = 3): Promise<void> => {
  const failedWebhooks = await prisma.webhookDelivery.findMany({
    where: {
      status: WebhookStatus.FAILED,
      attempt: { lt: maxRetries },
      OR: [
        { lastAttemptAt: null },
        { lastAttemptAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } }, // 5 minutes cooldown
      ],
    },
    take: 100, // Process in batches of 100
  });

  for (const webhook of failedWebhooks) {
    try {
      // Here you would implement the actual webhook retry logic
      // For example, make an HTTP request to the webhook endpoint
      // This is a simplified example
      await updateWebhookDelivery(webhook.id, WebhookStatus.PENDING);
      
      // Simulate webhook delivery
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update status based on result
      await updateWebhookDelivery(webhook.id, WebhookStatus.DELIVERED, { success: true });
    } catch (error) {
      console.error(`Failed to retry webhook ${webhook.id}:`, error);
      await updateWebhookDelivery(
        webhook.id, 
        WebhookStatus.FAILED, 
        null, 
        error.message
      );
    }
  }
};
