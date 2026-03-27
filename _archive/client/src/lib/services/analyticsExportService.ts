import { jsPDF } from 'jspdf';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'rfq' | 'supplier' | 'transaction' | 'analytics' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  schedule?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  filters: Record<string, any>;
  columns: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string;
  aggregations?: Array<{
    field: string;
    function: 'sum' | 'avg' | 'count' | 'min' | 'max';
    label: string;
  }>;
  charts?: Array<{
    type: 'bar' | 'line' | 'pie' | 'table';
    title: string;
    data: any[];
    options?: any;
  }>;
  recipients?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportData {
  headers: string[];
  rows: any[][];
  summary?: {
    totalRows: number;
    totalAmount?: number;
    currency?: string;
  };
}

export interface ScheduledReport {
  id: string;
  reportConfigId: string;
  nextRun: Date;
  lastRun?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  outputFile?: string;
}

class AnalyticsExportService {
  private reportConfigs: Map<string, ReportConfig> = new Map();
  private scheduledReports: Map<string, ScheduledReport> = new Map();

  constructor() {
    this.initializeDefaultReports();
  }

  // Report Configuration Management
  async createReportConfig(
    config: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ReportConfig> {
    const reportConfig: ReportConfig = {
      ...config,
      id: this.generateReportId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reportConfigs.set(reportConfig.id, reportConfig);

    if (config.schedule) {
      await this.scheduleReport(reportConfig.id);
    }

    return reportConfig;
  }

  async updateReportConfig(id: string, updates: Partial<ReportConfig>): Promise<ReportConfig> {
    const config = this.reportConfigs.get(id);
    if (!config) {
      throw new Error('Report configuration not found');
    }

    const updatedConfig: ReportConfig = {
      ...config,
      ...updates,
      updatedAt: new Date(),
    };

    this.reportConfigs.set(id, updatedConfig);

    // Update schedule if changed
    if (updates.schedule !== undefined) {
      await this.updateScheduledReport(id, updatedConfig);
    }

    return updatedConfig;
  }

  async deleteReportConfig(id: string): Promise<void> {
    this.reportConfigs.delete(id);
    this.scheduledReports.delete(id);
  }

  async getReportConfigs(type?: string): Promise<ReportConfig[]> {
    let configs = Array.from(this.reportConfigs.values());

    if (type) {
      configs = configs.filter(config => config.type === type);
    }

    return configs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Data Export Methods
  async exportToPDF(data: ExportData, config: ReportConfig): Promise<Buffer> {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text(config.name, 20, 20);

    // Add description
    doc.setFontSize(12);
    doc.text(config.description, 20, 35);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 45);

    // Add summary if available
    if (data.summary) {
      doc.setFontSize(14);
      doc.text('Summary', 20, 60);
      doc.setFontSize(10);
      doc.text(`Total Records: ${data.summary.totalRows}`, 20, 70);
      if (data.summary.totalAmount) {
        doc.text(
          `Total Amount: ${data.summary.currency} ${data.summary.totalAmount.toLocaleString()}`,
          20,
          80
        );
      }
    }

    // Add table
    if (data.rows.length > 0) {
      const startY = data.summary ? 100 : 60;
      this.addTableToPDF(doc, data.headers, data.rows, startY);
    }

    // Add charts if available
    if (config.charts) {
      let chartY = doc.internal.pageSize.height - 50;
      config.charts.forEach(chart => {
        this.addChartToPDF(doc, chart, 20, chartY);
        chartY -= 40;
      });
    }

    return Buffer.from(doc.output('arraybuffer'));
  }

  async exportToExcel(data: ExportData, config: ReportConfig): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Create main data worksheet
    const worksheet = workbook.addWorksheet('Data');

    // Add title and metadata
    worksheet.addRow([config.name]);
    worksheet.addRow([config.description]);
    worksheet.addRow([`Generated on: ${format(new Date(), 'PPP')}`]);
    worksheet.addRow([]);

    // Add headers
    const headerRow = worksheet.addRow(data.headers);
    headerRow.font = { bold: true };

    // Add data rows
    data.rows.forEach(row => {
      worksheet.addRow(row);
    });

    // Set column widths
    data.headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      column.width = Math.max(header.length, 15);
    });

