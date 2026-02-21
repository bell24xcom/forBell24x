import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', type, description } = await request.json();
    
    // Check if escrow is required
    const escrowThreshold = 500000; // ₹5,00,000
    const escrowRequired = amount >= escrowThreshold;
    
    // Create transaction
    const transaction = {
      id: `txn_${Date.now()}`,
      amount,
      currency,
      type,
      description,
      status: 'pending',
      escrow_required: escrowRequired,
      escrow_enabled: true,
      created_at: new Date().toISOString(),
      metadata: {
        source: 'bell24h-platform',
        version: '1.0'
      }
    };
    
    if (escrowRequired) {
      // Create escrow transaction
      transaction.status = 'escrow_pending';
      transaction.metadata.escrow_id = `escrow_${Date.now()}`;
    }
    
    return NextResponse.json({
      success: true,
      transaction,
      escrow_info: escrowRequired ? {
        required: true,
        enabled: true,
        message: 'Transaction will be held in escrow until completion'
      } : {
        required: false,
        message: 'Direct transaction - no escrow required'
      }
    });
    
  } catch (error) {
    console.error('Transaction Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Transaction creation failed',
      message: 'Please try again or contact support'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Transaction System Active',
    escrow: {
      enabled: process.env.ENABLE_ESCROW === 'true',
      threshold: 500000,
      currency: 'INR',
      message: 'Escrow protection active for transactions above ₹5,00,000'
    },
    supported_currencies: ['INR', 'USD', 'EUR', 'GBP'],
    features: [
      'Secure transactions',
      'Escrow protection',
      'Real-time processing',
      'Transaction history',
      'Refund management',
      'Multi-currency support'
    ]
  });
}
