# Bell24h Error Handling Guide

## Overview
This guide covers error handling strategies for all components of the Bell24h platform.

## Payment Integration Errors

### Razorpay Errors
```typescript
// Error handling for Razorpay operations
async function createOrderWithRetry(amount: number, currency: string) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency,
        receipt: `order-${Date.now()}`,
      });
    } catch (error) {
      retryCount++;
      console.error(`Razorpay order creation failed (attempt ${retryCount}):`, error);

      if (retryCount >= maxRetries) {
        throw new Error('Failed to create Razorpay order after multiple attempts');
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
}
```

### Webhook Verification Errors
```typescript
// Secure webhook verification
function verifyWebhookSignature(signature: string | null, body: string): boolean {
  if (!signature) {
    console.error('Webhook signature missing');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === signature;
    if (!isValid) {
      console.error('Webhook signature mismatch');
    }
    return isValid;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}
```

## AI Service Errors

### NVIDIA API Errors
```typescript
// Error handling for NVIDIA API calls
async function callNVIDIAWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      retryCount++;
      console.error(`NVIDIA API call failed (attempt ${retryCount}):`, error);

      if (retryCount >= maxRetries) {
        throw new Error('NVIDIA API call failed after multiple attempts');
      }

      // Handle specific error types
      if (error.response?.status === 429) {
        // Rate limiting - wait longer
        await new Promise(resolve => setTimeout(resolve, 60000));
      } else {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  }
}

// Usage in AI client
async processVoiceRFQ(audioBuffer: Buffer, language: string = 'hindi') {
  return await callNVIDIAWithRetry(async () => {
    const client = this.getClient('voice');
    if (!client) {
      throw new Error('Voice client not available');
    }

    const base64Audio = audioBuffer.toString('base64');

    return await client.chat.completions.create({
      model: 'minimaxai/minimax-m2.1',
      messages: [{
        role: 'user',
        content: [{
          type: 'audio',
          source: {
            type: 'base64',
            media_type: 'audio/mp3',
            data: base64Audio
          }
        }, {
          type: 'text',
          text: `Transcribe this RFQ in ${language} and extract: product, quantity, delivery location, urgency level`
        }]
      }],
      temperature: 0.7,
      max_tokens: 2048
    });
  });
}
```

### Fallback Mechanisms
```typescript
// Fallback from AI to traditional processing
async processRFQ(rfqData: any, userId: string) {
  try {
    // Try AI processing first
    return await this.processWithAI(rfqData, userId);
  } catch (error) {
    console.error('AI processing failed, falling back to traditional processing:', error);
    // Fallback to traditional processing
    return await this.processWithTraditional(rfqData, userId);
  }
}

private async processWithTraditional(rfqData: any, userId: string) {
  // Traditional RFQ processing logic
  // This could be rule-based or use simpler algorithms
  return {
    success: true,
    data: {
      product: 'Unknown',
      quantity: 1,
      delivery: 'Standard',
      urgency: 'Normal'
    }
  };
}
```

## Subscription Service Errors

### RevenueCat Errors
```typescript
// Error handling for RevenueCat operations
async function handlePurchaseWithRetry(packageId: string) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const packageToPurchase = (await this.getOfferings()).find(
        (pkg: any) => pkg.identifier === packageId
      );

      if (!packageToPurchase) {
        throw new Error('Plan not found');
      }

      const { customerInfo } = await this.purchases.purchasePackage(packageToPurchase);

      return {
        success: true,
        plan: customerInfo.activeSubscriptions[0],
        expiryDate: customerInfo.expirationDate,
      };
    } catch (error) {
      retryCount++;
      console.error(`RevenueCat purchase failed (attempt ${retryCount}):`, error);

      if (retryCount >= maxRetries) {
        throw new Error('Failed to process purchase after multiple attempts');
      }

      // Handle specific error types
      if (error.code === 'purchase-cancelled') {
        throw new Error('Purchase cancelled by user');
      } else if (error.code === 'network-error') {
        // Network error - retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        // Other errors - exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
  }
}
```

## N8N Integration Errors

### Webhook Delivery Errors
```typescript
// Error handling for N8N webhook delivery
async function sendToN8NWithRetry(eventType: string, data: any) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(`${this.baseUrl}${this.webhookPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventType,
          data: data,
        }),
      });

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      retryCount++;
      console.error(`N8N webhook delivery failed (attempt ${retryCount}):`, error);

      if (retryCount >= maxRetries) {
        console.warn('Failed to deliver webhook to N8N after multiple attempts');
        // Log the event for later retry
        await this.logFailedWebhook(eventType, data);
        return null;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
}

