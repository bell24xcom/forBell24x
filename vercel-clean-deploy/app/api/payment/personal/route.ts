// TEMPORARY: Personal account payment until GST ready
import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Create UPI payment link
    const upiLink = `upi://pay?pa=yourphonenumber@paytm&pn=Bell24h&am=${data.amount}&cu=INR&tn=${data.service}`;

    // Bank transfer details
    const bankDetails = {
      name: "Your Name",
      account: "XXXXXXXXXX",
      ifsc: "XXXXXXX",
      amount: data.amount,
      reference: `BELL24H-${Date.now()}`,
      upi: upiLink
    };

    return NextResponse.json({
      success: true,
      payment: bankDetails,
      note: "GST registration pending - will provide GST invoice once registered",
      instructions: [
        "1. Make payment using UPI or bank transfer",
        "2. Send payment screenshot to WhatsApp",
        "3. Service will be delivered within 48 hours",
        "4. GST invoice will be provided once registered"
      ]
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Payment link generation failed"
    }, { status: 500 });
  }
}
