import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { rfqs, bids, productShowcases } from '../../shared/schema';
import { eq, sql } from 'drizzle-orm';
import { createObjectCsvWriter } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Custom types for Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        [key: string]: any;
      };
    }
  }
}

// Export formats
type ExportFormat = 'csv' | 'excel' | 'pdf';
type ExportType = 'rfqs' | 'bids' | 'all' | 'summary';

// Initialize route handlers
export function initAnalyticsExportRoutes(app: any) {
  app.get('/api/analytics/export/:format', authenticateUser, handleExport);
}

// Authentication middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
  return;
}

// Main export handler
async function handleExport(req: Request, res: Response) {
  try {
    const format = req.params.format as ExportFormat;
    const type = req.query.type as ExportType || 'all';
    
    // Make sure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = req.user.id;

    // Validate format
    if (!['csv', 'excel', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Invalid export format' });
    }

    // Validate type
    if (!['rfqs', 'bids', 'all', 'summary'].includes(type)) {
      return res.status(400).json({ error: 'Invalid export type' });
    }

    // Get data based on type
    const data = await getData(type, userId);

    // Export based on format
    switch (format) {
      case 'csv':
        return exportToCsv(data, type, res);
      case 'excel':
        return exportToExcel(data, type, res);
      case 'pdf':
        return exportToPdf(data, type, res);
      default:
        return res.status(400).json({ error: 'Invalid export format' });
    }
  } catch (error: any) {
    console.error('Export error:', error);
    return res.status(500).json({ error: 'Export failed', details: error.message });
  }
}

// Data fetching function
async function getData(type: ExportType, userId: number) {
  try {
    let rfqData: any[] = [];
    let bidData: any[] = [];
    let showcaseData: any[] = [];
    
    if (type === 'rfqs' || type === 'all') {
      const rfqQuery = db.select().from(rfqs).where(eq(rfqs.user_id, userId));
      rfqData = await rfqQuery;
    }
    
    if (type === 'bids' || type === 'all') {
      const bidQuery = db.select().from(bids).where(eq(bids.user_id, userId));
      bidData = await bidQuery;
    }
    
    if (type === 'all') {
      showcaseData = await db.select().from(productShowcases).where(eq(productShowcases.user_id, userId));
    }
    
    if (type === 'summary') {
      // Get counts and statistics
      const rfqCount = await db.select({ count: sql<number>`count(*)` }).from(rfqs).where(eq(rfqs.user_id, userId));
      const bidCount = await db.select({ count: sql<number>`count(*)` }).from(bids).where(eq(bids.user_id, userId));
      const showcaseCount = await db.select({ count: sql<number>`count(*)` }).from(productShowcases).where(eq(productShowcases.user_id, userId));
      
      return {
        summary: {
          totalRfqs: rfqCount[0]?.count || 0,
          totalBids: bidCount[0]?.count || 0,
          totalShowcases: showcaseCount[0]?.count || 0,
          lastExportDate: new Date().toISOString(),
          userId
        }
      };
    }
    
    return {
      rfqs: rfqData,
      bids: bidData,
      productShowcases: showcaseData
    };
  } catch (error: any) {
    console.error('Data fetch error:', error);
    throw new Error(`Failed to fetch analytics data: ${error.message || 'Unknown error'}`);
  }
}

// CSV Export function
async function exportToCsv(data: { rfqs?: any[]; bids?: any[]; productShowcases?: any[]; summary?: any }, type: ExportType, res: Response) {
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const filePath = path.join(tempDir, `${type}_export_${timestamp}.csv`);
  
  let headers = [];
  let records = [];
  
  if (type === 'rfqs') {
    headers = [
      { id: 'id', title: 'ID' },
      { id: 'title', title: 'Title' },
      { id: 'status', title: 'Status' },
      { id: 'created_at', title: 'Created At' }
    ];
    records = data.rfqs ?? [];
  } else if (type === 'bids') {
    headers = [
      { id: 'id', title: 'ID' },
      { id: 'rfq_id', title: 'RFQ ID' },
      { id: 'user_id', title: 'User ID' },
      { id: 'amount', title: 'Amount' },
      { id: 'currency', title: 'Currency' },
      { id: 'status', title: 'Status' },
      { id: 'created_at', title: 'Created At' }
    ];
    records = data.bids ?? [];
  } else if (type === 'summary') {
    headers = [
      { id: 'metric', title: 'Metric' },
      { id: 'value', title: 'Value' }
    ];
    records = [
      { metric: 'Total RFQs', value: data.summary.totalRfqs },
      { metric: 'Total Bids', value: data.summary.totalBids },
      { metric: 'Total Product Showcases', value: data.summary.totalShowcases },
      { metric: 'Export Date', value: new Date(data.summary.lastExportDate).toLocaleString() },
      { metric: 'User ID', value: data.summary.userId }
    ];
  } else {
    // For 'all', combine all data with a type indicator
    headers = [
      { id: 'type', title: 'Type' },
      { id: 'id', title: 'ID' },
      { id: 'title', title: 'Title/Description' },
      { id: 'status', title: 'Status' },
      { id: 'created_at', title: 'Created At' }
    ];
    
    records = [
      ...(data.rfqs ?? []).map(rfq => ({
        type: 'RFQ',
        id: rfq.id,
        title: rfq.title,
        status: rfq.status,
        created_at: rfq.created_at
      })),
      ...(data.bids ?? []).map(bid => ({
        type: 'Bid',
        id: bid.id,
        rfq_id: bid.rfq_id,
        user_id: bid.user_id,
        amount: bid.amount,
        currency: bid.currency,
        status: bid.status,
        created_at: bid.created_at
      })),
      ...(data.productShowcases ?? []).map(showcase => ({
        type: 'Product Showcase',
        id: showcase.id,
        title: showcase.product_name,
        description: showcase.description,
        status: showcase.status,
        created_at: showcase.created_at
      }))
    ];
  }
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers
  });
  
  await csvWriter.writeRecords(records);
  
  res.download(filePath, `${type}_export.csv`, (err) => {
    if (err) {
      console.error('Download error:', err);
    }
    
    // Clean up temp file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Failed to delete temp CSV file:', unlinkErr);
      }
    });
  });
}

