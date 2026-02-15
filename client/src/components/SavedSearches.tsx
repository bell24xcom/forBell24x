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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchAnalyticsService } from '../services/search/SearchAnalyticsService';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  createdAt: Date;
  lastUsed: Date;
  notificationEnabled: boolean;
}

const SavedSearches: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState<SavedSearch | null>(null);
  const [searchName, setSearchName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = () => {
    const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    setSavedSearches(saved);
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      query: window.location.search,
      filters: JSON.parse(localStorage.getItem('currentFilters') || '{}'),
      createdAt: new Date(),
      lastUsed: new Date(),
      notificationEnabled: false,
    };

    const updatedSearches = [...savedSearches, newSearch];
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    setSavedSearches(updatedSearches);
    setShowSaveDialog(false);
    setSearchName('');
  };

  const handleDeleteSearch = () => {
    if (!selectedSearch) return;

    const updatedSearches = savedSearches.filter(s => s.id !== selectedSearch.id);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    setSavedSearches(updatedSearches);
    setShowDeleteDialog(false);
    setSelectedSearch(null);
  };

  const handleSearchClick = (search: SavedSearch) => {
    // Update last used timestamp
    const updatedSearches = savedSearches.map(s =>
      s.id === search.id ? { ...s, lastUsed: new Date() } : s
    );
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    setSavedSearches(updatedSearches);

    // Navigate to search
    navigate(`/search${search.query}`);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, search: SavedSearch) => {
    setAnchorEl(event.currentTarget);
    setSelectedSearch(search);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>, search: SavedSearch) => {
    setNotificationAnchorEl(event.currentTarget);
    setSelectedSearch(search);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const toggleNotification = () => {
    if (!selectedSearch) return;

    const updatedSearches = savedSearches.map(s =>
      s.id === selectedSearch.id ? { ...s, notificationEnabled: !s.notificationEnabled } : s
    );
    localStorage.setItem('savedSearches', JSON.stringify(updatedSearches));
    setSavedSearches(updatedSearches);
    handleNotificationClose();
  };

  const handleShareSearch = () => {
    if (!selectedSearch) return;
    // Implement sharing functionality
    handleMenuClose();
  };

  const handleEditSearch = () => {
    if (!selectedSearch) return;
    setSearchName(selectedSearch.name);
    setShowSaveDialog(true);
    handleMenuClose();
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='h6'>Saved Searches</Typography>
        <Button
          variant='contained'
          startIcon={<SaveIcon />}
          onClick={() => setShowSaveDialog(true)}
        >
          Save Current Search
        </Button>
      </Box>

      <List>
        {savedSearches.length === 0 ? (
          <ListItem>
            <ListItemText
              primary='No saved searches'
              secondary='Save your searches to quickly access them later'
            />
          </ListItem>
        ) : (
          savedSearches.map(search => (
            <ListItem
              key={search.id}
              sx={{
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemText
                primary={search.name}
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Last used: {new Date(search.lastUsed).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {search.notificationEnabled && (
                        <Chip
                          size='small'
                          icon={<NotificationsIcon />}
                          label='Notifications Enabled'
                          color='primary'
                        />
                      )}
                    </Box>
                  </Box>
                }
                onClick={() => handleSearchClick(search)}
                sx={{ cursor: 'pointer' }}
              />
              <ListItemSecondaryAction>
                <Tooltip title='Notification Settings'>
                  <IconButton edge='end' onClick={e => handleNotificationClick(e, search)}>
                    <NotificationsIcon />
                  </IconButton>
                </Tooltip>
                <IconButton edge='end' onClick={e => handleMenuClick(e, search)}>
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Search Name'
            fullWidth
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSearch} variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Saved Search</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this saved search? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteSearch} color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditSearch}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleShareSearch}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowDeleteDialog(true);
            handleMenuClose();
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Notification Settings Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
      >
        <MenuItem onClick={toggleNotification}>
          {selectedSearch?.notificationEnabled ? 'Disable' : 'Enable'} Notifications
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default SavedSearches;
