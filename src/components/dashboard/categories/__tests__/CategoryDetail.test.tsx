import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { CategoryDetail } from '../CategoryDetail';
import { categoryService } from '../../../../services/categories/CategoryService';
import userEvent from '@testing-library/user-event';

// Mock the categoryService
jest.mock('../../../../services/categories/CategoryService');

// Mock the useMediaQuery hook
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(() => false)
}));

describe('CategoryDetail', () => {
  const mockCategory = {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic components and devices',
    icon: '🔌',
    totalRfqs: 150,
    activeRfqs: 45,
    subcategories: [
      {
        id: 'semiconductors',
        name: 'Semiconductors',
        description: 'Semiconductor components and chips',
        parentId: 'electronics',
        totalRfqs: 60,
        activeRfqs: 20,
        lastUpdated: new Date('2024-03-15')
      },
      {
        id: 'pcb',
        name: 'Printed Circuit Boards',
        description: 'PCB manufacturing and assembly',
        parentId: 'electronics',
        totalRfqs: 40,
        activeRfqs: 15,
        lastUpdated: new Date('2024-03-14')
      }
    ]
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the getCategoryById method
    (categoryService.getCategoryById as jest.Mock).mockResolvedValue(mockCategory);
  });

  it('renders loading state initially', () => {
    render(<CategoryDetail categoryId="electronics" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders category details after loading', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Electronic components and devices')).toBeInTheDocument();
      expect(screen.getByText('150 Total RFQs')).toBeInTheDocument();
      expect(screen.getByText('45 Active')).toBeInTheDocument();
    });
  });

  it('renders subcategories correctly', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
      expect(screen.getByText('Printed Circuit Boards')).toBeInTheDocument();
    });
  });

  it('filters subcategories based on search query', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search subcategories...');
    fireEvent.change(searchInput, { target: { value: 'PCB' } });

    await waitFor(() => {
      expect(screen.queryByText('Semiconductors')).not.toBeInTheDocument();
      expect(screen.getByText('Printed Circuit Boards')).toBeInTheDocument();
    });
  });

  it('filters subcategories based on date range', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    const dateRangePicker = screen.getByRole('button', { name: /select date range/i });
    fireEvent.click(dateRangePicker);

    // Select a date range that only includes the PCB subcategory
    const startDate = screen.getByRole('button', { name: '14' });
    const endDate = screen.getByRole('button', { name: '14' });
    fireEvent.click(startDate);
    fireEvent.click(endDate);

    await waitFor(() => {
      expect(screen.queryByText('Semiconductors')).not.toBeInTheDocument();
      expect(screen.getByText('Printed Circuit Boards')).toBeInTheDocument();
    });
  });

  it('shows error state when category is not found', async () => {
    (categoryService.getCategoryById as jest.Mock).mockResolvedValue(null);
    
    render(<CategoryDetail categoryId="nonexistent" />);
    
    await waitFor(() => {
      expect(screen.getByText('Category not found')).toBeInTheDocument();
    });
  });

  it('shows error state when API call fails', async () => {
    (categoryService.getCategoryById as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('handles retry button click', async () => {
    (categoryService.getCategoryById as jest.Mock)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockCategory);
    
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
  });

  it('shows no results message when filters return empty', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search subcategories...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No subcategories found matching your filters')).toBeInTheDocument();
    });
  });

  // New test cases for edge cases

  it('handles empty subcategories array', async () => {
    const emptyCategory = {
      ...mockCategory,
      subcategories: []
    };
    (categoryService.getCategoryById as jest.Mock).mockResolvedValue(emptyCategory);

    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('No subcategories found matching your filters')).toBeInTheDocument();
    });
  });

  it('handles very long category names and descriptions', async () => {
    const longCategory = {
      ...mockCategory,
      name: 'A'.repeat(100),
      description: 'B'.repeat(200)
    };
    (categoryService.getCategoryById as jest.Mock).mockResolvedValue(longCategory);

    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
      expect(screen.getByText('B'.repeat(200))).toBeInTheDocument();
    });
  });

  it('handles special characters in search query', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search subcategories...');
    fireEvent.change(searchInput, { target: { value: '!@#$%^&*()' } });

    await waitFor(() => {
      expect(screen.getByText('No subcategories found matching your filters')).toBeInTheDocument();
    });
  });

  it('handles rapid search input changes', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search subcategories...');
    
    // Simulate rapid typing
    for (let i = 0; i < 10; i++) {
      fireEvent.change(searchInput, { target: { value: `search${i}` } });
    }

    // Final search
    fireEvent.change(searchInput, { target: { value: 'PCB' } });

    await waitFor(() => {
      expect(screen.getByText('Printed Circuit Boards')).toBeInTheDocument();
    });
  });

  it('handles view mode switching', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    // Switch to list view
    const listViewButton = screen.getByRole('button', { name: /list view/i });
    fireEvent.click(listViewButton);

    // Check if the layout has changed
    const subcategoryCard = screen.getByText('Semiconductors').closest('.card');
    expect(subcategoryCard).toHaveClass('flex items-center justify-between p-4');

    // Switch back to grid view
    const gridViewButton = screen.getByRole('button', { name: /grid view/i });
    fireEvent.click(gridViewButton);

    // Check if the layout has changed back
    expect(subcategoryCard).not.toHaveClass('flex items-center justify-between p-4');
  });

  it('handles sorting options', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    // Get the sort select
    const sortSelect = screen.getByRole('combobox');
    
    // Sort by active RFQs
    fireEvent.change(sortSelect, { target: { value: 'activeRfqs' } });
    
    const subcategories = screen.getAllByRole('article');
    const firstSubcategory = within(subcategories[0]).getByText('Semiconductors');
    expect(firstSubcategory).toBeInTheDocument();

    // Sort by last updated
    fireEvent.change(sortSelect, { target: { value: 'lastUpdated' } });
    
    const updatedSubcategories = screen.getAllByRole('article');
    const firstUpdatedSubcategory = within(updatedSubcategories[0]).getByText('Semiconductors');
    expect(firstUpdatedSubcategory).toBeInTheDocument();
  });

  it('handles clear filters button', async () => {
    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
    });

    // Apply some filters
    const searchInput = screen.getByPlaceholderText('Search subcategories...');
    fireEvent.change(searchInput, { target: { value: 'PCB' } });

    // Clear filters
    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearButton);

    // Check if all subcategories are visible again
    await waitFor(() => {
      expect(screen.getByText('Semiconductors')).toBeInTheDocument();
      expect(screen.getByText('Printed Circuit Boards')).toBeInTheDocument();
    });
  });

  it('handles mobile view', async () => {
    // Mock mobile view
    (require('@/hooks/useMediaQuery').useMediaQuery as jest.Mock).mockReturnValue(true);

    render(<CategoryDetail categoryId="electronics" />);
    
    await waitFor(() => {
      // Check if the layout is responsive
      const header = screen.getByText('Electronics').closest('.card-header');
      expect(header).toHaveClass('flex-col');
    });
  });
}); 