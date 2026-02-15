import { Request, Response } from 'express';
import { walletService } from '../services/walletService';
import { stripe } from '../lib/stripe';

export const walletController = {
  // Get wallet details for the authenticated user
  getWallet: async (req: Request, res: Response) => {
    try {
      const wallet = await walletService.getWallet(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      
      res.json(wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ error: 'Failed to fetch wallet' });
    }
  },

  // Deposit money into wallet
  deposit: async (req: Request, res: Response) => {
    try {
      const { amount, paymentMethodId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      if (!paymentMethodId) {
        return res.status(400).json({ error: 'Payment method is required' });
      }
      
      // Get or create wallet
      let wallet = await walletService.getWallet(req.user.id);
      if (!wallet) {
        wallet = await walletService.createWallet(req.user.id);
      }

      // Process payment with Stripe
      const payment = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to smallest currency unit
        currency: 'inr',
        payment_method: paymentMethodId,
        confirm: true,
        metadata: { 
          userId: req.user.id,
          walletId: wallet.id,
          type: 'wallet_deposit'
        },
        return_url: `${process.env.FRONTEND_URL}/wallet?deposit=success`
      });

      // Create wallet transaction
      await walletService.createTransaction(wallet.id, {
        amount,
        type: 'deposit',
        status: payment.status === 'succeeded' ? 'completed' : 'pending',
        referenceId: payment.id,
        description: 'Wallet top-up',
        metadata: {
          paymentMethod: paymentMethodId,
          currency: payment.currency
        }
      });

      // If payment requires action (3D Secure), return client secret
      if (payment.status === 'requires_action') {
        return res.json({
          requiresAction: true,
          clientSecret: payment.client_secret
        });
      }

      res.json({ 
        success: true,
        message: 'Deposit successful',
        payment
      });
    } catch (error: any) {
      console.error('Deposit error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process deposit',
        code: error.code
      });
    }
  },

  // Withdraw money from wallet
  withdraw: async (req: Request, res: Response) => {
    try {
      const { amount, bankAccountId } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }
      
      if (!bankAccountId) {
        return res.status(400).json({ error: 'Bank account is required' });
      }
      
      // Get wallet
      const wallet = await walletService.getWallet(req.user.id);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      
      // Check sufficient balance
      if (wallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      
      // Process withdrawal (this is a simplified example)
      // In a real app, you would integrate with a payment processor's API
      const withdrawal = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: 'inr',
        destination: bankAccountId,
        metadata: {
          userId: req.user.id,
          walletId: wallet.id,
          type: 'wallet_withdrawal'
        }
      });

      // Record withdrawal transaction
      await walletService.createTransaction(wallet.id, {
        amount: -amount, // Negative for withdrawals
        type: 'withdrawal',
        status: 'completed',
        referenceId: withdrawal.id,
        description: 'Withdrawal to bank account',
        metadata: {
          bankAccountId,
          currency: withdrawal.currency
        }
      });

      res.json({ 
        success: true,
        message: 'Withdrawal request received',
        withdrawal
      });
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      res.status(500).json({ 
        error: error.message || 'Failed to process withdrawal',
        code: error.code
      });
    }
  },

  // Get transaction history
  getTransactions: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const wallet = await walletService.getWallet(req.user.id);
      
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }
      
      const transactions = await walletService.getTransactions(
        wallet.id,
        Number(page),
        Number(limit)
      );
      
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },

  // Webhook handler for Stripe events
  handleWebhook: async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: 'Webhook error' });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSucceeded(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const paymentFailed = event.data.object;
        await handlePaymentFailed(paymentFailed);
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
};

// Helper functions for webhook handling
async function handlePaymentSucceeded(paymentIntent: any) {
  const { metadata } = paymentIntent;
  if (!metadata.walletId) return;

  // Update transaction status
  await walletService.createTransaction(metadata.walletId, {
    amount: paymentIntent.amount / 100, // Convert back to currency unit
    type: 'deposit',
    status: 'completed',
    referenceId: paymentIntent.id,
    description: 'Wallet top-up',
    metadata: {
      paymentMethod: paymentIntent.payment_method,
      currency: paymentIntent.currency
    }
  });
}

async function handlePaymentFailed(paymentIntent: any) {
  const { metadata } = paymentIntent;
  if (!metadata.walletId) return;

  // Update transaction status
  await walletService.createTransaction(metadata.walletId, {
    amount: paymentIntent.amount / 100,
    type: 'deposit',
    status: 'failed',
    referenceId: paymentIntent.id,
    description: 'Failed wallet top-up',
    metadata: {
      paymentMethod: paymentIntent.payment_method,
      currency: paymentIntent.currency,
      error: paymentIntent.last_payment_error
    }
  });
}
