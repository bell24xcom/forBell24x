import { NextResponse } from 'next/server';

export async function GET() {
  const modelPerformance = [
    {
      modelId: 'model_001',
      modelName: 'Supplier Matching v3.2',
      dailyPredictions: 1247,
      accuracyTrend: [92.1, 93.4, 94.2, 94.7, 94.8, 94.9, 95.1],
      latencyTrend: [52, 48, 45, 43, 45, 44, 45],
      errorRate: 2.3,
      lastOptimization: '2024-01-15'
    },
    {
      modelId: 'model_002',
      modelName: 'RFQ Success Predictor',
      dailyPredictions: 892,
      accuracyTrend: [84.2, 85.7, 86.3, 87.2, 87.5, 87.8, 88.1],
      latencyTrend: [78, 72, 69, 67, 65, 66, 67],
      errorRate: 4.1,
      lastOptimization: '2024-01-14'
    },
    {
      modelId: 'model_003',
      modelName: 'Natural Language Processor',
      dailyPredictions: 2156,
      accuracyTrend: [89.8, 90.1, 90.7, 91.2, 91.5, 91.8, 92.1],
      latencyTrend: [31, 28, 25, 23, 22, 23, 23],
      errorRate: 1.8,
      lastOptimization: '2024-01-12'
    },
    {
      modelId: 'model_004',
      modelName: 'Document Analyzer',
      dailyPredictions: 678,
      accuracyTrend: [86.7, 87.2, 87.9, 88.5, 89.0, 89.3, 89.6],
      latencyTrend: [95, 92, 89, 87, 89, 88, 89],
      errorRate: 3.2,
      lastOptimization: '2024-01-13'
    },
    {
      modelId: 'model_005',
      modelName: 'Market Trend Analyzer',
      dailyPredictions: 445,
      accuracyTrend: [90.1, 90.8, 91.3, 91.8, 92.0, 92.1, 92.3],
      latencyTrend: [42, 39, 36, 34, 33, 34, 34],
      errorRate: 2.1,
      lastOptimization: '2024-01-16'
    }
  ];

  return NextResponse.json(modelPerformance);
}
