import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SolutionComparison } from '../SolutionComparison';

const mockFeatures = [
  {
    id: 'feature-1',
    name: 'RFQ Management',
    description: 'Create and manage RFQs efficiently',
    category: 'core',
    importance: 'high' as const
  },
  {
    id: 'feature-2',
    name: 'Supplier Portal',
    description: 'Dedicated portal for suppliers',
    category: 'core',
    importance: 'high' as const
  },
  {
    id: 'feature-3',
    name: 'Analytics Dashboard',
    description: 'Advanced analytics and reporting',
    category: 'advanced',
    importance: 'medium' as const
  },
  {
    id: 'feature-4',
    name: 'API Integration',
    description: 'Connect with other systems',
    category: 'advanced',
    importance: 'medium' as const
  }
];

const mockSolutions = [
  {
    id: 'solution-1',
    name: 'Bell24H Pro',
    description: 'Complete procurement solution',
    logo: '/logos/bell24h-pro.png',
    features: ['feature-1', 'feature-2', 'feature-3', 'feature-4'],
    pricing: {
      monthly: 999,
      annual: 9990
    },
    rating: 4.5,
    reviews: 150
  },
  {
    id: 'solution-2',
    name: 'Bell24H Basic',
    description: 'Essential procurement features',
    logo: '/logos/bell24h-basic.png',
    features: ['feature-1', 'feature-2'],
    pricing: {
      monthly: 499,
      annual: 4990
    },
    rating: 4.0,
    reviews: 75
  }
];

