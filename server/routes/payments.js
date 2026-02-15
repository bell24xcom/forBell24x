import express from 'express';

// Create a router for payment routes
export const paymentRoutes = express.Router();

// Mock payment data
const payments = [
  {
    id: 'pay_123456',
    amount: 5000,
    currency: 'inr',
    status: 'completed',
    description: 'Payment for RFQ #1',
    createdAt: '2025-05-20T14:30:00Z',
    userId: 1
  },
  {
    id: 'pay_789012',
    amount: 15000,
    currency: 'inr',
    status: 'pending',
    description: 'Payment for RFQ #2',
    createdAt: '2025-05-25T09:45:00Z',
    userId: 2
  }
];

// Get all payments
paymentRoutes.get('/', (req, res) => {
  const userId = req.user?.id;
  const userPayments = payments.filter(p => p.userId === userId);
  res.json(userPayments);
});

// Get payment by ID
paymentRoutes.get('/:id', (req, res) => {
  const paymentId = req.params.id;
  const userId = req.user?.id;
  
  const payment = payments.find(p => p.id === paymentId && p.userId === userId);
  
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }
  
  res.json(payment);
});

// Create payment intent
paymentRoutes.post('/create-intent', (req, res) => {
  const { amount, currency, description } = req.body;
  
  if (!amount || !currency) {
    return res.status(400).json({ message: 'Amount and currency are required' });
  }
  
  // In a real app, you would create a payment intent with Stripe or another payment processor
  const paymentIntent = {
    id: `pi_${Date.now()}`,
    amount,
    currency,
    description: description || 'Bell24H payment',
    client_secret: `sec_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
    status: 'requires_payment_method'
  };
  
  res.json({ paymentIntent });
});

// Webhook handler for payment events
paymentRoutes.post('/webhook', (req, res) => {
  // In a real app, you would verify the webhook signature
  const event = req.body;
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      console.log('Payment succeeded:', event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      console.log('Payment failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});
