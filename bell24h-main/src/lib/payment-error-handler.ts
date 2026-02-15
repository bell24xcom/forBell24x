import { NextRequest, NextResponse } from 'next/server';

// Error types and codes
export enum PaymentErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  PAYMENT_NOT_FOUND = 'PAYMENT_NOT_FOUND',
  REFUND_FAILED = 'REFUND_FAILED',
  ESCROW_ERROR = 'ESCROW_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
}

export interface PaymentError {
  type: PaymentErrorType;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  userMessage: string;
}

export class PaymentErrorHandler {
  private static instance: PaymentErrorHandler;
  private errorLogs: PaymentError[] = [];

  static getInstance(): PaymentErrorHandler {
    if (!PaymentErrorHandler.instance) {
      PaymentErrorHandler.instance = new PaymentErrorHandler();
    }
    return PaymentErrorHandler.instance;
  }

  // Create standardized error
  createError(
    type: PaymentErrorType,
    message: string,
    details?: any,
    requestId?: string
  ): PaymentError {
    const error: PaymentError = {
      type,
      code: this.getErrorCode(type),
      message,
      details,
      timestamp: new Date().toISOString(),
      requestId: requestId || this.generateRequestId(),
      severity: this.getErrorSeverity(type),
      retryable: this.isRetryable(type),
      userMessage: this.getUserMessage(type, message)
    };

    this.logError(error);
    return error;
  }

  // Handle Razorpay specific errors
  handleRazorpayError(error: any, requestId?: string): PaymentError {
    let errorType: PaymentErrorType;
    let message: string;
    let userMessage: string;

    // Parse Razorpay error
    if (error.error) {
      const razorpayError = error.error;
      
      switch (razorpayError.code) {
        case 'BAD_REQUEST_ERROR':
          errorType = PaymentErrorType.VALIDATION_ERROR;
          message = `Bad Request: ${razorpayError.description}`;
          userMessage = 'Invalid payment request. Please check your details and try again.';
          break;
          
        case 'GATEWAY_ERROR':
          errorType = PaymentErrorType.EXTERNAL_API_ERROR;
          message = `Gateway Error: ${razorpayError.description}`;
          userMessage = 'Payment gateway is temporarily unavailable. Please try again later.';
          break;
          
        case 'NETWORK_ERROR':
          errorType = PaymentErrorType.NETWORK_ERROR;
          message = `Network Error: ${razorpayError.description}`;
          userMessage = 'Network connection issue. Please check your internet and try again.';
          break;
          
        case 'SERVER_ERROR':
          errorType = PaymentErrorType.EXTERNAL_API_ERROR;
          message = `Server Error: ${razorpayError.description}`;
          userMessage = 'Payment service is temporarily down. Please try again later.';
          break;
          
        case 'INVALID_REQUEST_ERROR':
          errorType = PaymentErrorType.VALIDATION_ERROR;
          message = `Invalid Request: ${razorpayError.description}`;
          userMessage = 'Invalid payment details. Please verify and try again.';
          break;
          
        case 'AUTHENTICATION_ERROR':
          errorType = PaymentErrorType.AUTHENTICATION_ERROR;
          message = `Authentication Error: ${razorpayError.description}`;
          userMessage = 'Payment authentication failed. Please contact support.';
          break;
          
        default:
          errorType = PaymentErrorType.EXTERNAL_API_ERROR;
          message = `Unknown Razorpay Error: ${razorpayError.description}`;
          userMessage = 'Payment processing failed. Please try again or contact support.';
      }
    } else {
      errorType = PaymentErrorType.INTERNAL_ERROR;
      message = error.message || 'Unknown error occurred';
      userMessage = 'An unexpected error occurred. Please try again.';
    }

    return this.createError(errorType, message, error, requestId);
  }

