import { User } from '@prisma/client';

// Unified User type that includes all necessary properties
export interface UnifiedUser {
  id: number;
  email: string;
  username?: string;
  name?: string;
  role?: string;
  user_type?: string;
  isAdmin?: boolean;
  isEmailVerified?: boolean;
  companyId?: string;
  company?: {
    id: string;
    name: string;
    industry: string;
    website: string | null;
    isVerified: boolean;
    gstNumber: string | null;
    gstVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  [key: string]: any; // Allow for additional properties
}

declare global {
  namespace Express {
    interface Request {
      user?: UnifiedUser;
      isAdmin?: boolean;
      isAuthenticated(): boolean;
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
      filters?: Array<{
        field: string;
        operator: string;
        value: any;
      }>;
      sort?: {
        field: string;
        order: 'asc' | 'desc';
      };
    }
  }
}

// Define common response types for better type safety
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error type extension to ensure error.message is accessible
export interface AppError extends Error {
  status?: number;
  code?: string;
}

// Export type definitions for API responses
export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  error: string;
  details?: any;
}; 