describe('SolutionComparison', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders solution cards with correct information', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    mockSolutions.forEach((solution) => {
      expect(screen.getByText(solution.name)).toBeInTheDocument();
      expect(screen.getByText(solution.description)).toBeInTheDocument();
      expect(screen.getByText(`$${solution.pricing.monthly}`)).toBeInTheDocument();
      expect(screen.getByText(`${solution.reviews} reviews`)).toBeInTheDocument();
    });
  });

  it('renders feature comparison table', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Feature Comparison')).toBeInTheDocument();
    mockFeatures.forEach((feature) => {
      expect(screen.getByText(feature.name)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });
  });

  it('expands and collapses feature categories', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    const advancedCategory = screen.getByText('advanced');
    fireEvent.click(advancedCategory);

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('API Integration')).toBeInTheDocument();

    fireEvent.click(advancedCategory);
    expect(screen.queryByText('Analytics Dashboard')).not.toBeVisible();
    expect(screen.queryByText('API Integration')).not.toBeVisible();
  });

  it('calls onSelect when a solution is selected', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    const selectButton = screen.getByText('Select Bell24H Pro');
    fireEvent.click(selectButton);

    expect(mockOnSelect).toHaveBeenCalledWith('solution-1');
  });

  it('displays feature availability correctly', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    const advancedCategory = screen.getByText('advanced');
    fireEvent.click(advancedCategory);

    // Check for available features
    const availableFeatures = screen.getAllByTestId('check-icon');
    expect(availableFeatures).toHaveLength(2); // Only in Pro solution

    // Check for unavailable features
    const unavailableFeatures = screen.getAllByTestId('x-icon');
    expect(unavailableFeatures).toHaveLength(2); // In Basic solution
  });

  it('formats prices correctly', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('$999')).toBeInTheDocument();
    expect(screen.getByText('$499')).toBeInTheDocument();
    expect(screen.getByText('$9,990')).toBeInTheDocument();
    expect(screen.getByText('$4,990')).toBeInTheDocument();
  });

  it('displays feature importance badges with correct colors', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    const highImportanceBadge = screen.getByText('high');
    expect(highImportanceBadge).toHaveClass('text-red-500');

    const mediumImportanceBadge = screen.getByText('medium');
    expect(mediumImportanceBadge).toHaveClass('text-yellow-500');
  });

  it('handles empty solutions array', () => {
    render(
      <SolutionComparison
        solutions={[]}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByText('Select')).not.toBeInTheDocument();
  });

  it('handles empty features array', () => {
    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={[]}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.queryByText('Feature Comparison')).toBeInTheDocument();
    expect(screen.queryByText('No features available')).toBeInTheDocument();
  });

  it('handles long solution names and descriptions', () => {
    const longSolution = {
      ...mockSolutions[0],
      name: 'A'.repeat(100),
      description: 'B'.repeat(200)
    };

    render(
      <SolutionComparison
        solutions={[longSolution]}
        features={mockFeatures}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(longSolution.name)).toBeInTheDocument();
    expect(screen.getByText(longSolution.description)).toBeInTheDocument();
  });

  it('handles special characters in feature names and descriptions', () => {
    const specialFeature = {
      ...mockFeatures[0],
      name: 'Special !@#$%^&*() Feature',
      description: 'Description with !@#$%^&*()'
    };

    render(
      <SolutionComparison
        solutions={mockSolutions}
        features={[specialFeature]}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText(specialFeature.name)).toBeInTheDocument();
    expect(screen.getByText(specialFeature.description)).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      const headings = screen.getAllByRole('heading');
      expect(headings[0]).toHaveAttribute('aria-level', '1');
      expect(headings[1]).toHaveAttribute('aria-level', '2');
    });

    it('provides proper ARIA labels for interactive elements', () => {
      render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      const expandButtons = screen.getAllByRole('button', { name: /expand/i });
      expandButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-expanded');
      });

      const selectButtons = screen.getAllByRole('button', { name: /select/i });
      selectButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('supports keyboard navigation', async () => {
      render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      const user = userEvent.setup();
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-expanded');
    });
  });

  describe('Performance', () => {
    it('handles large feature sets efficiently', () => {
      const largeFeatureSet = Array.from({ length: 100 }, (_, i) => ({
        id: `feature-${i}`,
        name: `Feature ${i}`,
        description: `Description for feature ${i}`,
        category: i % 2 === 0 ? 'core' : 'advanced',
        importance: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low'
      }));

      const startTime = performance.now();
      render(
        <SolutionComparison
          solutions={mockSolutions}
          features={largeFeatureSet}
          onSelect={mockOnSelect}
        />
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
    });

    it('optimizes re-renders when filtering', () => {
      const { rerender } = render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      const renderCount = jest.fn();
      const originalRender = React.useEffect;
      React.useEffect = (...args) => {
        renderCount();
        return originalRender(...args);
      };

      rerender(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      expect(renderCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles solutions with missing features', () => {
      const incompleteSolution = {
        ...mockSolutions[0],
        features: ['non-existent-feature']
      };

      render(
        <SolutionComparison
          solutions={[incompleteSolution]}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Feature not found')).toBeInTheDocument();
    });

    it('handles solutions with duplicate features', () => {
      const duplicateSolution = {
        ...mockSolutions[0],
        features: ['feature-1', 'feature-1']
      };

      render(
        <SolutionComparison
          solutions={[duplicateSolution]}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      const featureCells = screen.getAllByText('RFQ Management');
      expect(featureCells).toHaveLength(1); // Should deduplicate
    });

    it('handles solutions with invalid pricing', () => {
      const invalidPricingSolution = {
        ...mockSolutions[0],
        pricing: {
          monthly: -100,
          annual: null
        }
      };

      render(
        <SolutionComparison
          solutions={[invalidPricingSolution]}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Invalid price')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('formats prices according to locale', () => {
      const { rerender } = render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
        />
      );

      // Test with different locales
      const locales = ['en-US', 'de-DE', 'fr-FR'];
      locales.forEach(locale => {
        rerender(
          <SolutionComparison
            solutions={mockSolutions}
            features={mockFeatures}
            onSelect={mockOnSelect}
            locale={locale}
          />
        );

        const price = screen.getByText(/\$999/);
        expect(price).toHaveTextContent(
          new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'USD'
          }).format(999)
        );
      });
    });

    it('handles RTL languages', () => {
      render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
          direction="rtl"
        />
      );

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const mockError = new Error('Network error');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
          onError={jest.fn()}
        />
      );

      // Simulate network error
      await Promise.reject(mockError);

      expect(screen.getByText('Failed to load comparison data')).toBeInTheDocument();
    });

    it('provides retry mechanism for failed loads', async () => {
      const mockOnError = jest.fn();
      render(
        <SolutionComparison
          solutions={mockSolutions}
          features={mockFeatures}
          onSelect={mockOnSelect}
          onError={mockOnError}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      expect(mockOnError).toHaveBeenCalledWith('retry');
    });
  });
}); 