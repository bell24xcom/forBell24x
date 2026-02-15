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

export interface RFQSearchParams {
  query?: string;
  category?: string;
  location?: string;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  limit?: number;
}

export interface RFQSearchResponse {
  rfqs: RFQ[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class RFQService {
  async searchRFQs(params: RFQSearchParams): Promise<RFQSearchResponse> {
    // Mock implementation - in real app would call API
    const mockRFQs: RFQ[] = [
      {
        id: '1',
        title: 'Electronics Components Supply',
        description: 'Looking for reliable suppliers of electronic components for manufacturing',
        category: 'Electronics',
        location: 'Mumbai',
        budget: 50000,
        currency: 'INR',
        status: 'open',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        userId: 'user1',
        attachments: '',
        updatedAt: '',
        paymentTerms: '',
        isVerified: false,
        supplierCount: 0,
        quoteCount: 0,
      },
      {
        id: '2',
        title: 'Textile Manufacturing Equipment',
        description: 'Need textile manufacturing equipment for new factory setup',
        category: 'Textiles',
        location: 'Delhi',
        budget: 200000,
        currency: 'INR',
        status: 'open',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        userId: 'user2',
        attachments: '',
        updatedAt: '',
        paymentTerms: '',
        isVerified: false,
        supplierCount: 0,
        quoteCount: 0,
      },
    ];

    // Apply filters
    let filteredRFQs = mockRFQs;

    if (params.query) {
      filteredRFQs = filteredRFQs.filter(
        rfq =>
          rfq.title.toLowerCase().includes(params.query!.toLowerCase()) ||
          rfq.description.toLowerCase().includes(params.query!.toLowerCase())
      );
    }

    if (params.category) {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.category === params.category);
    }

    if (params.location) {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.location === params.location);
    }

    if (params.status) {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.status === params.status);
    }

    if (params.minBudget) {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.budget >= params.minBudget!);
    }

    if (params.maxBudget) {
      filteredRFQs = filteredRFQs.filter(rfq => rfq.budget <= params.maxBudget!);
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRFQs = filteredRFQs.slice(startIndex, endIndex);

    return {
      rfqs: paginatedRFQs,
      total: filteredRFQs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredRFQs.length / limit),
    };
  }

  async getRFQById(id: string): Promise<RFQ | null> {
    // Mock implementation - in real app would call API
    const mockRFQs: RFQ[] = [
      {
        id: '1',
        title: 'Electronics Components Supply',
        description: 'Looking for reliable suppliers of electronic components for manufacturing',
        category: 'Electronics',
        location: 'Mumbai',
        budget: 50000,
        currency: 'INR',
        status: 'open',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        userId: 'user1',
        attachments: '',
        updatedAt: '',
        paymentTerms: '',
        isVerified: false,
        supplierCount: 0,
        quoteCount: 0,
      },
    ];

    return mockRFQs.find(rfq => rfq.id === id) || null;
  }
}

export const rfqService = new RFQService();
