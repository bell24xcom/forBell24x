/**
 * Bell24H Analytics Export Test Server
 * 
 * This is a minimal Express server that replicates just the analytics export 
 * functionality for testing purposes.
 */

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Apply middleware
app.use(bodyParser.json({ limit: '50mb' }));

// Mock data for testing
const mockRfqs = [
  { id: 1, title: 'Office Supplies', budget: 5000, status: 'active', created_at: '2025-05-01' },
  { id: 2, title: 'IT Equipment', budget: 25000, status: 'closed', created_at: '2025-04-15' },
  { id: 3, title: 'Consulting Services', budget: 15000, status: 'active', created_at: '2025-05-02' }
];

const mockBids = [
  { id: 1, rfq_id: 1, supplier_id: 101, amount: 4800, status: 'submitted', created_at: '2025-05-02' },
  { id: 2, rfq_id: 1, supplier_id: 102, amount: 4950, status: 'accepted', created_at: '2025-05-03' },
  { id: 3, rfq_id: 2, supplier_id: 103, amount: 24000, status: 'submitted', created_at: '2025-04-20' }
];

// Mock storage implementation
const storage = {
  getAllRFQs: async () => mockRfqs,
  getAllBids: async () => mockBids
};

// Helper functions for data export
const jsonToCSV = (data) => {
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

const jsonToExcel = (data) => {
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

const jsonToPDF = (data) => {
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
app.get('/api/analytics/export/csv', async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    // Get the data based on the type
    let data = [];
    
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
          avgValue: rfqs.reduce((sum, rfq) => sum + (rfq.budget || 0), 0) / rfqs.length,
          status: 'Active'
        },
        {
          category: 'Bids',
          count: bids.length,
          avgValue: bids.reduce((sum, bid) => sum + (bid.amount || 0), 0) / bids.length,
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

// Route for export analytics as Excel
app.get('/api/analytics/export/excel', async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    // Get the data based on the type
    let data = [];
    
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
          avgValue: rfqs.reduce((sum, rfq) => sum + (rfq.budget || 0), 0) / rfqs.length,
          status: 'Active'
        },
        {
          category: 'Bids',
          count: bids.length,
          avgValue: bids.reduce((sum, bid) => sum + (bid.amount || 0), 0) / bids.length,
          status: 'Submitted'
        }
      ];
      
      data = summary;
    }
    
    // Convert to Excel (HTML format)
    const excel = jsonToExcel(data);
    
    // Send the Excel as a download
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_export.xls"`);
    res.send(excel);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Route for export analytics as PDF
app.get('/api/analytics/export/pdf', async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    // Get the data based on the type
    let data = [];
    
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
          avgValue: rfqs.reduce((sum, rfq) => sum + (rfq.budget || 0), 0) / rfqs.length,
          status: 'Active'
        },
        {
          category: 'Bids',
          count: bids.length,
          avgValue: bids.reduce((sum, bid) => sum + (bid.amount || 0), 0) / bids.length,
          status: 'Submitted'
        }
      ];
      
      data = summary;
    }
    
    // Convert to PDF (HTML format with print script)
    const pdf = jsonToPDF(data);
    
    // Send the PDF as HTML that triggers print dialog
    res.setHeader('Content-Type', 'text/html');
    res.send(pdf);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Simple home route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Bell24H Analytics Export Tester</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
          h1 { color: #2563eb; }
          .container { max-width: 800px; margin: 0 auto; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .button-group { display: flex; gap: 10px; margin-top: 10px; }
          .button { 
            display: inline-block; padding: 8px 16px; background: linear-gradient(to right, #2563eb, #4f46e5);
            color: white; text-decoration: none; border-radius: 4px; font-weight: 500;
          }
          .select-group { margin-bottom: 15px; }
          select { padding: 8px; border-radius: 4px; border: 1px solid #d1d5db; }
          label { display: block; margin-bottom: 5px; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Bell24H Analytics Export Tester</h1>
          <p>Use the options below to test the analytics export functionality.</p>
          
          <div class="card">
            <h2>Export RFQs</h2>
            <div class="button-group">
              <a href="/api/analytics/export/csv?type=rfqs" class="button">CSV</a>
              <a href="/api/analytics/export/excel?type=rfqs" class="button">Excel</a>
              <a href="/api/analytics/export/pdf?type=rfqs" class="button">PDF</a>
            </div>
          </div>
          
          <div class="card">
            <h2>Export Bids</h2>
            <div class="button-group">
              <a href="/api/analytics/export/csv?type=bids" class="button">CSV</a>
              <a href="/api/analytics/export/excel?type=bids" class="button">Excel</a>
              <a href="/api/analytics/export/pdf?type=bids" class="button">PDF</a>
            </div>
          </div>
          
          <div class="card">
            <h2>Export Summary</h2>
            <div class="button-group">
              <a href="/api/analytics/export/csv?type=summary" class="button">CSV</a>
              <a href="/api/analytics/export/excel?type=summary" class="button">Excel</a>
              <a href="/api/analytics/export/pdf?type=summary" class="button">PDF</a>
            </div>
          </div>
          
          <div class="card">
            <h2>Export All Data</h2>
            <div class="button-group">
              <a href="/api/analytics/export/csv?type=all" class="button">CSV</a>
              <a href="/api/analytics/export/excel?type=all" class="button">Excel</a>
              <a href="/api/analytics/export/pdf?type=all" class="button">PDF</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Analytics Export Test Server running on http://0.0.0.0:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/analytics/export/csv?type=[rfqs|bids|all|summary]');
  console.log('- GET /api/analytics/export/excel?type=[rfqs|bids|all|summary]');
  console.log('- GET /api/analytics/export/pdf?type=[rfqs|bids|all|summary]');
  console.log('- GET / (Web interface for testing)');
});