  // Handle validation errors
  handleValidationError(errors: string[], requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.VALIDATION_ERROR,
      `Validation failed: ${errors.join(', ')}`,
      { validationErrors: errors },
      requestId
    );
  }

  // Handle network errors
  handleNetworkError(error: any, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.NETWORK_ERROR,
      `Network error: ${error.message}`,
      error,
      requestId
    );
  }

  // Handle timeout errors
  handleTimeoutError(operation: string, timeout: number, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.TIMEOUT_ERROR,
      `Operation '${operation}' timed out after ${timeout}ms`,
      { operation, timeout },
      requestId
    );
  }

  // Handle rate limit errors
  handleRateLimitError(limit: number, window: number, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.RATE_LIMIT_ERROR,
      `Rate limit exceeded: ${limit} requests per ${window}ms`,
      { limit, window },
      requestId
    );
  }

  // Handle insufficient funds
  handleInsufficientFunds(required: number, available: number, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.INSUFFICIENT_FUNDS,
      `Insufficient funds: Required ${required}, Available ${available}`,
      { required, available },
      requestId
    );
  }

  // Handle payment declined
  handlePaymentDeclined(reason: string, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.PAYMENT_DECLINED,
      `Payment declined: ${reason}`,
      { reason },
      requestId
    );
  }

  // Handle duplicate payment
  handleDuplicatePayment(paymentId: string, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.DUPLICATE_PAYMENT,
      `Duplicate payment detected: ${paymentId}`,
      { paymentId },
      requestId
    );
  }

  // Handle invalid signature
  handleInvalidSignature(requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.INVALID_SIGNATURE,
      'Invalid payment signature',
      {},
      requestId
    );
  }

  // Handle order not found
  handleOrderNotFound(orderId: string, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.ORDER_NOT_FOUND,
      `Order not found: ${orderId}`,
      { orderId },
      requestId
    );
  }

  // Handle payment not found
  handlePaymentNotFound(paymentId: string, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.PAYMENT_NOT_FOUND,
      `Payment not found: ${paymentId}`,
      { paymentId },
      requestId
    );
  }

  // Handle refund failed
  handleRefundFailed(paymentId: string, reason: string, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.REFUND_FAILED,
      `Refund failed for payment ${paymentId}: ${reason}`,
      { paymentId, reason },
      requestId
    );
  }

  // Handle escrow errors
  handleEscrowError(operation: string, reason: string, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.ESCROW_ERROR,
      `Escrow ${operation} failed: ${reason}`,
      { operation, reason },
      requestId
    );
  }

  // Handle wallet errors
  handleWalletError(operation: string, reason: string, requestId?: string): PaymentError {
    return this.createError(
      PaymentErrorType.WALLET_ERROR,
      `Wallet ${operation} failed: ${reason}`,
      { operation, reason },
      requestId
    );
  }

  // Create error response
  createErrorResponse(error: PaymentError, request?: NextRequest): NextResponse {
    const statusCode = this.getStatusCode(error.type);
    
    const response = NextResponse.json({
      success: false,
      error: {
        type: error.type,
        code: error.code,
        message: error.userMessage,
        requestId: error.requestId,
        timestamp: error.timestamp,
        retryable: error.retryable
      }
    }, { status: statusCode });

    // Add security headers
    response.headers.set('X-Request-ID', error.requestId);
    response.headers.set('X-Error-Type', error.type);
    
    if (error.retryable) {
      response.headers.set('Retry-After', '60');
    }

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error, request);
    }

    return response;
  }

  // Create success response with error handling
  createSuccessResponse(data: any, requestId?: string): NextResponse {
    const response = NextResponse.json({
      success: true,
      data,
      requestId: requestId || this.generateRequestId(),
      timestamp: new Date().toISOString()
    });

    response.headers.set('X-Request-ID', requestId || this.generateRequestId());
    return response;
  }

  // Retry logic for retryable errors
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Check if error is retryable
        const paymentError = this.handleRazorpayError(error);
        if (!paymentError.retryable || attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }

  // Private helper methods
  private getErrorCode(type: PaymentErrorType): string {
    const codes: Record<PaymentErrorType, string> = {
      [PaymentErrorType.VALIDATION_ERROR]: 'PAY_VAL_001',
      [PaymentErrorType.AUTHENTICATION_ERROR]: 'PAY_AUTH_001',
      [PaymentErrorType.AUTHORIZATION_ERROR]: 'PAY_AUTH_002',
      [PaymentErrorType.NETWORK_ERROR]: 'PAY_NET_001',
      [PaymentErrorType.TIMEOUT_ERROR]: 'PAY_TIME_001',
      [PaymentErrorType.RATE_LIMIT_ERROR]: 'PAY_RATE_001',
      [PaymentErrorType.INSUFFICIENT_FUNDS]: 'PAY_FUND_001',
      [PaymentErrorType.PAYMENT_DECLINED]: 'PAY_DECL_001',
      [PaymentErrorType.DUPLICATE_PAYMENT]: 'PAY_DUPL_001',
      [PaymentErrorType.INVALID_SIGNATURE]: 'PAY_SIGN_001',
      [PaymentErrorType.ORDER_NOT_FOUND]: 'PAY_ORDER_001',
      [PaymentErrorType.PAYMENT_NOT_FOUND]: 'PAY_PAY_001',
      [PaymentErrorType.REFUND_FAILED]: 'PAY_REF_001',
      [PaymentErrorType.ESCROW_ERROR]: 'PAY_ESC_001',
      [PaymentErrorType.WALLET_ERROR]: 'PAY_WAL_001',
      [PaymentErrorType.INTERNAL_ERROR]: 'PAY_INT_001',
      [PaymentErrorType.EXTERNAL_API_ERROR]: 'PAY_EXT_001'
    };
    
    return codes[type] || 'PAY_UNKNOWN_001';
  }

  private getErrorSeverity(type: PaymentErrorType): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<PaymentErrorType, 'low' | 'medium' | 'high' | 'critical'> = {
      [PaymentErrorType.VALIDATION_ERROR]: 'low',
      [PaymentErrorType.AUTHENTICATION_ERROR]: 'high',
      [PaymentErrorType.AUTHORIZATION_ERROR]: 'high',
      [PaymentErrorType.NETWORK_ERROR]: 'medium',
      [PaymentErrorType.TIMEOUT_ERROR]: 'medium',
      [PaymentErrorType.RATE_LIMIT_ERROR]: 'medium',
      [PaymentErrorType.INSUFFICIENT_FUNDS]: 'low',
      [PaymentErrorType.PAYMENT_DECLINED]: 'low',
      [PaymentErrorType.DUPLICATE_PAYMENT]: 'high',
      [PaymentErrorType.INVALID_SIGNATURE]: 'critical',
      [PaymentErrorType.ORDER_NOT_FOUND]: 'medium',
      [PaymentErrorType.PAYMENT_NOT_FOUND]: 'medium',
      [PaymentErrorType.REFUND_FAILED]: 'high',
      [PaymentErrorType.ESCROW_ERROR]: 'high',
      [PaymentErrorType.WALLET_ERROR]: 'high',
      [PaymentErrorType.INTERNAL_ERROR]: 'critical',
      [PaymentErrorType.EXTERNAL_API_ERROR]: 'high'
    };
    
    return severityMap[type] || 'medium';
  }

  private isRetryable(type: PaymentErrorType): boolean {
    const retryableTypes = [
      PaymentErrorType.NETWORK_ERROR,
      PaymentErrorType.TIMEOUT_ERROR,
      PaymentErrorType.EXTERNAL_API_ERROR,
      PaymentErrorType.RATE_LIMIT_ERROR
    ];
    
    return retryableTypes.includes(type);
  }

  private getUserMessage(type: PaymentErrorType, originalMessage: string): string {
    const userMessages: Record<PaymentErrorType, string> = {
      [PaymentErrorType.VALIDATION_ERROR]: 'Please check your payment details and try again.',
      [PaymentErrorType.AUTHENTICATION_ERROR]: 'Payment authentication failed. Please contact support.',
      [PaymentErrorType.AUTHORIZATION_ERROR]: 'You are not authorized to perform this action.',
      [PaymentErrorType.NETWORK_ERROR]: 'Network connection issue. Please try again.',
      [PaymentErrorType.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
      [PaymentErrorType.RATE_LIMIT_ERROR]: 'Too many requests. Please wait and try again.',
      [PaymentErrorType.INSUFFICIENT_FUNDS]: 'Insufficient funds in your account.',
      [PaymentErrorType.PAYMENT_DECLINED]: 'Payment was declined by your bank.',
      [PaymentErrorType.DUPLICATE_PAYMENT]: 'Duplicate payment detected.',
      [PaymentErrorType.INVALID_SIGNATURE]: 'Invalid payment signature. Please contact support.',
      [PaymentErrorType.ORDER_NOT_FOUND]: 'Payment order not found.',
      [PaymentErrorType.PAYMENT_NOT_FOUND]: 'Payment not found.',
      [PaymentErrorType.REFUND_FAILED]: 'Refund processing failed. Please contact support.',
      [PaymentErrorType.ESCROW_ERROR]: 'Escrow operation failed. Please contact support.',
      [PaymentErrorType.WALLET_ERROR]: 'Wallet operation failed. Please try again.',
      [PaymentErrorType.INTERNAL_ERROR]: 'Internal server error. Please contact support.',
      [PaymentErrorType.EXTERNAL_API_ERROR]: 'Payment service temporarily unavailable.'
    };
    
    return userMessages[type] || 'An unexpected error occurred. Please try again.';
  }

  private getStatusCode(type: PaymentErrorType): number {
    const statusCodes: Record<PaymentErrorType, number> = {
      [PaymentErrorType.VALIDATION_ERROR]: 400,
      [PaymentErrorType.AUTHENTICATION_ERROR]: 401,
      [PaymentErrorType.AUTHORIZATION_ERROR]: 403,
      [PaymentErrorType.NETWORK_ERROR]: 502,
      [PaymentErrorType.TIMEOUT_ERROR]: 504,
      [PaymentErrorType.RATE_LIMIT_ERROR]: 429,
      [PaymentErrorType.INSUFFICIENT_FUNDS]: 402,
      [PaymentErrorType.PAYMENT_DECLINED]: 402,
      [PaymentErrorType.DUPLICATE_PAYMENT]: 409,
      [PaymentErrorType.INVALID_SIGNATURE]: 400,
      [PaymentErrorType.ORDER_NOT_FOUND]: 404,
      [PaymentErrorType.PAYMENT_NOT_FOUND]: 404,
      [PaymentErrorType.REFUND_FAILED]: 422,
      [PaymentErrorType.ESCROW_ERROR]: 422,
      [PaymentErrorType.WALLET_ERROR]: 422,
      [PaymentErrorType.INTERNAL_ERROR]: 500,
      [PaymentErrorType.EXTERNAL_API_ERROR]: 502
    };
    
    return statusCodes[type] || 500;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(error: PaymentError): void {
    this.errorLogs.push(error);
    
    // Keep only last 1000 errors in memory
    if (this.errorLogs.length > 1000) {
      this.errorLogs = this.errorLogs.slice(-1000);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${error.severity.toUpperCase()}] ${error.code}: ${error.message}`, error.details);
    }
  }

  private sendToMonitoring(error: PaymentError, request?: NextRequest): void {
    // In production, send to monitoring service (Sentry, DataDog, etc.)
    // This is a placeholder implementation
    const monitoringData = {
      error,
      request: request ? {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      } : null,
      timestamp: new Date().toISOString()
    };
    
    // Send to monitoring service
    // monitoringService.logError(monitoringData);
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byType: Record<PaymentErrorType, number>;
    bySeverity: Record<string, number>;
    recentErrors: PaymentError[];
  } {
    const byType: Record<PaymentErrorType, number> = {} as any;
    const bySeverity: Record<string, number> = {};
    
    this.errorLogs.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });
    
    return {
      total: this.errorLogs.length,
      byType,
      bySeverity,
      recentErrors: this.errorLogs.slice(-10)
    };
  }
}

// Export singleton instance
export const paymentErrorHandler = PaymentErrorHandler.getInstance();