private async logFailedWebhook(eventType: string, data: any) {
  // Log failed webhooks to database for later retry
  try {
    await prisma.failedWebhook.create({
      data: {
        eventType,
        eventData: JSON.stringify(data),
        retryCount: 0,
        status: 'pending',
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to log webhook:', error);
  }
}
```

## Database Errors

### Prisma Errors
```typescript
// Error handling for database operations
async function safeDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retryCount++;
      console.error(`Database operation failed (attempt ${retryCount}):`, error);

      if (retryCount >= maxRetries) {
        throw new Error('Database operation failed after multiple attempts');
      }

      // Handle specific database errors
      if (error.code === 'P2002') {
        // Unique constraint violation
        throw new Error('Duplicate entry detected');
      } else if (error.code === 'P2025') {
        // Record not found
        throw new Error('Record not found');
      } else if (error.code === 'P2022') {
        // Foreign key violation
        throw new Error('Invalid foreign key reference');
      } else {
        // Connection error - retry
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
}

// Usage example
async function createPayment(paymentData: any) {
  return await safeDatabaseOperation(async () => {
    return await prisma.payment.create({
      data: paymentData,
    });
  });
}
```

## API Error Handling

### Next.js API Route Errors
```typescript
// Error handling in Next.js API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await processPayment(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 }
      );
    } else if (error instanceof PaymentError) {
      return NextResponse.json(
        { error: error.message },
        { status: 402 }
      );
    } else {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}
```

## Monitoring and Alerting

### Error Monitoring
```typescript
// Error monitoring and alerting
class ErrorMonitor {
  private errorCount: Map<string, number> = new Map();
  private errorThresholds: Map<string, number> = new Map();

  constructor() {
    // Set error thresholds
    this.errorThresholds.set('payment-failed', 5);
    this.errorThresholds.set('api-timeout', 10);
    this.errorThresholds.set('database-connection', 3);
  }

  async trackError(error: Error, context: any = {}) {
    const errorKey = this.getErrorKey(error);
    const currentCount = this.errorCount.get(errorKey) || 0;
    this.errorCount.set(errorKey, currentCount + 1);

    console.error('Error tracked:', {
      error: error.message,
      context,
      count: currentCount + 1,
      timestamp: new Date().toISOString(),
    });

    // Check if threshold exceeded
    const threshold = this.errorThresholds.get(errorKey);
    if (threshold && currentCount + 1 >= threshold) {
      await this.triggerAlert(error, context);
    }
  }

  private getErrorKey(error: Error): string {
    return error.name || error.message.split('\n')[0];
  }

  private async triggerAlert(error: Error, context: any) {
    console.warn('Error threshold exceeded, triggering alert:', {
      error: error.message,
      context,
    });

    // Send alert to monitoring system
    await this.sendAlertToMonitoring(error, context);
  }

  private async sendAlertToMonitoring(error: Error, context: any) {
    try {
      await fetch('https://monitoring.example.com/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
          context,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }
}

export const errorMonitor = new ErrorMonitor();
```

## Testing Error Scenarios

### Unit Tests for Error Handling
```typescript
describe('Error Handling', () => {
  it('should handle Razorpay payment failure', async () => {
    // Mock Razorpay to throw an error
    jest.spyOn(razorpay.orders, 'create').mockRejectedValue(
      new Error('Payment failed')
    );

    await expect(createOrderWithRetry(10000, 'INR')).rejects.toThrow(
      'Failed to create Razorpay order after multiple attempts'
    );
  });

  it('should handle NVIDIA API rate limiting', async () => {
    // Mock NVIDIA API to return rate limit error
    jest.spyOn(aiClient, 'processVoiceRFQ').mockRejectedValue(
      new Error('Rate limit exceeded')
    );

    await expect(aiClient.processVoiceRFQ(Buffer.from(''), 'hindi')).rejects.toThrow(
      'NVIDIA API call failed after multiple attempts'
    );
  });

  it('should handle database connection errors', async () => {
    // Mock database to throw connection error
    jest.spyOn(prisma.payment, 'create').mockRejectedValue(
      new Error('Connection refused')
    );

    await expect(createPayment({})).rejects.toThrow(
      'Database operation failed after multiple attempts'
    );
  });
});
```

## Best Practices

### 1. Fail Fast and Loud
- Validate inputs early
- Use specific error types
- Provide meaningful error messages
- Log errors with context

### 2. Graceful Degradation
- Implement fallback mechanisms
- Provide alternative functionality
- Maintain user experience
- Communicate issues clearly

### 3. Retry with Exponential Backoff
- Use exponential backoff for retries
- Set maximum retry limits
- Handle specific error types differently
- Monitor retry patterns

### 4. Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private threshold = 5;
  private timeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

### 5. Error Context and Correlation
- Include request IDs in errors
- Track error chains
- Provide user-friendly messages
- Log technical details separately

This comprehensive error handling guide ensures that Bell24h can handle failures gracefully, maintain service availability, and provide a good user experience even when things go wrong.