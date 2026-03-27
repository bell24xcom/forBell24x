'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

export class AIExplanationErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    isRetrying: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AI Explanation Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to monitoring service (e.g., Sentry)
    this.logErrorToMonitoring(error, errorInfo);
  }

  private logErrorToMonitoring = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Replace with your actual error monitoring service
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
          tags: {
            component: 'AIExplanation',
            boundary: 'AIExplanationErrorBoundary',
          },
        });
      }
    } catch (loggingError) {
      console.error('Failed to log error to monitoring service:', loggingError);
    }
  };

  private handleRetry = async () => {
    this.setState({ isRetrying: true });

    try {
      // Wait a bit before retrying to avoid immediate failures
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false,
      });
    } catch (error) {
      this.setState({ isRetrying: false });
      console.error('Retry failed:', error);
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleReportIssue = () => {
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Create issue report
    const issueBody = `
## AI Explanation Error Report

**Error Message:** ${errorDetails.error}

**Component Stack:**
\`\`\`
${errorDetails.componentStack}
\`\`\`

**Stack Trace:**
\`\`\`
${errorDetails.stack}
\`\`\`

**Environment:**
- URL: ${errorDetails.url}
- User Agent: ${errorDetails.userAgent}
- Timestamp: ${errorDetails.timestamp}
- Retry Count: ${this.state.retryCount}
    `;

    // Open GitHub issue or send to support
    const encodedBody = encodeURIComponent(issueBody);
    const issueUrl = `https://github.com/your-repo/issues/new?title=AI%20Explanation%20Error&body=${encodedBody}`;

    window.open(issueUrl, '_blank');
  };

  private renderErrorDetails = () => {
    if (!this.props.showDetails || !this.state.error) {
      return null;
    }

    return (
      <div className='mt-6 p-4 bg-slate-800 rounded-lg border border-slate-600'>
        <h4 className='text-sm font-semibold text-white mb-2'>Error Details</h4>
        <div className='space-y-2 text-xs text-slate-300'>
          <div>
            <strong>Error:</strong> {this.state.error.message}
          </div>
          {this.state.errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className='mt-1 p-2 bg-slate-900 rounded text-xs overflow-x-auto'>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          {this.state.error.stack && (
            <div>
              <strong>Stack Trace:</strong>
              <pre className='mt-1 p-2 bg-slate-900 rounded text-xs overflow-x-auto'>
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen bg-slate-900 flex items-center justify-center p-4'>
          <div className='max-w-md w-full bg-slate-800 rounded-xl p-6 border border-slate-600'>
            {/* Error Icon */}
            <div className='flex justify-center mb-4'>
              <div className='w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center'>
                <AlertTriangle className='w-8 h-8 text-red-400' />
              </div>
            </div>

            {/* Error Message */}
            <div className='text-center mb-6'>
              <h2 className='text-xl font-bold text-white mb-2'>AI Explanation Error</h2>
              <p className='text-slate-400 text-sm'>
                We encountered an error while processing AI explanations. This might be due to a
                temporary issue with our AI service.
              </p>
            </div>

            {/* Error Details */}
            {this.renderErrorDetails()}

            {/* Action Buttons */}
            <div className='space-y-3'>
              <button
                onClick={this.handleRetry}
                disabled={this.state.isRetrying}
                className='w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg text-white font-medium transition-colors'
              >
                {this.state.isRetrying ? (
                  <>
                    <span>🔄</span>
                    <span>Retrying...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Try Again</span>
                  </>
                )}
              </button>

              <div className='grid grid-cols-2 gap-3'>
                <button
                  onClick={this.handleGoHome}
                  className='flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white font-medium transition-colors'
                >
                  <span>🏠</span>
                  <span>Go Home</span>
                </button>

                <button
                  onClick={this.handleReportIssue}
                  className='flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-white font-medium transition-colors'
                >
                  <Bug className='w-4 h-4' />
                  <span>Report Issue</span>
                </button>
              </div>
            </div>

            {/* Additional Help */}
            <div className='mt-6 p-4 bg-slate-700/50 rounded-lg'>
              <div className='flex items-start space-x-3'>
                <span>📄</span>
                <div className='text-sm text-slate-300'>
                  <p className='font-medium mb-1'>Need Help?</p>
                  <p className='text-xs'>
                    If this error persists, please check our{' '}
                    <a
                      href='/docs/troubleshooting'
                      className='text-blue-400 hover:text-blue-300 underline'
                    >
                      troubleshooting guide
                    </a>{' '}
                    or contact support.
                  </p>
                </div>
              </div>
            </div>

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <div className='mt-4 text-center text-xs text-slate-500'>
                Retry attempt {this.state.retryCount}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withAIExplanationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  return function WrappedComponent(props: P) {
    return (
      <AIExplanationErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </AIExplanationErrorBoundary>
    );
  };
}

// Hook for handling AI explanation errors
export function useAIExplanationError() {
  const [error, setError] = React.useState<Error | null>(null);
  const [isError, setIsError] = React.useState(false);

  const handleError = React.useCallback((error: Error) => {
    console.error('AI Explanation Error:', error);
    setError(error);
    setIsError(true);

    // Log to monitoring service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          component: 'AIExplanation',
          hook: 'useAIExplanationError',
        },
      });
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  return {
    error,
    isError,
    handleError,
    clearError,
  };
}

// Utility function for creating error-safe async operations
export function createErrorSafeAsync<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  errorHandler?: (error: Error, ...args: T) => void
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      if (errorHandler) {
        errorHandler(errorObj, ...args);
      } else {
        console.error('AI Explanation Error:', errorObj);
      }

      return null;
    }
  };
}