    // Add summary if available
    if (data.summary) {
      worksheet.addRow([]);
      const summaryTitleRow = worksheet.addRow(['Summary']);
      summaryTitleRow.font = { bold: true };
      worksheet.addRow([`Total Records: ${data.summary.totalRows}`]);
      if (data.summary.totalAmount) {
        worksheet.addRow([
          `Total Amount: ${data.summary.currency} ${data.summary.totalAmount.toLocaleString()}`,
        ]);
      }
    }

    // Add charts worksheet if available
    if (config.charts) {
      const chartsWorksheet = workbook.addWorksheet('Charts');
      chartsWorksheet.addRow(['Charts']);
      chartsWorksheet.addRow([]);

      config.charts.forEach(chart => {
        chartsWorksheet.addRow([chart.title, JSON.stringify(chart.data)]);
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async exportToCSV(data: ExportData, config: ReportConfig): Promise<string> {
    const csvRows: string[] = [];

    // Add header
    csvRows.push(data.headers.join(','));

    // Add data rows
    data.rows.forEach(row => {
      const escapedRow = row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      });
      csvRows.push(escapedRow.join(','));
    });

    // Add summary if available
    if (data.summary) {
      csvRows.push('');
      csvRows.push('Summary');
      csvRows.push(`Total Records,${data.summary.totalRows}`);
      if (data.summary.totalAmount) {
        csvRows.push(
          `Total Amount,${data.summary.currency} ${data.summary.totalAmount.toLocaleString()}`
        );
      }
    }

    return csvRows.join('\n');
  }

  // Generic export method
  async exportReport(configId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Buffer | string> {
    const config = this.reportConfigs.get(configId);
    if (!config) {
      throw new Error('Report configuration not found');
    }

    const data = await this.fetchReportData(config);

    switch (format) {
      case 'pdf':
        return this.exportToPDF(data, config);
      case 'excel':
        return this.exportToExcel(data, config);
      case 'csv':
        return this.exportToCSV(data, config);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  // Scheduled Reports
  async scheduleReport(configId: string): Promise<ScheduledReport> {
    const config = this.reportConfigs.get(configId);
    if (!config || !config.schedule) {
      throw new Error('Report configuration not found or no schedule specified');
    }

    const nextRun = this.calculateNextRun(config.schedule);

    const scheduledReport: ScheduledReport = {
      id: this.generateScheduledReportId(),
      reportConfigId: configId,
      nextRun,
      status: 'pending',
    };

    this.scheduledReports.set(configId, scheduledReport);
    return scheduledReport;
  }

  async updateScheduledReport(configId: string, config: ReportConfig): Promise<void> {
    if (!config.schedule) {
      this.scheduledReports.delete(configId);
      return;
    }

    const existing = this.scheduledReports.get(configId);
    if (existing) {
      existing.nextRun = this.calculateNextRun(config.schedule);
      existing.status = 'pending';
    } else {
      await this.scheduleReport(configId);
    }
  }

  async runScheduledReports(): Promise<void> {
    const now = new Date();
    const dueReports = Array.from(this.scheduledReports.values()).filter(
      report => report.nextRun <= now && report.status === 'pending'
    );

    for (const report of dueReports) {
      try {
        report.status = 'running';
        report.lastRun = new Date();

        const config = this.reportConfigs.get(report.reportConfigId);
        if (!config) continue;

        const exportData = await this.exportReport(report.reportConfigId, config.format);

        // Save to file system (in production, this would be cloud storage)
        const filename = `${config.name}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.${
          config.format
        }`;
        report.outputFile = filename;
        report.status = 'completed';

        // Send to recipients if specified
        if (config.recipients && config.recipients.length > 0) {
          await this.sendReportToRecipients(config, exportData, filename);
        }

        // Schedule next run
        report.nextRun = this.calculateNextRun(config.schedule!);
        report.status = 'pending';
      } catch (error) {
        report.status = 'failed';
        report.error = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Scheduled report failed: ${report.reportConfigId}`, error);
      }
    }
  }

  // Data Fetching
  private async fetchReportData(config: ReportConfig): Promise<ExportData> {
    // In a real implementation, this would fetch data from the database
    // based on the report configuration

    switch (config.type) {
      case 'rfq':
        return this.fetchRFQData(config);
      case 'supplier':
        return this.fetchSupplierData(config);
      case 'transaction':
        return this.fetchTransactionData(config);
      case 'analytics':
        return this.fetchAnalyticsData(config);
      default:
        return this.fetchCustomData(config);
    }
  }

  private async fetchRFQData(config: ReportConfig): Promise<ExportData> {
    // Mock RFQ data
    const headers = ['ID', 'Title', 'Category', 'Status', 'Created Date', 'Budget', 'Responses'];
    const rows = [
      ['RFQ-001', 'Electronics Components', 'Electronics', 'Open', '2024-01-15', '$50,000', 12],
      [
        'RFQ-002',
        'Manufacturing Equipment',
        'Manufacturing',
        'Closed',
        '2024-01-10',
        '$100,000',
        8,
      ],
      ['RFQ-003', 'Textile Materials', 'Textiles', 'In Review', '2024-01-20', '$25,000', 15],
    ];

    return {
      headers,
      rows,
      summary: {
        totalRows: rows.length,
        totalAmount: 175000,
        currency: 'USD',
      },
    };
  }

  private async fetchSupplierData(config: ReportConfig): Promise<ExportData> {
    const headers = [
      'ID',
      'Company Name',
      'Category',
      'Rating',
      'Verified',
      'Total RFQs',
      'Success Rate',
    ];
    const rows = [
      ['SUP-001', 'TechCorp Industries', 'Electronics', '4.8', 'Yes', 45, '92%'],
      ['SUP-002', 'Global Manufacturing', 'Manufacturing', '4.5', 'Yes', 32, '88%'],
      ['SUP-003', 'Textile Solutions', 'Textiles', '4.2', 'No', 18, '75%'],
    ];

    return {
      headers,
      rows,
      summary: {
        totalRows: rows.length,
      },
    };
  }

  private async fetchTransactionData(config: ReportConfig): Promise<ExportData> {
    const headers = ['ID', 'RFQ ID', 'Supplier', 'Amount', 'Status', 'Date', 'Payment Method'];
    const rows = [
      ['TXN-001', 'RFQ-001', 'TechCorp Industries', '$45,000', 'Completed', '2024-01-25', 'Escrow'],
      [
        'TXN-002',
        'RFQ-002',
        'Global Manufacturing',
        '$95,000',
        'In Progress',
        '2024-01-28',
        'Escrow',
      ],
      ['TXN-003', 'RFQ-003', 'Textile Solutions', '$22,000', 'Pending', '2024-01-30', 'Direct'],
    ];

    return {
      headers,
      rows,
      summary: {
        totalRows: rows.length,
        totalAmount: 162000,
        currency: 'USD',
      },
    };
  }

  private async fetchAnalyticsData(config: ReportConfig): Promise<ExportData> {
    const headers = ['Metric', 'Value', 'Change', 'Period'];
    const rows = [
      ['Total RFQs', '1,250', '+15%', 'This Month'],
      ['Active Suppliers', '450', '+8%', 'This Month'],
      ['Transaction Volume', '$2.5M', '+22%', 'This Month'],
      ['Average Response Time', '2.3 days', '-12%', 'This Month'],
    ];

    return {
      headers,
      rows,
      summary: {
        totalRows: rows.length,
      },
    };
  }

  private async fetchCustomData(config: ReportConfig): Promise<ExportData> {
    // Custom data based on filters and columns
    const headers = config.columns;
    const rows: any[][] = [];

    // Mock data based on configuration
    for (let i = 0; i < 10; i++) {
      const row = headers.map(header => {
        switch (header.toLowerCase()) {
          case 'id':
            return `CUST-${String(i + 1).padStart(3, '0')}`;
          case 'name':
            return `Custom Item ${i + 1}`;
          case 'value':
            return Math.floor(Math.random() * 10000);
          case 'date':
            return format(
              new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              'yyyy-MM-dd'
            );
          default:
            return `Value ${i + 1}`;
        }
      });
      rows.push(row);
    }

    return {
      headers,
      rows,
      summary: {
        totalRows: rows.length,
      },
    };
  }

  // Helper Methods
  private addTableToPDF(doc: jsPDF, headers: string[], rows: any[][], startY: number): void {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const tableWidth = pageWidth - 2 * margin;
    const colWidth = tableWidth / headers.length;
    const rowHeight = 10;

    let currentY = startY;

    // Add headers
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    headers.forEach((header, index) => {
      doc.text(header, margin + index * colWidth + 2, currentY + 7);
    });

    currentY += rowHeight;

    // Add data rows
    rows.forEach((row, rowIndex) => {
      if (currentY + rowHeight > doc.internal.pageSize.height - 20) {
        doc.addPage();
        currentY = 20;
      }

      row.forEach((cell, colIndex) => {
        const cellText = String(cell);
        const maxWidth = colWidth - 4;

        if (doc.getTextWidth(cellText) > maxWidth) {
          // Truncate text if too long
          let truncated = cellText;
          while (doc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
          }
          doc.text(truncated + '...', margin + colIndex * colWidth + 2, currentY + 7);
        } else {
          doc.text(cellText, margin + colIndex * colWidth + 2, currentY + 7);
        }
      });

      currentY += rowHeight;
    });
  }

  private addChartToPDF(doc: jsPDF, chart: any, x: number, y: number): void {
    doc.setFontSize(12);
    doc.text(chart.title, x, y);

    // In a real implementation, this would render actual charts
    // For now, just add a placeholder
    doc.setFontSize(10);
    doc.text('Chart placeholder', x, y + 10);
  }

  private calculateNextRun(schedule: string): Date {
    const now = new Date();

    switch (schedule) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private async sendReportToRecipients(
    config: ReportConfig,
    data: Buffer | string,
    filename: string
  ): Promise<void> {
    // In a real implementation, this would send emails with attachments
    console.log(`Sending report ${filename} to recipients:`, config.recipients);
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScheduledReportId(): string {
    return `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultReports(): void {
    const defaultReports: Omit<ReportConfig, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'RFQ Summary Report',
        description: 'Monthly summary of all RFQs',
        type: 'rfq',
        format: 'pdf',
        schedule: 'monthly',
        filters: {},
        columns: ['ID', 'Title', 'Category', 'Status', 'Created Date', 'Budget'],
        recipients: ['admin@bell24h.com'],
        isActive: true,
      },
      {
        name: 'Supplier Performance Report',
        description: 'Quarterly supplier performance analysis',
        type: 'supplier',
        format: 'excel',
        schedule: 'quarterly',
        filters: {},
        columns: ['Company Name', 'Category', 'Rating', 'Total RFQs', 'Success Rate'],
        recipients: ['admin@bell24h.com'],
        isActive: true,
      },
      {
        name: 'Transaction Report',
        description: 'Daily transaction summary',
        type: 'transaction',
        format: 'csv',
        schedule: 'daily',
        filters: {},
        columns: ['ID', 'RFQ ID', 'Supplier', 'Amount', 'Status', 'Date'],
        recipients: ['finance@bell24h.com'],
        isActive: true,
      },
    ];

    defaultReports.forEach(report => {
      this.createReportConfig(report);
    });
  }
}

export const analyticsExportService = new AnalyticsExportService();
