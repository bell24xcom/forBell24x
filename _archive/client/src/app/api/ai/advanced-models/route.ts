import { NextResponse } from 'next/server';

export async function GET() {
  const advancedModels = [
    {
      id: 'model_001',
      name: 'Supplier Matching v3.2',
      type: 'matching',
      status: 'active',
      accuracy: 94.7,
      lastUpdated: '2024-01-15',
      performance: {
        precision: 92.3,
        recall: 89.8,
        f1Score: 91.0,
        latency: 45
      },
      trainingData: {
        totalSamples: 125000,
        lastTrainingDate: '2024-01-10',
        trainingDuration: '4h 23m'
      }
    },
    {
      id: 'model_002',
      name: 'RFQ Success Predictor',
      type: 'prediction',
      status: 'training',
      accuracy: 87.2,
      lastUpdated: '2024-01-14',
      performance: {
        precision: 85.1,
        recall: 88.9,
        f1Score: 86.9,
        latency: 67
      },
      trainingData: {
        totalSamples: 89000,
        lastTrainingDate: '2024-01-14',
        trainingDuration: '6h 12m'
      }
    },
    {
      id: 'model_003',
      name: 'Natural Language Processor',
      type: 'nlp',
      status: 'deployed',
      accuracy: 91.5,
      lastUpdated: '2024-01-12',
      performance: {
        precision: 90.2,
        recall: 92.8,
        f1Score: 91.5,
        latency: 23
      },
      trainingData: {
        totalSamples: 156000,
        lastTrainingDate: '2024-01-08',
        trainingDuration: '8h 45m'
      }
    },
    {
      id: 'model_004',
      name: 'Document Analyzer',
      type: 'computer_vision',
      status: 'active',
      accuracy: 89.3,
      lastUpdated: '2024-01-13',
      performance: {
        precision: 87.6,
        recall: 91.0,
        f1Score: 89.3,
        latency: 89
      },
      trainingData: {
        totalSamples: 67000,
        lastTrainingDate: '2024-01-11',
        trainingDuration: '5h 18m'
      }
    },
    {
      id: 'model_005',
      name: 'Market Trend Analyzer',
      type: 'prediction',
      status: 'active',
      accuracy: 92.1,
      lastUpdated: '2024-01-16',
      performance: {
        precision: 91.8,
        recall: 92.4,
        f1Score: 92.1,
        latency: 34
      },
      trainingData: {
        totalSamples: 203000,
        lastTrainingDate: '2024-01-15',
        trainingDuration: '7h 45m'
      }
    }
  ];

  return NextResponse.json(advancedModels);
}
