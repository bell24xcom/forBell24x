'use client';

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TablePagination from '@mui/material/TablePagination';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Define a basic type for an explanation item (you can expand this later)
export interface ExplanationItem {
  id: string;
  modelType: string;
  timestamp: string;
  summary: string;
}

// Define props for the component
interface ExplanationHistoryProps {
  explanations?: ExplanationItem[];
  isLoading?: boolean;
  error?: { message: string } | null;
  // Optional props for fetching data if managed externally
  onFetchExplanations?: (params: { page: number; limit: number; sortBy: keyof ExplanationItem; sortOrder: 'asc' | 'desc' }) => Promise<{ data: ExplanationItem[]; total: number }>;
}

interface HeadCell {
  id: keyof ExplanationItem | 'actions'; // Include 'actions' or other non-data fields if needed
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'id', numeric: false, label: 'ID' },
  { id: 'modelType', numeric: false, label: 'Model Type' },
  { id: 'timestamp', numeric: false, label: 'Timestamp' },
  { id: 'summary', numeric: false, label: 'Summary' },
];

// Responsive styles for the component
const responsiveStyles = {
  tableCell: {
    padding: '16px',
    '@media (max-width: 600px)': {
      padding: '12px 8px',
      '&:first-of-type': { paddingLeft: '16px' },
      '&:last-child': { paddingRight: '16px' },
    },
  },
  tableRow: {
    '&:hover': { backgroundColor: 'action.hover' },
    '&:focus-within': {
      outline: '2px solid #4a90e2',
      outlineOffset: '-2px',
    },
    '@media (max-width: 600px)': {
      minHeight: '48px',
    },
  },
  sortLabel: {
    minHeight: '48px',
    minWidth: '48px',
    display: 'flex',
    alignItems: 'center',
    margin: '-12px -16px',
    padding: '12px 16px',
  }
};