// Excel Export function
async function exportToExcel(data: { rfqs?: any[]; bids?: any[]; productShowcases?: any[]; summary?: any }, type: ExportType, res: Response) {
  const workbook = new ExcelJS.Workbook();
  let worksheet;
  
  if (type === 'all') {
    // Create separate worksheets for each data type
    const rfqSheet = workbook.addWorksheet('RFQs');
    rfqSheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Title', key: 'title' },
      { header: 'Description', key: 'description' },
      { header: 'Status', key: 'status' },
      { header: 'Video URL', key: 'video_url' },
      { header: 'Created At', key: 'created_at' }
    ];
    rfqSheet.addRows(data.rfqs);
    
    const bidSheet = workbook.addWorksheet('Bids');
    bidSheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'RFQ ID', key: 'rfq_id' },
      { header: 'Amount', key: 'amount' },
      { header: 'Description', key: 'description' },
      { header: 'Status', key: 'status' },
      { header: 'Created At', key: 'created_at' }
    ];
    bidSheet.addRows(data.bids);
    
    const showcaseSheet = workbook.addWorksheet('Product Showcases');
    showcaseSheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Product Name', key: 'product_name' },
      { header: 'Description', key: 'description' },
      { header: 'Video URL', key: 'video_url' },
      { header: 'Created At', key: 'created_at' }
    ];
    showcaseSheet.addRows(data.productShowcases);
  } else if (type === 'rfqs') {
    worksheet = workbook.addWorksheet('RFQs');
    worksheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'Title', key: 'title' },
      { header: 'Description', key: 'description' },
      { header: 'Status', key: 'status' },
      { header: 'Video URL', key: 'video_url' },
      { header: 'Created At', key: 'created_at' }
    ];
    worksheet.addRows(data.rfqs);
  } else if (type === 'bids') {
    worksheet = workbook.addWorksheet('Bids');
    worksheet.columns = [
      { header: 'ID', key: 'id' },
      { header: 'RFQ ID', key: 'rfq_id' },
      { header: 'Amount', key: 'amount' },
      { header: 'Description', key: 'description' },
      { header: 'Status', key: 'status' },
      { header: 'Created At', key: 'created_at' }
    ];
    worksheet.addRows(data.bids);
  } else if (type === 'summary') {
    worksheet = workbook.addWorksheet('Summary');
    worksheet.columns = [
      { header: 'Metric', key: 'metric' },
      { header: 'Value', key: 'value' }
    ];
    worksheet.addRows([
      { metric: 'Total RFQs', value: data.summary.totalRfqs },
      { metric: 'Total Bids', value: data.summary.totalBids },
      { metric: 'Total Product Showcases', value: data.summary.totalShowcases },
      { metric: 'Export Date', value: new Date(data.summary.lastExportDate).toLocaleString() },
      { metric: 'User ID', value: data.summary.userId }
    ]);
  }
  
  // Format each worksheet for better appearance
  workbook.eachSheet(sheet => {
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });
  });
  
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const filePath = path.join(tempDir, `${type}_export_${timestamp}.xlsx`);
  
  await workbook.xlsx.writeFile(filePath);
  
  res.download(filePath, `${type}_export.xlsx`, (err) => {
    if (err) {
      console.error('Download error:', err);
    }
    
    // Clean up temp file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Failed to delete temp Excel file:', unlinkErr);
      }
    });
  });
}

