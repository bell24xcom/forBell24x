import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchAnalyticsService } from '../services/search/SearchAnalyticsService';

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
  selectedResult?: {
    id: string;
    type: string;
    title: string;
  };
}

const SearchHistory: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const savedHistory = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
    setHistory(savedHistory);
  };

  const handleSearchClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleDeleteClick = (index: number) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    localStorage.setItem('searchAnalytics', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const handleClearHistory = () => {
    localStorage.setItem('searchAnalytics', '[]');
    setHistory([]);
    setShowClearDialog(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          Search History
        </Typography>
        <Button
          variant='outlined'
          color='error'
          size='small'
          onClick={() => setShowClearDialog(true)}
        >
          Clear History
        </Button>
      </Box>

      <List>
        {history.length === 0 ? (
          <ListItem>
            <ListItemText
              primary='No search history'
              secondary='Your search history will appear here'
            />
          </ListItem>
        ) : (
          history.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SearchIcon fontSize='small' color='action' />
                      <Typography
                        variant='body1'
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSearchClick(item.query)}
                      >
                        {item.query}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {formatDate(item.timestamp)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          size='small'
                          label={`${item.resultCount} results`}
                          color='primary'
                          variant='outlined'
                        />
                        {item.selectedResult && (
                          <Chip
                            size='small'
                            label={`Selected: ${item.selectedResult.title}`}
                            color='success'
                            variant='outlined'
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge='end'
                    aria-label='delete'
                    onClick={() => handleDeleteClick(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < history.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>

      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)}>
        <DialogTitle>Clear Search History</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to clear your search history? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>Cancel</Button>
          <Button onClick={handleClearHistory} color='error'>
            Clear History
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SearchHistory;