export const ExplanationHistory: React.FC<ExplanationHistoryProps> = ({
  explanations: initialExplanations = [],
  isLoading: initialLoading = false,
  error: initialError = null,
  onFetchExplanations
}) => {
  const [explanations, setExplanations] = useState<ExplanationItem[]>(initialExplanations);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(initialError ? initialError.message : null);
  
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Pagination state
  const [page, setPage] = useState<number>(0); // 0-indexed
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Sorting state
  const [sortBy, setSortBy] = useState<keyof ExplanationItem>('timestamp'); // Default sort field
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default sort order

  // Effect to load explanations
  useEffect(() => {
    const fetchExplanations = async () => {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sortBy: sortBy as string, // API might expect string
        sortOrder: sortOrder,
      });
      console.log('[TEST_DEBUG] Effect for fetch triggered. Params:', params.toString(), 'Current sortModel:', JSON.stringify({ sortBy, sortOrder })); // DEBUG
      
      setLoading(true);
      setError(null);
      
      try {
        if (onFetchExplanations) {
          const response = await onFetchExplanations({ page, limit: rowsPerPage, sortBy, sortOrder });
          setExplanations(response.data);
          setTotalItems(response.total);
        } else if (initialExplanations.length > 0) {
          // If onFetchExplanations is not provided, but initialExplanations are, use them
          setExplanations(initialExplanations);
          setTotalItems(initialExplanations.length);
        } else {
          // No data source available
          setExplanations([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error("Failed to fetch explanations:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching explanations.');
        setExplanations([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanations();
  }, [initialExplanations, onFetchExplanations, page, rowsPerPage, sortBy, sortOrder]);

  // Pagination handlers
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Sorting handler
  const handleSortRequest = (property: keyof ExplanationItem) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleSortLabelClick = (property: keyof ExplanationItem) => {
    handleSortRequest(property);
  };

  const handleSortLabelKeyDown = (property: keyof ExplanationItem, event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSortRequest(property);
    }
  };

  // Handle keyboard navigation for the table
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    // Add keyboard navigation logic here if needed
    // For example, arrow key navigation between cells
    if (e.key === 'ArrowDown') {
      // Focus next row
    } else if (e.key === 'ArrowUp') {
      // Focus previous row
    } else if (e.key === 'Home') {
      // Focus first row
    } else if (e.key === 'End') {
      // Focus last row
    }
  };

  if (loading && explanations.length === 0) { // Show full page loader only on initial load
    return (
      <Box
        sx={{ 
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px"
        }}
        aria-live="polite"
        aria-busy={loading}
      >
        <CircularProgress 
          size={40} 
          aria-label="Loading explanations"
        />
        <Typography 
          variant="body2" 
          sx={{ ml: 2 }}
        >
          Loading explanations...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ margin: 2 }}
        role="alert"
        aria-live="assertive"
      >
        {error}
      </Alert>
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        padding: 2, 
        margin: 2,
        '&:focus-visible': {
          outline: '2px solid #4a90e2',
          outlineOffset: '2px',
        }
      }}
      data-testid="explanation-history-container"
      tabIndex={-1}
    >
      <Typography 
        variant="h5" 
        gutterBottom 
        component="div"
      >
        Explanation History
      </Typography>
      {explanations.length === 0 && !loading && !error ? (
        <Typography
          variant="body1"
          sx={{
            padding: 2,
            textAlign: 'center',
            color: 'error.main',
          }}
          aria-live="assertive"
        >
          No explanations available.
        </Typography>
      ) : !error ? (
        <TableContainer 
          tabIndex={0}
          onKeyDown={handleTableKeyDown}
          sx={{
            '&:focus-visible': {
              outline: '2px solid #4a90e2',
              outlineOffset: '2px',
            }
          }}
        >
          <Table stickyHeader aria-label="explanation history table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    sortDirection={sortBy === headCell.id ? sortOrder : false}
                  >
                    <TableSortLabel
                      active={sortBy === headCell.id}
                      direction={sortBy === headCell.id ? sortOrder : 'asc'}
                      onClick={() => handleSortLabelClick(headCell.id as keyof ExplanationItem)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => handleSortLabelKeyDown(headCell.id as keyof ExplanationItem, e)}
                      tabIndex={0}
                      sx={responsiveStyles.sortLabel}
                      aria-label={`Sort by ${headCell.label} ${sortBy === headCell.id ? 
                        (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                    >
                      {headCell.label}
                      {sortBy === headCell.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {sortOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {explanations.map((exp) => (
                <TableRow 
                  hover 
                  key={exp.id}
                  tabIndex={0}
                  role="row"
                  sx={{
                    '&:focus-within': {
                      outline: '2px solid #4a90e2',
                      outlineOffset: '-2px',
                    },
                    '&:hover': {
                      cursor: 'pointer',
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    // Handle row click if needed
                    console.log('Row clicked:', exp.id);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLTableRowElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      console.log('Row activated with keyboard:', exp.id);
                    }
                  }}
                >
                  <TableCell>{exp.id}</TableCell>
                  <TableCell>{exp.modelType}</TableCell>
                  <TableCell>{new Date(exp.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{exp.summary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
      
      {!error && explanations.length > 0 && (
        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
          labelRowsPerPage={isMobile ? '' : 'Rows:'}
          labelDisplayedRows={({ from, to, count }) => 
            isMobile ? `${from}-${to} of ${count}` : `Showing ${from}-${to} of ${count}`
          }
          sx={{
            '& .MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              gap: 1,
            },
            '& .MuiTablePagination-actions': {
              margin: 0,
              '& button': {
                padding: '8px',
                minWidth: '48px',
                minHeight: '48px',
              },
            },
          }}
        />
      )}
    </Paper>
  );
};

// Helper for visually hidden class (for accessibility with TableSortLabel)
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  top: 20,
  width: 1,
};

export default ExplanationHistory;
