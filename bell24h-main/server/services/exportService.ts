import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { parse } from 'json2csv';
import { getMetricValues, getMetrics } from './performanceMetricsService.js';
import { getDashboardMetrics } from './dashboardService.js';
import { format } from 'date-fns';

interface ExportConfig {
  id: string;
  userId: number;
  name: string;
  type: ExportFormat;
  metrics: string[];
  period: ExportPeriod;
  format: 'detailed' | 'summary';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ExportSchedule {
  id: string;
  exportConfigId: string;
  nextRun: Date;
  lastRun: Date | null;
  status: 'active' | 'inactive';
  error?: string;
}

// In-memory storage (would be a database in production)
const exportConfigs: ExportConfig[] = [];
const exportSchedules: ExportSchedule[] = [];

const exportFormats = {
  csv: {
    title: 'CSV',
    description: 'Comma-separated values format',
    extension: '.csv'
  },
  excel: {
    title: 'Excel',
    description: 'Microsoft Excel format',
    extension: '.xlsx'
  },
  pdf: {
    title: 'PDF',
    description: 'Portable Document Format',
    extension: '.pdf'
  }
} as const;

const exportPeriods = {
  day: {
    title: 'Daily',
    description: 'Last 24 hours'
  },
  week: {
    title: 'Weekly',
    description: 'Last 7 days'
  },
  month: {
    title: 'Monthly',
    description: 'Last 30 days'
  }
} as const;

export type ExportFormat = keyof typeof exportFormats;
export type ExportPeriod = keyof typeof exportPeriods;

// Export functions
const exportToCSV = async (config: ExportConfig): Promise<Buffer> => {
  const metricsData = await Promise.all(
    config.metrics.map(metricId => getMetricValues(metricId, config.period))
  );

  const dashboardMetrics = await getDashboardMetrics();

  const data = {
    metricsData,
    dashboardMetrics,
    timestamp: new Date()
  };

  const csv = parse(data);
  return Buffer.from(csv);
};

const exportToExcel = async (config: ExportConfig): Promise<Buffer> => {
  const metricsData = await Promise.all(
    config.metrics.map(metricId => getMetricValues(metricId, config.period))
  );

  const dashboardMetrics = await getDashboardMetrics();

  const workbook = XLSX.utils.book_new();

  // Add metrics sheet
  const metricsSheet = XLSX.utils.json_to_sheet(metricsData);
  XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');

  // Add dashboard metrics sheet
  const dashboardSheet = XLSX.utils.json_to_sheet([dashboardMetrics]);
  XLSX.utils.book_append_sheet(workbook, dashboardSheet, 'Dashboard');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

const exportToPDF = async (config: ExportConfig): Promise<Buffer> => {
  // TODO: Implement PDF export using a PDF generation library
  throw new Error('PDF export not implemented yet');
};

const exportFormatsMap = {
  csv: exportToCSV,
  excel: exportToExcel,
  pdf: exportToPDF
} as const;

// Export configuration functions
export const createExportConfig = async (config: Omit<ExportConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExportConfig> => {
  const newConfig: ExportConfig = {
    id: uuidv4(),
    ...config,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  exportConfigs.push(newConfig);
  return newConfig;
};

export const updateExportConfig = async (id: string, updates: Partial<ExportConfig>): Promise<ExportConfig | null> => {
  const index = exportConfigs.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updatedConfig = { ...exportConfigs[index], ...updates, updatedAt: new Date() };
  exportConfigs[index] = updatedConfig;
  return updatedConfig;
};

export const deleteExportConfig = async (id: string): Promise<boolean> => {
  const index = exportConfigs.findIndex(c => c.id === id);
  if (index === -1) return false;

  exportConfigs.splice(index, 1);
  return true;
};

export const getExportConfigById = async (id: string): Promise<ExportConfig | null> => {
  return exportConfigs.find(c => c.id === id) || null;
};

export const getExportConfigs = async (userId: number): Promise<ExportConfig[]> => {
  return exportConfigs.filter(c => c.userId === userId);
};

// Export schedule functions
export const createExportSchedule = async (configId: string, schedule: ExportConfig['schedule']): Promise<ExportSchedule> => {
  if (!schedule) {
    throw new Error('Schedule is required');
  }

  const now = new Date();
  const timeParts = schedule.time.split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  let nextRun = new Date(now);
  nextRun.setHours(hour, minute, 0, 0);

  if (nextRun <= now) {
    switch (schedule.frequency) {
      case 'daily':
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case 'monthly':
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
  }

  const newSchedule: ExportSchedule = {
    id: uuidv4(),
    exportConfigId: configId,
    nextRun,
    lastRun: null,
    status: 'active'
  };

  exportSchedules.push(newSchedule);
  return newSchedule;
};

export const updateExportSchedule = async (id: string, updates: Partial<ExportSchedule>): Promise<ExportSchedule | null> => {
  const index = exportSchedules.findIndex(s => s.id === id);
  if (index === -1) return null;

  const updatedSchedule = { ...exportSchedules[index], ...updates };
  exportSchedules[index] = updatedSchedule;
  return updatedSchedule;
};

export const getExportScheduleById = async (id: string): Promise<ExportSchedule | null> => {
  return exportSchedules.find(s => s.id === id) || null;
};

// Export generation
export const generateExport = async (configId: string): Promise<Buffer> => {
  const config = await getExportConfigById(configId);
  if (!config) throw new Error('Export configuration not found');

  const exporter = exportFormatsMap[config.type];
  if (!exporter) throw new Error('Invalid export format');

  return exporter(config);
};

export const exportTypes = exportFormats;
export const exportPeriods = exportPeriods;
