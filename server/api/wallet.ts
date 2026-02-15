import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// You may want to move these to your config
const RAZORPAYX_API_KEY = process.env.RAZORPAYX_API_KEY;
const RAZORPAYX_API_SECRET = process.env.RAZORPAYX_API_SECRET;
const RAZORPAYX_BASE_URL = 'https://api.razorpay.com/v1';

const router = express.Router();

// TypeScript type for bank details
interface BankDetails {
  name: string;
  ifsc: string;
  account_number: string;
  email?: string;
  contact?: string;
  gst_number?: string;
}

// POST /api/wallet/create
router.post('/create', async (req: Request, res: Response) => {
  const { userId, name, ifsc, account_number, email, contact, gst_number } = req.body as BankDetails & { userId: string };
  try {
    // 1. Create RazorpayX Contact
    // GST validation (basic)
    let gstValid = true;
    if (gst_number && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gst_number)) {
      gstValid = false;
    }
    if (gst_number && !gstValid) {
      return res.status(400).json({ success: false, error: 'Invalid GST number format.' });
    }

    const contactResp = await axios.post(
      `${RAZORPAYX_BASE_URL}/contacts`,
      {
        name,
        email,
        contact,
        type: 'employee', // or 'customer' as per your use case
        ...(gst_number ? { gstin: gst_number } : {}),
      },
      {
        auth: {
          username: RAZORPAYX_API_KEY!,
          password: RAZORPAYX_API_SECRET!,
        },
      }
    );
    const contactId = contactResp.data.id;

    // 2. Create Fund Account (wallet) linked to user's bank details
    const fundAccountResp = await axios.post(
      `${RAZORPAYX_BASE_URL}/fund_accounts`,
      {
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          name,
          ifsc,
          account_number,
        },
      },
      {
        auth: {
          username: RAZORPAYX_API_KEY!,
          password: RAZORPAYX_API_SECRET!,
        },
      }
    );
    const fundAccountId = fundAccountResp.data.id;

    // 3. Store these IDs and GST in your user table (pseudo code, replace with actual DB call)
    // await db.users.update({ id: userId }, { razorpay_contact_id: contactId, razorpay_fund_account_id: fundAccountId, wallet_status: 'active', gst_number });

    res.json({ success: true, contactId, fundAccountId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

export default router;
