import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ROICalculator } from '../ROICalculator';

describe('ROICalculator', () => {
  const mockOnCalculate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default values', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    expect(screen.getByText('ROI Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText('Annual Procurement Spend')).toHaveValue(1000000);
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('5 people')).toBeInTheDocument();
  });

  it('updates annual spend when input changes', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const input = screen.getByLabelText('Annual Procurement Spend');
    fireEvent.change(input, { target: { value: '2000000' } });

    expect(input).toHaveValue(2000000);
    expect(screen.getByText('$2,000,000')).toBeInTheDocument();
  });

  it('updates procurement time when slider changes', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const slider = screen.getByLabelText('Average Procurement Time (days)');
    fireEvent.change(slider, { target: { value: '45' } });

    expect(screen.getByText('45 days')).toBeInTheDocument();
  });

  it('updates team size when slider changes', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const slider = screen.getByLabelText('Procurement Team Size');
    fireEvent.change(slider, { target: { value: '10' } });

    expect(screen.getByText('10 people')).toBeInTheDocument();
  });

  it('switches between basic and advanced tabs', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const advancedTab = screen.getByRole('tab', { name: /advanced/i });
    fireEvent.click(advancedTab);

    expect(screen.getByText('Efficiency Gains')).toBeInTheDocument();
    expect(screen.getByText('Cost Reduction')).toBeInTheDocument();
  });

  it('displays calculated results', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    expect(screen.getByText('Annual Savings')).toBeInTheDocument();
    expect(screen.getByText('Time to ROI')).toBeInTheDocument();
    expect(screen.getByText('3-Year ROI')).toBeInTheDocument();
  });

  it('calls onCalculate with results when button is clicked', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const calculateButton = screen.getByText('Calculate ROI');
    fireEvent.click(calculateButton);

    expect(mockOnCalculate).toHaveBeenCalledWith(expect.objectContaining({
      annualSavings: expect.any(Number),
      timeToROI: expect.any(Number),
      threeYearROI: expect.any(Number),
      efficiencyGains: expect.any(Number),
      costReduction: expect.any(Number)
    }));
  });

  it('handles edge cases for annual spend', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const input = screen.getByLabelText('Annual Procurement Spend');
    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue(0);

    fireEvent.change(input, { target: { value: '999999999' } });
    expect(input).toHaveValue(999999999);
  });

  it('handles edge cases for procurement time', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const slider = screen.getByLabelText('Average Procurement Time (days)');
    fireEvent.change(slider, { target: { value: '1' } });
    expect(screen.getByText('1 day')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '90' } });
    expect(screen.getByText('90 days')).toBeInTheDocument();
  });

  it('handles edge cases for team size', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const slider = screen.getByLabelText('Procurement Team Size');
    fireEvent.change(slider, { target: { value: '1' } });
    expect(screen.getByText('1 person')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '20' } });
    expect(screen.getByText('20 people')).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const input = screen.getByLabelText('Annual Procurement Spend');
    fireEvent.change(input, { target: { value: '1234567' } });

    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  it('formats percentage values correctly', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const advancedTab = screen.getByRole('tab', { name: /advanced/i });
    fireEvent.click(advancedTab);

    expect(screen.getByText(/^\d+\.\d+%$/)).toBeInTheDocument();
  });

  it('updates results when inputs change', () => {
    render(<ROICalculator onCalculate={mockOnCalculate} />);

    const input = screen.getByLabelText('Annual Procurement Spend');
    fireEvent.change(input, { target: { value: '2000000' } });

    const calculateButton = screen.getByText('Calculate ROI');
    fireEvent.click(calculateButton);

    expect(mockOnCalculate).toHaveBeenCalledWith(expect.objectContaining({
      annualSavings: expect.any(Number),
      timeToROI: expect.any(Number),
      threeYearROI: expect.any(Number)
    }));
  });
}); 