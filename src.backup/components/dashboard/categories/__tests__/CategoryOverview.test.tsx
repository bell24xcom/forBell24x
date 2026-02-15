import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CategoryOverview } from '../CategoryOverview';
import { categoryService } from '../../../../services/categories/CategoryService';

// Mock the category service
jest.mock('../../../../services/categories/CategoryService', () => ({
  categoryService: {
    getCategories: jest.fn(),
    getCategoryStats: jest.fn()
  }
}));

describe('CategoryOverview', () => {
  const mockCategories = [
    {
      id: 'electronics',
      name: 'Electronics',
      description: 'Electronic components',
      icon: '🔌',
      totalRfqs: 150,
      activeRfqs: 45,
      subcategories: [
        {
          id: 'semiconductors',
          name: 'Semiconductors',
          description: 'Semiconductor components',
          parentId: 'electronics',
          totalRfqs: 60,
          activeRfqs: 20,
          lastUpdated: new Date('2024-03-15')
        }
      ]
    }
  ];

  const mockStats = {
    totalCategories: 1,
    totalSubcategories: 1,
    totalRfqs: 150,
    activeRfqs: 45,
    topCategories: mockCategories,
    recentActivity: [
      {
        categoryId: 'electronics',
        categoryName: 'Electronics',
        action: 'new' as const,
        timestamp: new Date('2024-03-15T10:00:00')
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (categoryService.getCategories as jest.Mock).mockResolvedValue(mockCategories);
    (categoryService.getCategoryStats as jest.Mock).mockResolvedValue(mockStats);
  });

  it('renders loading state initially', () => {
    render(<CategoryOverview />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when data fetching fails', async () => {
    (categoryService.getCategories as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));
    render(<CategoryOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch category data')).toBeInTheDocument();
    });
  });

  it('renders category data when loaded successfully', async () => {
    render(<CategoryOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('Categories & RFQs')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });
  });

  it('displays correct statistics', async () => {
    render(<CategoryOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Total Categories
      expect(screen.getByText('150')).toBeInTheDocument(); // Total RFQs
      expect(screen.getByText('45')).toBeInTheDocument(); // Active RFQs
    });
  });

  it('displays recent activity', async () => {
    render(<CategoryOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('new')).toBeInTheDocument();
    });
  });

  it('handles empty categories gracefully', async () => {
    (categoryService.getCategories as jest.Mock).mockResolvedValue([]);
    (categoryService.getCategoryStats as jest.Mock).mockResolvedValue({
      ...mockStats,
      totalCategories: 0,
      totalSubcategories: 0,
      totalRfqs: 0,
      activeRfqs: 0,
      topCategories: [],
      recentActivity: []
    });

    render(<CategoryOverview />);
    
    await waitFor(() => {
      expect(screen.getByText('Categories & RFQs')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Total Categories
    });
  });
}); 