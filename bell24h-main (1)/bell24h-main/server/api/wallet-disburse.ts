import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const RAZORPAYX_API_KEY = process.env.RAZORPAYX_API_KEY;
const RAZORPAYX_API_SECRET = process.env.RAZORPAYX_API_SECRET;
const RAZORPAYX_BASE_URL = 'https://api.razorpay.com/v1';

const router = express.Router();

/**
 * POST /api/wallet/disburse
 * Body: { userId: string, amount: number, currency: string, narration?: string }
 * Assumes you have the user's fund_account_id and your own RazorpayX account number in ENV
 */
router.post('/disburse', async (req: Request, res: Response) => {
  const { userId, amount, currency, narration } = req.body;
  try {
    // Fetch user details from DB (pseudo code)
    // const user = await db.users.findOne({ id: userId });
    // if (!user || !user.razorpay_fund_account_id) throw new Error('User wallet not found');
    // const fundAccountId = user.razorpay_fund_account_id;
    // For demo, replace with a test fund account ID:
    const fundAccountId = 'fa_test_123';

    // 1. Create a payout from your RazorpayX account to user's fund account
    const payoutResp = await axios.post(
      `${RAZORPAYX_BASE_URL}/payouts`,
      {
        account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER, // Your RazorpayX account
        fund_account_id: fundAccountId,
        amount: Math.round(amount * 100), // in paise
        currency,
        mode: 'IMPS', // or NEFT/RTGS
        purpose: 'payout',
        narration: narration || 'Milestone payout',
        queue_if_low_balance: true,
      },
      {
        auth: {
          username: RAZORPAYX_API_KEY!,
          password: RAZORPAYX_API_SECRET!,
        },
      }
    );
    res.json({ success: true, payout: payoutResp.data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

export default router;
