export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  currency: string;
  status: string;
  deadline: Date;
  createdAt: Date;
  userId: string;
  attachments: string;
  updatedAt: string;
  paymentTerms?: string;
  isVerified?: boolean;
  supplierCount?: number;
  quoteCount?: number;
}

export interface RFQFilter {
  category?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  location?: string;
  status?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface RFQSearchParams {
  query: string;
  filters: RFQFilter;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
