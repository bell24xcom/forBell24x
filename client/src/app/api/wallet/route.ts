import { NextRequest, NextResponse } from 'next/server';
import { safeJson } from '@/lib/json-bigint';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'transactions') {
      // Use mock data instead of database query
      const transactions = [
        {
          id: '1',
          type: 'credit',
          amount: 5000,
          description: 'Payment received from SteelWorks Ltd',
          date: new Date('2024-01-15'),
          status: 'completed',
          currency: 'INR'
        },
        {
          id: '2',
          type: 'debit',
          amount: 2000,
          description: 'Escrow payment for RFQ #1234',
          date: new Date('2024-01-14'),
          status: 'completed',
          currency: 'INR'
        },
        {
          id: '3',
          type: 'credit',
          amount: 10000,
          description: 'Refund from cancelled order',
          date: new Date('2024-01-13'),
          status: 'completed',
          currency: 'INR'
        },
        {
          id: '4',
          type: 'debit',
          amount: 500,
          description: 'Platform fee for RFQ #5678',
          date: new Date('2024-01-12'),
          status: 'completed',
          currency: 'INR'
        }
      ];

      return NextResponse.json(safeJson({
        success: true,
        data: transactions,
        message: 'Transactions retrieved successfully'
      }));
    }

    // Mock wallet data
    return NextResponse.json(safeJson({
      success: true,
      data: {
        balance: 50000,
        currency: 'INR',
        status: 'active',
        lastUpdated: new Date(),
        pendingTransactions: 2,
        totalTransactions: 15,
        escrowBalance: 12000,
        availableBalance: 38000
      },
      message: 'Wallet information retrieved successfully'
    }));

  } catch (error) {
    console.error('Wallet API Error:', error);
    return NextResponse.json(safeJson({ 
      success: false, 
      error: 'Failed to retrieve wallet information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, amount, description } = body;

    // Mock transaction processing
    const transactionId = `TXN_${Date.now()}`;
    const timestamp = new Date();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json(safeJson({
      success: true,
      data: {
        action,
        amount: parseFloat(amount),
        description,
        transactionId,
        status: 'completed',
        timestamp
      },
      message: 'Wallet action processed successfully'
    }));

  } catch (error) {
    console.error('Wallet POST API Error:', error);
    return NextResponse.json(safeJson({ 
      success: false, 
      error: 'Failed to process wallet action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}
