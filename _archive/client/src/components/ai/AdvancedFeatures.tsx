'use client';

import { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, BarChart3, Target, Lightbulb, Settings, Play, Pause, RefreshCw, Download, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  type: 'matching' | 'prediction' | 'nlp' | 'computer_vision';
  status: 'active' | 'training' | 'deployed' | 'archived';
  accuracy: number;
  lastUpdated: string;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    latency: number;
  };
  trainingData: {
    totalSamples: number;
    lastTrainingDate: string;
    trainingDuration: string;
  };
}

interface PredictionResult {
  id: string;
  rfqId: string;
  prediction: string;
  confidence: number;
  factors: string[];
  timestamp: string;
  actualOutcome?: string;
  accuracy: number;
}

interface ModelPerformance {
  modelId: string;
  modelName: string;
  dailyPredictions: number;
  accuracyTrend: number[];
  latencyTrend: number[];
  errorRate: number;
  lastOptimization: string;
}

export default function AdvancedAIFeatures() {
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [performance, setPerformance] = useState<ModelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [autoOptimization, setAutoOptimization] = useState(false);

  useEffect(() => {
    fetchAIAdvancedData();
  }, []);

  const fetchAIAdvancedData = async () => {
    try {
      setLoading(true);
      
      // Fetch AI models
      const modelsResponse = await fetch('/api/ai/advanced-models');
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setAiModels(modelsData);
      }

      // Fetch predictions
      const predictionsResponse = await fetch('/api/ai/predictions');
      if (predictionsResponse.ok) {
        const predictionsData = await predictionsResponse.json();
        setPredictions(predictionsData);
      }

      // Fetch performance
      const performanceResponse = await fetch('/api/ai/model-performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformance(performanceData);
      }
    } catch (error) {
      console.error('Error fetching AI advanced data:', error);
      // Fallback to mock data
      setAiModels(generateMockAIModels());
      setPredictions(generateMockPredictions());
      setPerformance(generateMockPerformance());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAIModels = (): AIModel[] => [
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
    }
  ];

  const generateMockPredictions = (): PredictionResult[] => [
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
    }
  ];

  const generateMockPerformance = (): ModelPerformance[] => [
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
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'training':
        return 'text-blue-600 bg-blue-100';
      case 'deployed':
        return 'text-purple-600 bg-purple-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'training':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'deployed':
        return <Zap className="w-4 h-4 text-purple-600" />;
      case 'archived':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      default:
        return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'matching':
        return <Target className="w-4 h-4 text-blue-600" />;
      case 'prediction':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'nlp':
        return <Brain className="w-4 h-4 text-purple-600" />;
      case 'computer_vision':
        return <Eye className="w-4 h-4 text-orange-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced AI Features</h1>
          <p className="text-gray-600">Advanced machine learning models and predictive analytics</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setAutoOptimization(!autoOptimization)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              autoOptimization 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {autoOptimization ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{autoOptimization ? 'Auto-Optimization ON' : 'Auto-Optimization OFF'}</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* AI Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{aiModels.length}</div>
          <div className="text-sm text-gray-600">Total Models</div>
        </div>
        <div className="bg-green-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {aiModels.filter(m => m.status === 'active').length}
          </div>
          <div className="text-sm text-green-600">Active Models</div>
        </div>
        <div className="bg-blue-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {aiModels.filter(m => m.status === 'training').length}
          </div>
          <div className="text-sm text-blue-600">Training</div>
        </div>
        <div className="bg-purple-100 rounded-lg shadow-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {aiModels.filter(m => m.status === 'deployed').length}
          </div>
          <div className="text-sm text-purple-600">Deployed</div>
        </div>
      </div>

      {/* AI Models Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Models Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Model Type</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="matching">Matching</option>
                <option value="prediction">Prediction</option>
                <option value="nlp">NLP</option>
                <option value="computer_vision">Computer Vision</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="training">Training</option>
                <option value="deployed">Deployed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Refresh Models
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {aiModels
                .filter(model => 
                  (selectedModel === 'all' || model.type === selectedModel) &&
                  (selectedStatus === 'all' || model.status === selectedStatus)
                )
                .map((model) => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(model.type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{model.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(model.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(model.status)}`}>
                        {model.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Accuracy:</span>
                        <span className="font-medium text-gray-900">{model.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">F1 Score:</span>
                        <span className="font-medium text-gray-900">{model.performance.f1Score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Latency:</span>
                        <span className="font-medium text-gray-900">{model.performance.latency}ms</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Samples:</span>
                        <span className="font-medium text-gray-900">{model.trainingData.totalSamples.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Training:</span>
                        <span className="font-medium text-gray-900">{model.trainingData.lastTrainingDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium text-gray-900">{model.trainingData.trainingDuration}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 text-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 text-sm">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900 text-sm">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predictions Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Predictions Analysis</h3>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">RFQ: {prediction.rfqId}</h4>
                  <p className="text-sm text-gray-600">{prediction.prediction}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {getConfidenceLabel(prediction.confidence)} Confidence
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Factors</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {prediction.factors.map((factor, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Prediction Details</h5>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Timestamp: {new Date(prediction.timestamp).toLocaleString()}</div>
                    {prediction.actualOutcome && (
                      <div>Actual: <span className="font-medium">{prediction.actualOutcome}</span></div>
                    )}
                    <div>Accuracy: <span className="font-medium">{prediction.accuracy}%</span></div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Actions</h5>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      View Details
                    </button>
                    <button className="w-full px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                      Update Model
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Accuracy Trends</h3>
          <div className="space-y-4">
            {performance.map((model) => (
              <div key={model.modelId} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{model.modelName}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${model.accuracyTrend[model.accuracyTrend.length - 1]}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {model.accuracyTrend[model.accuracyTrend.length - 1]}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Daily predictions: {model.dailyPredictions} • Error rate: {model.errorRate}%
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {performance.map((model) => (
              <div key={model.modelId} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{model.modelName}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Latency Trend</div>
                    <div className="font-medium text-gray-900">
                      {model.latencyTrend[model.latencyTrend.length - 1]}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Last Optimization</div>
                    <div className="font-medium text-gray-900">{model.lastOptimization}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <button className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                    Optimize Model
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Model Optimization Opportunities</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Supplier Matching model shows 2.3% improvement potential</li>
              <li>• RFQ Predictor could benefit from additional training data</li>
              <li>• NLP model latency can be reduced by 15ms</li>
            </ul>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Performance Highlights</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Overall model accuracy improved by 3.2% this month</li>
              <li>• Average prediction latency reduced by 12ms</li>
              <li>• Training data quality score: 94.7/100</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
