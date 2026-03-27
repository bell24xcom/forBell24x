import { schedule as scheduleCron } from 'node-cron';
import { generateReport } from './reportGeneratorService.js';
import nodemailer from 'nodemailer';
import path from 'path';

// Store cron jobs by schedule ID
const cronJobs: { [key: string]: any } = {};

interface ReportSchedule {
  id: number;
  userId: number;
  reportType: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  recipients: string[];
  lastRun: Date;
  nextRun: Date;
  active: boolean;
}

// In-memory storage for schedules (would be a database in production)
const schedules: ReportSchedule[] = [];

// Email transport configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Create a new report schedule
 */
export const createReportSchedule = async (scheduleData: Omit<ReportSchedule, 'id' | 'lastRun' | 'nextRun'>): Promise<ReportSchedule> => {
  const newSchedule: ReportSchedule = {
    id: schedules.length + 1, // Use sequential numeric IDs
    userId: parseInt(scheduleData.userId.toString()),
    ...scheduleData,
    lastRun: new Date(0),
    nextRun: new Date(),
    active: true
  };

  // Calculate next run time based on frequency
  const now = new Date();
  const timeParts = newSchedule.time.split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  let nextRun = new Date(now);
  nextRun.setHours(hour, minute, 0, 0);

  switch (newSchedule.frequency) {
    case 'daily':
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
    case 'weekly':
      if (!newSchedule.dayOfWeek) {
        throw new Error('dayOfWeek is required for weekly schedules');
      }
      const dayDiff = (newSchedule.dayOfWeek - now.getDay() + 7) % 7;
      nextRun.setDate(now.getDate() + (dayDiff || 7));
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
    case 'monthly':
      if (!newSchedule.dayOfMonth) {
        throw new Error('dayOfMonth is required for monthly schedules');
      }
      nextRun.setDate(newSchedule.dayOfMonth);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
  }

  newSchedule.nextRun = nextRun;
  schedules.push(newSchedule);

  // Schedule the job
  scheduleJob(newSchedule);

  return newSchedule;
};

/**
 * Update an existing report schedule
 */
export const updateReportSchedule = async (id: number, updates: Partial<ReportSchedule>): Promise<ReportSchedule | null> => {
  const index = schedules.findIndex(s => s.id === id);
  if (index === -1) return null;

  const schedule = { ...schedules[index], ...updates };
  schedules[index] = schedule;

  // Reschedule the job if frequency or time changed
  if (updates.frequency || updates.time) {
    scheduleJob(schedule);
  }

  return schedule;
};

/**
 * Delete a report schedule
 */
export const deleteReportSchedule = async (id: number): Promise<boolean> => {
  const index = schedules.findIndex(s => s.id === id);
  if (index === -1) return false;

  schedules.splice(index, 1);
  return true;
};

/**
 * Get all schedules for a user
 */
export const getUserSchedules = async (userId: number): Promise<ReportSchedule[]> => {
  return schedules.filter(s => s.userId === userId);
};

/**
 * Get all active schedules
 */
export const getAllActiveSchedules = async (): Promise<ReportSchedule[]> => {
  return schedules.filter(s => s.active);
};

/**
 * Schedule a cron job for a report
 */
const scheduleJob = (schedule: ReportSchedule) => {
  const { frequency, time, dayOfWeek, dayOfMonth } = schedule;
  const timeParts = time.split(':');
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  let cronPattern: string;
  
  switch (frequency) {
    case 'daily':
      cronPattern = `${minute} ${hour} * * *`;
      break;
    case 'weekly':
      if (dayOfWeek === undefined) throw new Error('dayOfWeek is required for weekly schedules');
      cronPattern = `${minute} ${hour} * * ${dayOfWeek}`;
      break;
    case 'monthly':
      if (dayOfMonth === undefined) throw new Error('dayOfMonth is required for monthly schedules');
      cronPattern = `${minute} ${hour} ${dayOfMonth} * *`;
      break;
    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }

  // Remove existing job if it exists
  if (cronJobs[schedule.id]) {
    cronJobs[schedule.id].stop();
    delete cronJobs[schedule.id];
  }

  // Create new job
  const job = scheduleCron(cronPattern, async () => {
    try {
      // Generate report
      const reportPath = await generateReport({
        type: 'excel',
        template: schedule.template,
        data: await getReportData(schedule.template),
        fileName: `scheduled-report-${schedule.id}-${new Date().toISOString().split('T')[0]}`
      });

      // Send email to all recipients
      for (const recipient of schedule.recipients) {
        await sendReportEmail(recipient, reportPath);
      }

      // Update schedule
      const index = schedules.findIndex(s => s.id === schedule.id);
      if (index !== -1) {
        schedules[index].lastRun = new Date();
        schedules[index].nextRun = new Date();
        
        // Calculate next run time
        const now = new Date();
        const nextRun = new Date(now);
        nextRun.setHours(hour, minute, 0, 0);

        switch (frequency) {
          case 'daily':
            nextRun.setDate(nextRun.getDate() + 1);
            break;
          case 'weekly':
            const dayDiff = (dayOfWeek - now.getDay() + 7) % 7;
            nextRun.setDate(now.getDate() + (dayDiff || 7));
            break;
          case 'monthly':
            nextRun.setDate(dayOfMonth);
            if (nextRun <= now) {
              nextRun.setMonth(nextRun.getMonth() + 1);
            }
            break;
        }

        schedules[index].nextRun = nextRun;
      }
    } catch (error) {
      console.error(`Failed to process scheduled report ${schedule.id}:`, error);
    }
  });
};

/**
 * Send report via email
 */
const sendReportEmail = async (recipient: string, reportPath: string): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: recipient,
      subject: 'Scheduled Report from Bell24H',
      text: 'Please find your scheduled report attached.',
      attachments: [
        {
          filename: path.basename(reportPath),
          path: reportPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send report to ${recipient}:`, error);
    throw error;
  }
};

/**
 * Get data for a specific report template
 */
const getReportData = async (template: string): Promise<any[]> => {
  // In production, this would fetch actual data from your database
  // For now, return mock data based on template
  switch (template) {
    case 'rfq-summary':
      return [
        {
          id: 'RFQ123',
          product: 'Electronics Components',
          quantity: 1000,
          status: 'Open',
          createdAt: new Date(),
          suppliers: ['Supplier A', 'Supplier B']
        }
      ];
    case 'supplier-performance':
      return [
        {
          name: 'Supplier A',
          rfqResponseRate: 0.85,
          quoteAcceptanceRate: 0.75,
          deliveryPerformance: 0.92,
          rating: 4.5
        }
      ];
    case 'trend-analysis':
      return [
        {
          category: 'Electronics',
          growthRate: 12.5,
          volume: 50000,
          priceTrend: 'Stable',
          seasonality: 'High'
        }
      ];
    default:
      return [];
  }
};
