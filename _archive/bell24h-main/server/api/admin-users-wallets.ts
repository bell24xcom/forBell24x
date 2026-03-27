import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

// Replace with your actual DB import
// import db from '../db';

const router = express.Router();

// GET /api/admin/users-wallets
router.get('/', async (_req: Request, res: Response) => {
  try {
    // Replace with your actual DB query
    // const users = await db.users.findMany({});
    // For demo, return mock data:
    const users = [
      {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        razorpay_contact_id: 'cont_123',
        razorpay_fund_account_id: 'fa_123',
        wallet_status: 'active',
        gst_number: '22AAAAA0000A1Z5',
      },
      {
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
        razorpay_contact_id: 'cont_456',
        razorpay_fund_account_id: 'fa_456',
        wallet_status: 'pending',
        gst_number: '',
      },
    ];
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
