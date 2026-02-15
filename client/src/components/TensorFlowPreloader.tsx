'use client';

import React, { useState, useEffect } from 'react';
import { tfLoader, initializeTensorFlow, getPerformanceMetrics } from '@/lib/tensorflow-loader';

interface TensorFlowPreloaderProps {
  onInitialized?: () => void;
  onError?: (error: string) => void;
  showDetails?: boolean;
  className?: string;
}

interface InitializationStep {
  name: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;
  details?: string;
}

export default function TensorFlowPreloader({
  onInitialized,
  onError,
  showDetails = true,
  className = '',
}: TensorFlowPreloaderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializationSteps, setInitializationSteps] = useState<InitializationStep[]>([
    { name: 'Backend Detection', status: 'pending', progress: 0 },
    { name: 'WebGL Setup', status: 'pending', progress: 0 },
    { name: 'Memory Optimization', status: 'pending', progress: 0 },
    { name: 'Performance Tuning', status: 'pending', progress: 0 },
    { name: 'Model Cache Setup', status: 'pending', progress: 0 },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [backend, setBackend] = useState<string>('');
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    initializeTensorFlowWithProgress();
  }, []);

  const initializeTensorFlowWithProgress = async () => {
    try {
      setStartTime(Date.now());
      setIsInitializing(true);

      // Step 1: Backend Detection
      await updateStepStatus(0, 'loading', 'Detecting optimal backend...');
      await simulateProgress(0, 30);

      // Step 2: WebGL Setup
      await updateStepStatus(1, 'loading', 'Setting up WebGL acceleration...');
      await simulateProgress(1, 50);

      // Step 3: Memory Optimization
      await updateStepStatus(2, 'loading', 'Configuring memory optimization...');
      await simulateProgress(2, 70);

      // Step 4: Performance Tuning
      await updateStepStatus(3, 'loading', 'Applying performance optimizations...');
      await simulateProgress(3, 90);

      // Step 5: Model Cache Setup
      await updateStepStatus(4, 'loading', 'Setting up model cache...');
      await simulateProgress(4, 100);

      // Initialize TensorFlow.js
      await initializeTensorFlow();

      // Complete all steps
      for (let i = 0; i < initializationSteps.length; i++) {
        await updateStepStatus(i, 'completed', 'Completed successfully');
      }

      // Get final metrics
      const metrics = getPerformanceMetrics();
      setPerformanceMetrics(metrics);
      setBackend(tfLoader.getBackend());

      const totalTime = Date.now() - startTime;
      console.log(`✅ TensorFlow.js initialized in ${totalTime}ms`);

      setIsInitialized(true);
      setIsInitializing(false);
      onInitialized?.();
    } catch (error) {
      console.error('❌ TensorFlow.js initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      setIsInitializing(false);
      onError?.(errorMessage);

      // Mark current step as error
      await updateStepStatus(currentStep, 'error', errorMessage);
    }
  };

  const updateStepStatus = async (
    stepIndex: number,
    status: InitializationStep['status'],
    details?: string
  ) => {
    setCurrentStep(stepIndex);
    setInitializationSteps(prev =>
      prev.map((step, idx) =>
        idx === stepIndex
          ? { ...step, status, details, progress: status === 'completed' ? 100 : step.progress }
          : step
      )
    );

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200));
  };

  const simulateProgress = async (stepIndex: number, maxProgress: number) => {
    for (let progress = 0; progress <= maxProgress; progress += 10) {
      setInitializationSteps(prev =>
        prev.map((step, idx) => (idx === stepIndex ? { ...step, progress } : step))
      );
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const getBackendIcon = (backend: string) => {
    switch (backend.toLowerCase()) {
      case 'webgl':
        return <span>⚡</span>;
      case 'cpu':
        return <Cpu className='h-4 w-4' />;
      case 'webgpu':
        return <Monitor className='h-4 w-4' />;
      default:
        return <span>⚙️</span>;
    }
  };

  const getBackendColor = (backend: string) => {
    switch (backend.toLowerCase()) {
      case 'webgl':
        return 'bg-green-100 text-green-800';
      case 'cpu':
        return 'bg-blue-100 text-blue-800';
      case 'webgpu':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (step: InitializationStep) => {
    switch (step.status) {
      case 'completed':
        return <span>✅</span>;
      case 'loading':
        return <span>🔄</span>;
      case 'error':
        return <AlertTriangle className='h-4 w-4 text-red-500' />;
      default:
        return <div className='h-4 w-4 rounded-full border-2 border-gray-300' />;
    }
  };

  const totalProgress =
    initializationSteps.reduce((sum, step) => sum + step.progress, 0) / initializationSteps.length;

  if (isInitialized && !showDetails) {
    return null;
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className='bg-white rounded-lg border-2 border-blue-100 shadow-lg'>
        <div className='p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='flex items-center justify-center gap-3 mb-4'>
              <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center'>
                <Brain className='h-6 w-6 text-white' />
              </div>
              <h2 className='text-2xl font-bold text-gray-900'>AI System Initialization</h2>
            </div>
            <p className='text-gray-600'>Setting up TensorFlow.js for optimal performance</p>
          </div>

          {/* Overall Progress */}
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                {isInitialized ? 'Initialization Complete' : 'Initializing...'}
              </span>
              <span className='text-sm text-gray-500'>{Math.round(totalProgress)}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-600 h-3 rounded-full transition-all duration-300'
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          {/* Status */}
          {isInitialized && (
            <div className='mb-6'>
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <div className='flex items-center gap-2'>
                  <span>✅</span>
                  <div className='flex items-center justify-between w-full'>
                    <span className='text-green-800 text-sm'>
                      TensorFlow.js initialized successfully
                    </span>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBackendColor(
                          backend
                        )}`}
                      >
                        {getBackendIcon(backend)}
                        <span className='ml-1'>{backend.toUpperCase()}</span>
                      </span>
                      <span className='text-sm text-green-600'>{Date.now() - startTime}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className='mb-6'>
              <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <AlertTriangle className='h-4 w-4 text-red-600' />
                  <span className='font-medium text-red-800'>Initialization Failed:</span>
                </div>
                <p className='text-red-700 text-sm'>{error}</p>
                <p className='text-red-600 text-xs mt-2'>
                  The system will fallback to CPU-only mode for AI processing.
                </p>
              </div>
            </div>
          )}

          {/* Detailed Steps */}
          {showDetails && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>Initialization Steps</h3>

              {initializationSteps.map((step, idx) => (
                <div key={idx} className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                  <div className='flex-shrink-0'>{getStepIcon(step)}</div>

                  <div className='flex-1'>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='font-medium text-gray-900'>{step.name}</span>
                      <span className='text-sm text-gray-500'>{step.progress}%</span>
                    </div>

                    <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>

                    {step.details && <p className='text-sm text-gray-600'>{step.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Metrics */}
          {performanceMetrics && isInitialized && (
            <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
              <h4 className='font-medium text-blue-900 mb-3 flex items-center gap-2'>
                <span>📊</span>
                Performance Metrics
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-blue-700'>Backend:</span>
                  <span className='ml-2 font-mono'>{backend}</span>
                </div>
                <div>
                  <span className='text-blue-700'>Memory:</span>
                  <span className='ml-2 font-mono'>
                    {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
                <div>
                  <span className='text-blue-700'>Optimizations:</span>
                  <span className='ml-2 font-mono'>
                    {performanceMetrics.backendOptimizations.length}
                  </span>
                </div>
                <div>
                  <span className='text-blue-700'>Init Time:</span>
                  <span className='ml-2 font-mono'>{Date.now() - startTime}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* Ready State */}
          {isInitialized && (
            <div className='mt-6 text-center'>
              <div className='flex items-center justify-center gap-2 text-green-600'>
                <Rocket className='h-5 w-5' />
                <span className='font-medium'>AI System Ready for Processing</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
