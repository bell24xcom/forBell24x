import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { RFQ } from '../types/rfq';

interface ExportResultsProps {
  results: RFQ[];
  onExport: (format: string, options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  includeDescription: boolean;
  includeSupplier: boolean;
  includeContact: boolean;
  includeTimeline: boolean;
  includeBudget: boolean;
  includeLocation: boolean;
  includeStatus: boolean;
  includeCertifications: boolean;
  filename: string;
}

const ExportResults: React.FC<ExportResultsProps> = ({ results, onExport }) => {
  const theme = useTheme();
  const [showDialog, setShowDialog] = useState(false);
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<ExportOptions>({
    includeDescription: true,
    includeSupplier: true,
    includeContact: true,
    includeTimeline: true,
    includeBudget: true,
    includeLocation: true,
    includeStatus: true,
    includeCertifications: true,
    filename: `rfq-export-${new Date().toISOString().split('T')[0]}`,
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      await onExport(format, options);
      setShowDialog(false);
    } catch (err) {
      setError('Failed to export results. Please try again.');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange =
    (option: keyof ExportOptions) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setOptions(prev => ({
        ...prev,
        [option]: event.target.checked,
      }));
    };

  const handleFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({
      ...prev,
      filename: event.target.value,
    }));
  };

  return (
    <>
      <Button
        variant='outlined'
        startIcon={<FileDownloadIcon />}
        onClick={() => setShowDialog(true)}
        disabled={results.length === 0}
      >
        Export Results
      </Button>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Export Search Results</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={format}
                label='Export Format'
                onChange={e => setFormat(e.target.value)}
              >
                <MenuItem value='csv'>CSV</MenuItem>
                <MenuItem value='excel'>Excel</MenuItem>
                <MenuItem value='pdf'>PDF</MenuItem>
                <MenuItem value='json'>JSON</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label='Filename'
              value={options.filename}
              onChange={handleFilenameChange}
              sx={{ mb: 2 }}
            />

            <Typography variant='subtitle2' gutterBottom>
              Include Fields
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeDescription}
                    onChange={handleOptionChange('includeDescription')}
                  />
                }
                label='Description'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeSupplier}
                    onChange={handleOptionChange('includeSupplier')}
                  />
                }
                label='Supplier Information'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeContact}
                    onChange={handleOptionChange('includeContact')}
                  />
                }
                label='Contact Details'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeTimeline}
                    onChange={handleOptionChange('includeTimeline')}
                  />
                }
                label='Timeline'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeBudget}
                    onChange={handleOptionChange('includeBudget')}
                  />
                }
                label='Budget'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeLocation}
                    onChange={handleOptionChange('includeLocation')}
                  />
                }
                label='Location'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeStatus}
                    onChange={handleOptionChange('includeStatus')}
                  />
                }
                label='Status'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeCertifications}
                    onChange={handleOptionChange('includeCertifications')}
                  />
                }
                label='Certifications'
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button
            onClick={handleExport}
            variant='contained'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          >
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportResults;
