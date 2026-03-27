import * as ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export interface ExportData {
  [key: string]: any;
}

class ExportService {
  async exportResults(data: ExportData[], format: string, options: ExportOptions): Promise<void> {
    switch (format.toLowerCase()) {
      case 'csv':
        await this.exportToCSV(data, options);
        break;
      case 'excel':
        await this.exportToExcel(data, options);
        break;
      case 'pdf':
        await this.exportToPDF(data, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToCSV(data: ExportData[], options: ExportOptions): Promise<void> {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      options.includeHeaders !== false ? headers.join(',') : '',
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            // Escape commas and quotes
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
          })
          .join(',')
      ),
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${options.filename || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private async exportToExcel(data: ExportData[], options: ExportOptions): Promise<void> {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export Data');

    // Add headers if requested
    if (options.includeHeaders !== false) {
      const headers = Object.keys(data[0]);
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };

      // Set column widths
      headers.forEach((header, index) => {
        const column = worksheet.getColumn(index + 1);
        column.width = Math.max(header.length, 15);
      });
    }

    // Add data rows
    data.forEach(row => {
      const values = Object.values(row);
      worksheet.addRow(values);
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${options.filename || 'export'}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private async exportToPDF(data: ExportData[], options: ExportOptions): Promise<void> {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const doc = new jsPDF();
    const headers = Object.keys(data[0]);

    // Add title
    doc.setFontSize(16);
    doc.text('Export Report', 20, 20);

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Add data table
    let yPosition = 50;
    const pageHeight = doc.internal.pageSize.height;
    const rowHeight = 10;
    const startX = 20;

    // Add headers
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, index) => {
      doc.text(header, startX + index * 40, yPosition);
    });

    yPosition += 10;
    doc.setFont('helvetica', 'normal');

    // Add data rows
    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      headers.forEach((header, colIndex) => {
        const value = String(row[header] || '');
        doc.text(value, startX + colIndex * 40, yPosition);
      });

      yPosition += rowHeight;
    });

    // Save the PDF
    const filename = `${options.filename || 'export'}.pdf`;
    doc.save(filename);
  }

  async exportSearchHistory(history: any[], format: string, options: ExportOptions): Promise<void> {
    const exportData = history.map(item => ({
      query: item.query,
      timestamp: item.timestamp,
      results: item.results,
      success: item.success ? 'Yes' : 'No',
      duration: `${item.duration}s`,
    }));

    await this.exportResults(exportData, format, options);
  }

  async exportAnalytics(analytics: any, format: string, options: ExportOptions): Promise<void> {
    const exportData = [
      { metric: 'Total Searches', value: analytics.totalSearches },
      { metric: 'Successful Searches', value: analytics.successfulSearches },
      { metric: 'Average Results', value: analytics.averageResults },
      { metric: 'Average Duration', value: `${analytics.averageDuration}s` },
    ];

    await this.exportResults(exportData, format, options);
  }
}

export const exportService = new ExportService();
