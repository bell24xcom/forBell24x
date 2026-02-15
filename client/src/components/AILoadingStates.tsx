'use client';

import { BarChart3, Brain, Target, Zap } from 'lucide-react';

interface AILoadingStatesProps {
  type: 'nlp' | 'shap' | 'entity' | 'general' | 'testing';
  stage?: string;
  progress?: number;
  message?: string;
}

export default function AILoadingStates({ type, stage, progress, message }: AILoadingStatesProps) {
  const loadingConfigs = {
    nlp: {
      icon: Target,
      title: 'NLP Analysis',
      description: 'Analyzing text with BERT classification',
      color: 'blue',
      stages: [
        'Preprocessing text input...',
        'Running BERT classification...',
        'Extracting entities...',
        'Analyzing sentiment...',
        'Determining urgency...',
        'Finalizing results...',
      ],
    },
    shap: {
      icon: BarChart3,
      title: 'SHAP Explanations',
      description: 'Generating explainable AI insights',
      color: 'purple',
      stages: [
        'Loading supplier data...',
        'Calculating feature importance...',
        'Generating SHAP values...',
        'Analyzing risk factors...',
        'Creating visualizations...',
        'Preparing recommendations...',
      ],
    },
    entity: {
      icon: Zap,
      title: 'Entity Extraction',
      description: 'Extracting companies, locations, and products',
      color: 'green',
      stages: [
        'Tokenizing text...',
        'Identifying entities...',
        'Extracting companies...',
        'Finding locations...',
        'Detecting products...',
        'Validating results...',
      ],
    },
    testing: {
      icon: Brain,
      title: 'AI System Testing',
      description: 'Running comprehensive AI tests',
      color: 'indigo',
      stages: [
        'Initializing test suite...',
        'Testing NLP categorization...',
        'Verifying SHAP explanations...',
        'Checking entity extraction...',
        'Running performance benchmarks...',
        'Validating error handling...',
      ],
    },
    general: {
      icon: Brain,
      title: 'AI Processing',
      description: 'Processing with advanced AI',
      color: 'blue',
      stages: [
        'Initializing AI models...',
        'Processing data...',
        'Analyzing patterns...',
        'Generating insights...',
        'Preparing results...',
      ],
    },
  };

  const config = loadingConfigs[type];
  const Icon = config.icon;
  const currentStage = stage || config.stages[0];
  const progressValue = progress || 0;

  const getColorClasses = (color: 'blue' | 'purple' | 'green' | 'indigo') => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200',
        bgLight: 'bg-blue-50',
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-200',
        bgLight: 'bg-purple-50',
      },
      green: {
        bg: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-200',
        bgLight: 'bg-green-50',
      },
      indigo: {
        bg: 'bg-indigo-500',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        bgLight: 'bg-indigo-50',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(config.color as 'blue' | 'purple' | 'green' | 'indigo');

  return (
    <div className={`${colors.bgLight} rounded-lg p-6 border ${colors.border}`}>
      <div className='flex items-center space-x-4'>
        {/* Animated Icon */}
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <Icon className='h-6 w-6 text-white animate-pulse' />
        </div>

        {/* Loading Content */}
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className={`font-semibold ${colors.text}`}>{config.title}</h3>
            {progress !== undefined && (
              <span className={`text-sm font-medium ${colors.text}`}>
                {Math.round(progressValue)}%
              </span>
            )}
          </div>

          <p className='text-gray-600 text-sm mb-3'>{config.description}</p>

          {/* Progress Bar */}
          <div className='w-full bg-gray-200 rounded-full h-2 mb-3'>
            <div
              className={`${colors.bg} h-2 rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${progressValue}%` }}
            />
          </div>

          {/* Current Stage */}
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin'></div>
            <span>{message || currentStage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loading Components
export function AICardSkeleton() {
  return (
    <div className='bg-white rounded-lg p-6 border border-gray-200 animate-pulse'>
      <div className='flex items-center space-x-3 mb-4'>
        <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
        <div className='flex-1'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-3 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
      <div className='space-y-2'>
        <div className='h-3 bg-gray-200 rounded w-full'></div>
        <div className='h-3 bg-gray-200 rounded w-5/6'></div>
        <div className='h-3 bg-gray-200 rounded w-4/6'></div>
      </div>
    </div>
  );
}

export function AIChartSkeleton() {
  return (
    <div className='bg-white rounded-lg p-6 border border-gray-200 animate-pulse'>
      <div className='flex items-center space-x-3 mb-6'>
        <div className='w-8 h-8 bg-gray-200 rounded'></div>
        <div className='h-4 bg-gray-200 rounded w-1/3'></div>
      </div>
      <div className='space-y-4'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center space-x-3'>
            <div className='h-3 bg-gray-200 rounded w-1/4'></div>
            <div className='flex-1 bg-gray-200 rounded h-2'></div>
            <div className='h-3 bg-gray-200 rounded w-12'></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AITableSkeleton() {
  return (
    <div className='bg-white rounded-lg border border-gray-200 animate-pulse'>
      <div className='p-4 border-b border-gray-200'>
        <div className='h-4 bg-gray-200 rounded w-1/3'></div>
      </div>
      <div className='divide-y divide-gray-200'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='p-4 flex items-center space-x-4'>
            <div className='w-8 h-8 bg-gray-200 rounded'></div>
            <div className='flex-1 space-y-2'>
              <div className='h-3 bg-gray-200 rounded w-3/4'></div>
              <div className='h-3 bg-gray-200 rounded w-1/2'></div>
            </div>
            <div className='h-3 bg-gray-200 rounded w-16'></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error State Components
interface AIErrorStateProps {
  error: string;
  type: 'nlp' | 'shap' | 'entity' | 'general' | 'testing';
  onRetry?: () => void;
  onFallback?: () => void;
}

export function AIErrorState({ error, type, onRetry, onFallback }: AIErrorStateProps) {
  const errorConfigs = {
    nlp: {
      icon: AlertCircle,
      title: 'NLP Analysis Failed',
      description: 'The text analysis could not be completed',
      color: 'red',
      suggestions: [
        'Check if the text contains valid content',
        'Try with a shorter text input',
        'Verify AI model is loaded correctly',
      ],
    },
    shap: {
      icon: AlertCircle,
      title: 'SHAP Explanations Unavailable',
      description: 'Could not generate AI explanations',
      color: 'red',
      suggestions: [
        'Ensure supplier data is available',
        'Check if SHAP model is initialized',
        'Try with different supplier criteria',
      ],
    },
    entity: {
      icon: AlertCircle,
      title: 'Entity Extraction Failed',
      description: 'Could not extract entities from text',
      color: 'red',
      suggestions: [
        'Verify text contains recognizable entities',
        'Check entity extraction patterns',
        'Try with more detailed text',
      ],
    },
    testing: {
      icon: AlertCircle,
      title: 'AI Testing Failed',
      description: 'Test execution encountered errors',
      color: 'red',
      suggestions: [
        'Check AI model availability',
        'Verify test data integrity',
        'Ensure proper test configuration',
      ],
    },
    general: {
      icon: AlertCircle,
      title: 'AI Processing Error',
      description: 'An error occurred during AI processing',
      color: 'red',
      suggestions: [
        'Check network connectivity',
        'Verify AI services are running',
        'Try again in a few moments',
      ],
    },
  };

  const config = errorConfigs[type];
  const Icon = config.icon;

  return (
    <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
      <div className='flex items-start space-x-4'>
        <div className='w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
          <Icon className='h-5 w-5 text-red-600' />
        </div>

        <div className='flex-1'>
          <h3 className='font-semibold text-red-900 mb-1'>{config.title}</h3>
          <p className='text-red-700 text-sm mb-3'>{config.description}</p>

          <div className='bg-red-100 rounded-lg p-3 mb-4'>
            <p className='text-red-800 text-sm font-medium'>Error Details:</p>
            <p className='text-red-700 text-sm mt-1'>{error}</p>
          </div>

          <div className='mb-4'>
            <p className='text-red-800 text-sm font-medium mb-2'>Suggestions:</p>
            <ul className='text-red-700 text-sm space-y-1'>
              {config.suggestions.map((suggestion, idx) => (
                <li key={idx} className='flex items-start space-x-2'>
                  <span className='text-red-500 mt-1'>•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className='flex items-center space-x-3'>
            {onRetry && (
              <button
                onClick={onRetry}
                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
              >
                Retry
              </button>
            )}
            {onFallback && (
              <button
                onClick={onFallback}
                className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
              >
                Use Fallback
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Success State Component
interface AISuccessStateProps {
  title: string;
  message: string;
  metrics?: { label: string; value: string }[];
  onContinue?: () => void;
}

export function AISuccessState({ title, message, metrics, onContinue }: AISuccessStateProps) {
  return (
    <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
      <div className='flex items-start space-x-4'>
        <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0'>
          <span>✅</span>
        </div>

        <div className='flex-1'>
          <h3 className='font-semibold text-green-900 mb-1'>{title}</h3>
          <p className='text-green-700 text-sm mb-4'>{message}</p>

          {metrics && metrics.length > 0 && (
            <div className='bg-green-100 rounded-lg p-3 mb-4'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {metrics.map((metric, idx) => (
                  <div key={idx} className='text-center'>
                    <div className='text-green-800 font-semibold'>{metric.value}</div>
                    <div className='text-green-600 text-xs'>{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onContinue && (
            <button
              onClick={onContinue}
              className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors'
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
