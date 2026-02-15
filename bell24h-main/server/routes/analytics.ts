import { Router } from 'express';
import {
  getPredictionModels,
  getModelPredictions,
  getTrendAnalyses,
  trainPredictionModel,
  generatePrediction,
  analyzeTrends
} from '../services/predictiveAnalyticsService';
import { storage } from '../storage';
import { getExplanation } from '../services/explainabilityService';
import { getSupplierTier } from '../services/supplierTierService';

const router = Router();

// Helper functions for data export
const jsonToCSV = (data: Record<string, unknown>[]): string => {
  if (!data || !data.length) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Handle strings with commas by wrapping in quotes
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

const jsonToExcel = (data: Record<string, unknown>[]): string => {
  if (!data || !data.length) return '';

  const headers = Object.keys(data[0]);
  let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">';
  html += '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
  html += '<meta name="ProgId" content="Excel.Sheet">';
  html += '<meta name="Generator" content="Microsoft Excel 11">';
  html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 5px; }</style>';
  html += '</head><body>';
  html += '<table>';

  // Header row
  html += '<tr>';
  for (const header of headers) {
    html += `<th>${header}</th>`;
  }
  html += '</tr>';

  // Data rows
  for (const row of data) {
    html += '<tr>';
    for (const header of headers) {
      html += `<td>${row[header]}</td>`;
    }
    html += '</tr>';
  }

  html += '</table></body></html>';
  return html;
};

const jsonToPDF = (data: any[]): string => {
  if (!data || !data.length) return '';

  const headers = Object.keys(data[0]);
  let html = '<!DOCTYPE html><html><head>';
  html += '<meta charset="UTF-8">';
  html += '<title>Analytics Export</title>';
  html += '<style>body { font-family: Arial, sans-serif; }';
  html += 'table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }';
  html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
  html += 'th { background-color: #f2f2f2; font-weight: bold; }';
  html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
  html += '@media print { body { padding: 20px; } }';
  html += '</style></head><body>';

  html += '<h1>Bell24H Analytics Export</h1>';
  html += '<p>Generated on ' + new Date().toLocaleString() + '</p>';

  html += '<table>';

  // Header row
  html += '<tr>';
  for (const header of headers) {
    html += `<th>${header}</th>`;
  }
  html += '</tr>';

  // Data rows
  for (const row of data) {
    html += '<tr>';
    for (const header of headers) {
      html += `<td>${row[header]}</td>`;
    }
    html += '</tr>';
  }

  html += '</table>';
  html += '<script>window.onload = function() { window.print(); }</script>';
  html += '</body></html>';

  return html;
};

// Route for export analytics as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { type = 'all' } = req.query;

    // Get the data based on the type
    let data: any[] = [];

    if (type === 'rfqs' || type === 'all') {
      const rfqs = await storage.getAllRFQs();
      if (type === 'rfqs') {
        data = rfqs;
      } else {
        data = [...data, ...rfqs];
      }
    }

    if (type === 'bids' || type === 'all') {
      const bids = await storage.getAllBids();
      if (type === 'bids') {
        data = bids;
      } else {
        data = [...data, ...bids];
      }
    }

    if (type === 'summary') {
      // Create a summary of data
      const rfqs = await storage.getAllRFQs();
      const bids = await storage.getAllBids();

      const summary = [
        {
          category: 'RFQs',
          count: rfqs.length,
          avgValue: rfqs.length > 0 ? rfqs.reduce((sum, rfq) => sum + (rfq.budget || 0), 0) / rfqs.length : 0,
          status: 'Active'
        },
        {
          category: 'Bids',
          count: bids.length,
          avgValue: bids.length > 0 ? bids.reduce((sum, bid) => sum + (bid.price || 0), 0) / bids.length : 0,
          status: 'Submitted'
        }
      ];

      data = summary;
    }

    // Convert to CSV
    const csv = jsonToCSV(data);

    // Send the CSV as a download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_export.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Export the router
export default router;
