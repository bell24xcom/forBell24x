import { PDFDocument, StandardFonts } from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import path from 'path';

interface ReportOptions {
  type: 'pdf' | 'excel';
  template: string;
  data: any;
  fileName: string;
}

interface ReportTemplate {
  title: string;
  headers: string[];
  format: (data: any) => any;
}

const templates: { [key: string]: ReportTemplate } = {
  'rfq-summary': {
    title: 'RFQ Summary Report',
    headers: ['RFQ ID', 'Product', 'Quantity', 'Status', 'Created At', 'Supplier Count'],
    format: (data: any) => ({
      rfqId: data.id,
      product: data.product.name,
      quantity: data.quantity,
      status: data.status,
      createdAt: new Date(data.createdAt).toLocaleString(),
      supplierCount: data.suppliers.length
    })
  },
  'supplier-performance': {
    title: 'Supplier Performance Report',
    headers: ['Supplier Name', 'RFQ Response Rate', 'Quote Acceptance Rate', 'Delivery Performance', 'Rating'],
    format: (data: any) => ({
      supplierName: data.name,
      rfqResponseRate: `${Math.round(data.rfqResponseRate * 100)}%`,
      quoteAcceptanceRate: `${Math.round(data.quoteAcceptanceRate * 100)}%`,
      deliveryPerformance: `${data.deliveryPerformance}%`,
      rating: data.rating.toFixed(1)
    })
  },
  'trend-analysis': {
    title: 'Market Trend Analysis Report',
    headers: ['Category', 'Growth Rate', 'Volume', 'Price Trend', 'Seasonality'],
    format: (data: any) => ({
      category: data.category,
      growthRate: `${data.growthRate}%`,
      volume: data.volume.toLocaleString(),
      priceTrend: data.priceTrend,
      seasonality: data.seasonality
    })
  }
};

/**
 * Generate a PDF report
 */
export const generatePDFReport = async (options: ReportOptions): Promise<string> => {
  const { template, data, fileName } = options;
  
  if (!templates[template]) {
    throw new Error(`Template ${template} not found`);
  }
  
  const doc = new PDFDocument({
    margin: 50
  });
  
  // Create write stream
  const filePath = path.join(process.cwd(), 'reports', `${fileName}.pdf`);
  const writeStream = createWriteStream(filePath);
  
  // Pipe to write stream
  doc.pipe(writeStream);
  
  // Add title
  doc.font(StandardFonts.HelveticaBold)
    .fontSize(24)
    .text(templates[template].title, {
      align: 'center',
      underline: true
    });
  
  // Add date
  doc.font(StandardFonts.Helvetica)
    .fontSize(12)
    .moveDown()
    .text(`Generated on: ${new Date().toLocaleString()}`, {
      align: 'right'
    });
  
  // Add table
  doc.moveDown();
  
  // Add headers
  doc.font(StandardFonts.HelveticaBold)
    .fontSize(12)
    .text(templates[template].headers.join(' | '), {
      align: 'center'
    });
  
  // Add data rows
  doc.font(StandardFonts.Helvetica)
    .fontSize(11);
  
  data.forEach((item: any) => {
    const formatted = templates[template].format(item);
    doc.text(Object.values(formatted).join(' | '), {
      align: 'center'
    });
  });
  
  // Finalize PDF
  doc.end();
  
  // Wait for write to complete
  await promisify(writeStream.close).bind(writeStream)();
  
  return filePath;
};

/**
 * Generate an Excel report
 */
export const generateExcelReport = async (options: ReportOptions): Promise<string> => {
  const { template, data, fileName } = options;
  
  if (!templates[template]) {
    throw new Error(`Template ${template} not found`);
  }
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(templates[template].title);
  
  // Add headers
  worksheet.columns = templates[template].headers.map(header => ({
    header,
    key: header.toLowerCase().replace(/\s+/g, '_'),
    width: 20
  }));
  
  // Add data
  worksheet.addRows(data.map(item => templates[template].format(item)));
  
  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
      bgColor: { argb: '4472C4' }
    };
    cell.font = {
      color: { argb: 'FFFFFF' },
      bold: true
    };
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = column.values.reduce(
      (max, value) => Math.max(max, (value?.toString?.().length || 0) + 2),
      10
    );
  });
  
  // Save workbook
  const filePath = path.join(process.cwd(), 'reports', `${fileName}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  
  return filePath;
};

/**
 * Generate report based on type
 */
export const generateReport = async (options: ReportOptions): Promise<string> => {
  switch (options.type) {
    case 'pdf':
      return await generatePDFReport(options);
    case 'excel':
      return await generateExcelReport(options);
    default:
      throw new Error(`Unsupported report type: ${options.type}`);
  }
};
