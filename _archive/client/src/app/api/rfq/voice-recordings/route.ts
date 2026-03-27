import { NextResponse } from 'next/server';

export async function GET() {
  const voiceRecordings = [
    {
      id: 'rec_001',
      filename: 'RFQ_Electronics_Components_2024-01-16.wav',
      duration: 45,
      size: '2.3 MB',
      timestamp: '2024-01-16T10:30:00Z',
      status: 'completed',
      transcription: 'We need electronic components for our new IoT device. Looking for reliable suppliers with competitive pricing.',
      confidence: 94.2,
      rfqData: {
        title: 'Electronic Components for IoT Device',
        description: 'We need electronic components for our new IoT device. Looking for reliable suppliers with competitive pricing.',
        category: 'electronics',
        budget: '$5,000 - $10,000',
        deadline: '2024-02-15'
      }
    },
    {
      id: 'rec_002',
      filename: 'RFQ_Office_Supplies_2024-01-16.wav',
      duration: 32,
      size: '1.8 MB',
      timestamp: '2024-01-16T11:15:00Z',
      status: 'processing',
      transcription: 'Office supplies needed for new branch opening. Bulk order required.',
      confidence: 87.6,
      rfqData: {
        title: 'Office Supplies for New Branch',
        description: 'Office supplies needed for new branch opening. Bulk order required.',
        category: 'office_supplies',
        budget: '$2,000 - $3,500',
        deadline: '2024-01-30'
      }
    },
    {
      id: 'rec_003',
      filename: 'RFQ_Manufacturing_Equipment_2024-01-16.wav',
      duration: 67,
      size: '3.1 MB',
      timestamp: '2024-01-16T12:00:00Z',
      status: 'failed',
      transcription: 'Manufacturing equipment for automotive parts production.',
      confidence: 72.3
    },
    {
      id: 'rec_004',
      filename: 'RFQ_Construction_Materials_2024-01-16.wav',
      duration: 28,
      size: '1.5 MB',
      timestamp: '2024-01-16T13:30:00Z',
      status: 'completed',
      transcription: 'Construction materials for commercial building project. Need steel, concrete, and electrical supplies.',
      confidence: 91.8,
      rfqData: {
        title: 'Construction Materials for Commercial Building',
        description: 'Construction materials for commercial building project. Need steel, concrete, and electrical supplies.',
        category: 'construction',
        budget: '$25,000 - $50,000',
        deadline: '2024-03-15'
      }
    },
    {
      id: 'rec_005',
      filename: 'RFQ_Healthcare_Equipment_2024-01-16.wav',
      duration: 41,
      size: '2.1 MB',
      timestamp: '2024-01-16T14:45:00Z',
      status: 'completed',
      transcription: 'Medical equipment for new clinic. Need diagnostic tools and patient monitoring systems.',
      confidence: 89.5,
      rfqData: {
        title: 'Medical Equipment for New Clinic',
        description: 'Medical equipment for new clinic. Need diagnostic tools and patient monitoring systems.',
        category: 'healthcare',
        budget: '$15,000 - $30,000',
        deadline: '2024-02-28'
      }
    }
  ];

  return NextResponse.json(voiceRecordings);
}
