import { NextResponse } from 'next/server';

export async function GET() {
  const predictions = [
    {
      id: 'pred_001',
      rfqId: 'RFQ001',
      prediction: 'High Success Probability',
      confidence: 87.3,
      factors: ['Strong supplier match', 'Competitive pricing', 'Good delivery history'],
      timestamp: '2024-01-16T10:30:00Z',
      actualOutcome: 'Successful',
      accuracy: 95.2
    },
    {
      id: 'pred_002',
      rfqId: 'RFQ002',
      prediction: 'Medium Success Probability',
      confidence: 64.8,
      factors: ['Moderate supplier match', 'Average pricing', 'Mixed delivery history'],
      timestamp: '2024-01-16T11:15:00Z',
      actualOutcome: 'Pending',
      accuracy: 78.9
    },
    {
      id: 'pred_003',
      rfqId: 'RFQ003',
      prediction: 'Low Success Probability',
      confidence: 23.1,
      factors: ['Weak supplier match', 'High pricing', 'Poor delivery history'],
      timestamp: '2024-01-16T12:00:00Z',
      actualOutcome: 'Failed',
      accuracy: 89.7
    },
    {
      id: 'pred_004',
      rfqId: 'RFQ004',
      prediction: 'High Success Probability',
      confidence: 91.7,
      factors: ['Excellent supplier match', 'Competitive pricing', 'Outstanding delivery history'],
      timestamp: '2024-01-16T13:45:00Z',
      actualOutcome: 'Successful',
      accuracy: 96.8
    },
    {
      id: 'pred_005',
      rfqId: 'RFQ005',
      prediction: 'Medium Success Probability',
      confidence: 72.4,
      factors: ['Good supplier match', 'Slightly high pricing', 'Good delivery history'],
      timestamp: '2024-01-16T14:20:00Z',
      actualOutcome: 'Pending',
      accuracy: 82.3
    }
  ];

  return NextResponse.json(predictions);
}
