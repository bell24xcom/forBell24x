import { NextRequest, NextResponse } from 'next/server';

// Save voice-generated RFQ to database
export async function POST(request: NextRequest) {
  try {
    const rfqData = await request.json();

    if (!rfqData || !rfqData.title) {
      return NextResponse.json(
        { success: false, error: 'Invalid RFQ data' },
        { status: 400 }
      );
    }

    // In a real implementation, this would save to a database
    // For now, we'll simulate saving and return success
    const savedRFQ = {
      ...rfqData,
      id: rfqData.id || generateId(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate database save
    console.log('Saving RFQ:', savedRFQ);

    return NextResponse.json({
      success: true,
      rfq: savedRFQ,
      message: 'RFQ saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving voice RFQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save RFQ' },
      { status: 500 }
    );
  }
}

function generateId(): string {
  return `voice-rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