// PDF Export function
async function exportToPdf(data: { rfqs?: any[]; bids?: any[]; productShowcases?: any[]; summary?: any }, type: ExportType, res: Response) {
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const filePath = path.join(tempDir, `${type}_export_${timestamp}.pdf`);
  
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  
  doc.pipe(stream);
  
  // Add title
  doc.fontSize(20).text(`Bell24H Analytics Export: ${type.toUpperCase()}`, { align: 'center' });
  doc.moveDown(2);
  
  if (type === 'summary') {
    // Summary report design
    doc.fontSize(14).text('Summary Report', { underline: true });
    doc.moveDown();
    
    const summaryItems = [
      { label: 'Total RFQs', value: data.summary.totalRfqs },
      { label: 'Total Bids', value: data.summary.totalBids },
      { label: 'Total Product Showcases', value: data.summary.totalShowcases },
      { label: 'Export Date', value: new Date(data.summary.lastExportDate).toLocaleString() }
    ];
    
    summaryItems.forEach(item => {
      doc.fontSize(12).text(`${item.label}: ${item.value}`);
      doc.moveDown(0.5);
    });
    
    // Add a simple pie chart representation using text
    doc.moveDown(2);
    doc.fontSize(14).text('Distribution', { underline: true });
    doc.moveDown();
    
    const total = data.summary.totalRfqs + data.summary.totalBids + data.summary.totalShowcases;
    if (total > 0) {
      const rfqPercentage = Math.round((data.summary.totalRfqs / total) * 100);
      const bidPercentage = Math.round((data.summary.totalBids / total) * 100);
      const showcasePercentage = Math.round((data.summary.totalShowcases / total) * 100);
      
      doc.fontSize(12).text(`RFQs: ${rfqPercentage}%`);
      doc.fontSize(12).text(`Bids: ${bidPercentage}%`);
      doc.fontSize(12).text(`Product Showcases: ${showcasePercentage}%`);
    } else {
      doc.fontSize(12).text('No data available for distribution');
    }
  } else {
    // Table headers
    let headers = [];
    let tableData = [];
    
    if (type === 'rfqs') {
      headers = ['ID', 'Title', 'Status', 'Created At'];
      tableData = data.rfqs.map(rfq => [
        rfq.id.substring(0, 8) + '...', // Truncate long IDs
        rfq.title.substring(0, 30) + (rfq.title.length > 30 ? '...' : ''),
        rfq.status,
        new Date(rfq.created_at).toLocaleString()
      ]);
    } else if (type === 'bids') {
      headers = ['ID', 'RFQ ID', 'Amount', 'Status', 'Created At'];
      tableData = data.bids.map(bid => [
        bid.id.substring(0, 8) + '...',
        bid.rfq_id.substring(0, 8) + '...',
        bid.amount?.toString() || 'N/A',
        bid.status,
        new Date(bid.created_at).toLocaleString()
      ]);
    } else {
      // For 'all', focus on key details
      headers = ['Type', 'ID', 'Title/Name', 'Created At'];
      
      tableData = [
        ...data.rfqs.map(rfq => [
          'RFQ',
          rfq.id.substring(0, 8) + '...',
          rfq.title.substring(0, 30) + (rfq.title.length > 30 ? '...' : ''),
          new Date(rfq.created_at).toLocaleString()
        ]),
        ...data.bids.map(bid => [
          'Bid',
          bid.id.substring(0, 8) + '...',
          bid.description?.substring(0, 30) + (bid.description?.length > 30 ? '...' : '') || 'N/A',
          new Date(bid.created_at).toLocaleString()
        ]),
        ...(data.productShowcases ?? []).map(showcase => [
          'Showcase',
          showcase.id.substring(0, 8) + '...',
          showcase.product_name.substring(0, 30) + (showcase.product_name.length > 30 ? '...' : ''),
          new Date(showcase.created_at).toLocaleString()
        ])
      ];
    }
    
    // Draw table header
    const pageWidth = doc.page.width - 100;
    const colWidth = pageWidth / headers.length;
    
    let startX = 50;
    let startY = doc.y;
    
    // Table header
    headers.forEach((header, i) => {
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .text(header, startX + (i * colWidth), startY, { width: colWidth, align: 'left' });
    });
    
    // Draw horizontal line
    startY += 20;
    doc.moveTo(50, startY).lineTo(doc.page.width - 50, startY).stroke();
    
    // Table data
    startY += 10;
    let rowCount = 0;
    
    // Limit to max 50 rows for PDF readability
    const maxRows = Math.min(tableData.length, 50);
    
    for (let i = 0; i < maxRows; i++) {
      const row = tableData[i];
      
      // Check if we need a new page
      if (startY > doc.page.height - 100) {
        doc.addPage();
        startY = 50;
        
        // Redraw headers on new page
        headers.forEach((header, j) => {
          doc.font('Helvetica-Bold')
             .fontSize(10)
             .text(header, startX + (j * colWidth), startY, { width: colWidth, align: 'left' });
        });
        
        startY += 20;
        doc.moveTo(50, startY).lineTo(doc.page.width - 50, startY).stroke();
        startY += 10;
      }
      
      row.forEach((cell, j) => {
        doc.font('Helvetica')
           .fontSize(10)
           .text(cell?.toString() || 'N/A', startX + (j * colWidth), startY, { width: colWidth, align: 'left' });
      });
      
      rowCount++;
      startY += 20;
      
      // Add light grey line between rows
      if (i < maxRows - 1) {
        doc.strokeColor('#EEEEEE')
           .moveTo(50, startY - 10)
           .lineTo(doc.page.width - 50, startY - 10)
           .stroke()
           .strokeColor('#000000');
      }
    }
    
    // If there are more rows than we displayed
    if (tableData.length > maxRows) {
      doc.moveDown();
      doc.font('Helvetica-Italic')
         .fontSize(10)
         .text(`And ${tableData.length - maxRows} more records...`, { align: 'center' });
    }
  }
  
  // Add footer with timestamp
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Footer with page number and timestamp
    doc.fontSize(8)
       .text(
         `Generated on ${new Date().toLocaleString()} | Page ${i + 1} of ${pageCount}`,
         50,
         doc.page.height - 50,
         { align: 'center', width: doc.page.width - 100 }
       );
  }
  
  // Finalize PDF
  doc.end();
  
  // Wait for the PDF to finish writing
  stream.on('finish', () => {
    res.download(filePath, `${type}_export.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      
      // Clean up temp file
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Failed to delete temp PDF file:', unlinkErr);
        }
      });
    });
  });
  
  stream.on('error', (err) => {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF generation failed', details: err.message });
  });
}
