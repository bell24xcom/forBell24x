import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from '../SearchBar';
import { rfqService } from '../../../services/rfq/RFQService';

// Mock the rfqService
jest.mock('../../../services/rfq/RFQService');

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SearchBar', () => {
  const mockRFQs = [
    {
      id: '1',
      title: 'Test RFQ 1',
      description: 'Test description 1',
      category: 'test-category',
      subcategory: 'test-subcategory',
    },
  ];

  beforeEach(() => {
    (rfqService.getMockupRFQs as jest.Mock).mockResolvedValue(mockRFQs);
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders search input', () => {
    renderWithRouter(<SearchBar />);
    expect(screen.getByPlaceholderText(/search categories/i)).toBeInTheDocument();
  });

  it('shows loading indicator while searching', async () => {
    renderWithRouter(<SearchBar />);

    const input = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(input, { target: { value: 'test' } });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays search results', async () => {
    renderWithRouter(<SearchBar />);

    const input = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Test RFQ 1')).toBeInTheDocument();
    });
  });

  it('clears input when clear button is clicked', () => {
    renderWithRouter(<SearchBar />);

    const input = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('navigates to correct route when result is selected', async () => {
    renderWithRouter(<SearchBar />);

    const input = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Test RFQ 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test RFQ 1'));
    expect(mockNavigate).toHaveBeenCalledWith('/rfq/1');
  });

  it('does not search with less than 2 characters', async () => {
    renderWithRouter(<SearchBar />);

    const input = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(input, { target: { value: 't' } });

    await waitFor(() => {
      expect(screen.queryByText('Test RFQ 1')).not.toBeInTheDocument();
    });
  });

  it('displays no results message when no matches found', async () => {
    renderWithRouter(<SearchBar />);

    const input = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });
});
