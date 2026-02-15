'use client';

import React from 'react';

interface AIErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface AIErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class AIErrorBoundary extends React.Component<AIErrorBoundaryProps, AIErrorBoundaryState> {
  constructor(props: AIErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AIErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to external service
    console.error('AI Error Boundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className='bg-red-50 border border-red-200 rounded-lg p-8 text-center'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <AlertTriangle className='h-8 w-8 text-red-600' />
          </div>

          <h3 className='text-lg font-semibold text-red-900 mb-2'>AI Component Error</h3>

          <p className='text-red-700 mb-4'>
            Something went wrong with the AI component. This might be due to a temporary issue.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className='bg-red-100 rounded-lg p-4 mb-4 text-left'>
              <h4 className='font-medium text-red-800 mb-2'>Error Details (Development Only):</h4>
              <pre className='text-xs text-red-700 overflow-x-auto whitespace-pre-wrap'>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}

          <div className='space-y-3'>
            <button
              onClick={this.handleRetry}
              className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2'
            >
              <span>🔄</span>
              <span>Retry</span>
            </button>

            <div className='text-sm text-red-600'>
              If the problem persists, please{' '}
              <a href='/support' className='underline hover:text-red-800'>
                contact support
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export function withAIErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <AIErrorBoundary fallback={fallback}>
        <Component {...props} />
      </AIErrorBoundary>
    );
  };
}

// Hook for error reporting
export function useAIErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    console.error(`AI Error ${context ? `in ${context}` : ''}:`, error);

    // Here you could integrate with error reporting services like:
    // - Sentry
    // - LogRocket
    // - Rollbar
    // - Custom analytics
  };

  return { reportError };
}
