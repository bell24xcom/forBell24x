import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeaturedContent } from '../FeaturedContent';

const mockFeaturedRfqs = [
  {
    id: 'rfq-001',
    title: 'High-Precision CNC Machining Services',
    category: 'machinery',
    subcategory: 'cnc',
    description: 'Looking for CNC machining services for aerospace components',
    budget: '$50,000 - $100,000',
    deadline: new Date('2024-04-15'),
    isFeatured: true
  },
  {
    id: 'rfq-002',
    title: 'Semiconductor Manufacturing Equipment',
    category: 'electronics',
    subcategory: 'semiconductors',
    description: 'Need semiconductor manufacturing equipment for new facility',
    budget: '$200,000 - $500,000',
    deadline: new Date('2024-04-20'),
    isFeatured: true
  }
];

const mockTrendingCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    growth: 25,
    activeRfqs: 45
  },
  {
    id: 'machinery',
    name: 'Industrial Machinery',
    growth: 20,
    activeRfqs: 75
  }
];

describe('FeaturedContent', () => {
  const mockOnRfqClick = jest.fn();
  const mockOnCategoryClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders featured RFQs tab by default', () => {
    render(
      <FeaturedContent
        featuredRfqs={mockFeaturedRfqs}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    expect(screen.getByText('Featured RFQs')).toBeInTheDocument();
    expect(screen.getByText('High-Precision CNC Machining Services')).toBeInTheDocument();
    expect(screen.getByText('Semiconductor Manufacturing Equipment')).toBeInTheDocument();
  });

  it('switches to trending categories tab when clicked', () => {
    render(
      <FeaturedContent
        featuredRfqs={mockFeaturedRfqs}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const trendingTab = screen.getByRole('tab', { name: /trending categories/i });
    fireEvent.click(trendingTab);

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Industrial Machinery')).toBeInTheDocument();
  });

  it('calls onRfqClick when View Details button is clicked', () => {
    render(
      <FeaturedContent
        featuredRfqs={mockFeaturedRfqs}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const viewDetailsButton = screen.getAllByText('View Details')[0];
    fireEvent.click(viewDetailsButton);

    expect(mockOnRfqClick).toHaveBeenCalledWith('rfq-001');
  });

  it('calls onCategoryClick when Explore button is clicked', () => {
    render(
      <FeaturedContent
        featuredRfqs={mockFeaturedRfqs}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const trendingTab = screen.getByRole('tab', { name: /trending categories/i });
    fireEvent.click(trendingTab);

    const exploreButton = screen.getAllByText('Explore')[0];
    fireEvent.click(exploreButton);

    expect(mockOnCategoryClick).toHaveBeenCalledWith('electronics');
  });

  it('displays RFQ details correctly', () => {
    render(
      <FeaturedContent
        featuredRfqs={mockFeaturedRfqs}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const rfq = mockFeaturedRfqs[0];
    expect(screen.getByText(rfq.title)).toBeInTheDocument();
    expect(screen.getByText(rfq.description)).toBeInTheDocument();
    expect(screen.getByText(rfq.budget)).toBeInTheDocument();
    expect(screen.getByText(`Due ${rfq.deadline.toLocaleDateString()}`)).toBeInTheDocument();
    expect(screen.getByText(rfq.category)).toBeInTheDocument();
    expect(screen.getByText(rfq.subcategory)).toBeInTheDocument();
  });

  it('displays trending category details correctly', () => {
    render(
      <FeaturedContent
        featuredRfqs={mockFeaturedRfqs}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const trendingTab = screen.getByRole('tab', { name: /trending categories/i });
    fireEvent.click(trendingTab);

    const category = mockTrendingCategories[0];
    expect(screen.getByText(category.name)).toBeInTheDocument();
    expect(screen.getByText(`${category.activeRfqs} Active RFQs`)).toBeInTheDocument();
    expect(screen.getByText(`+${category.growth}% growth`)).toBeInTheDocument();
  });

  it('handles empty featured RFQs', () => {
    render(
      <FeaturedContent
        featuredRfqs={[]}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    expect(screen.queryByText('View Details')).not.toBeInTheDocument();
  });

  it('handles empty trending categories', () => {
    render(
      <FeaturedContent
        featuredRfqs={mockFeaturedRfqs}
        trendingCategories={[]}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    const trendingTab = screen.getByRole('tab', { name: /trending categories/i });
    fireEvent.click(trendingTab);

    expect(screen.queryByText('Explore')).not.toBeInTheDocument();
  });

  it('handles long text content', () => {
    const longRfq = {
      ...mockFeaturedRfqs[0],
      title: 'A'.repeat(100),
      description: 'B'.repeat(200)
    };

    render(
      <FeaturedContent
        featuredRfqs={[longRfq]}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    expect(screen.getByText(longRfq.title)).toBeInTheDocument();
    expect(screen.getByText(longRfq.description)).toBeInTheDocument();
  });

  it('handles special characters in content', () => {
    const specialRfq = {
      ...mockFeaturedRfqs[0],
      title: 'Special !@#$%^&*() Characters',
      description: 'Description with !@#$%^&*()'
    };

    render(
      <FeaturedContent
        featuredRfqs={[specialRfq]}
        trendingCategories={mockTrendingCategories}
        onRfqClick={mockOnRfqClick}
        onCategoryClick={mockOnCategoryClick}
      />
    );

    expect(screen.getByText(specialRfq.title)).toBeInTheDocument();
    expect(screen.getByText(specialRfq.description)).toBeInTheDocument();
  });
}); 