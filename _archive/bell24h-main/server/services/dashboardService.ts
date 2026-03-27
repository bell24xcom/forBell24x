import { ChartData } from 'chart.js';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface DashboardMetrics {
  totalRfqs: number;
  activeRfqs: number;
  completedRfqs: number;
  averageResponseTime: number;
  responseRate: number;
  supplierPerformance: {
    id: string;
    name: string;
    responseRate: number;
    acceptanceRate: number;
    deliveryPerformance: number;
    rating: number;
  }[];
  categoryPerformance: {
    category: string;
    rfqCount: number;
    averageQuoteTime: number;
    averageDeliveryTime: number;
  }[];
  revenueTrend: {
    date: string;
    revenue: number;
  }[];
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table';
  data: any;
  options?: any;
  layout: {
    width: number;
    height: number;
    row: number;
    column: number;
  };
}

interface DashboardConfig {
  id: string;
  userId: number;
  name: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    rows: number;
  };
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: uuidv4(),
    title: 'Key Metrics',
    type: 'metric',
    data: {
      totalRfqs: 0,
      activeRfqs: 0,
      completedRfqs: 0
    },
    layout: {
      width: 2,
      height: 1,
      row: 0,
      column: 0
    }
  },
  {
    id: uuidv4(),
    title: 'Response Time',
    type: 'chart',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Average Response Time',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    } as ChartData<'line'>,
    options: {
      responsive: true,
      maintainAspectRatio: false
    },
    layout: {
      width: 2,
      height: 1,
      row: 0,
      column: 2
    }
  },
  {
    id: uuidv4(),
    title: 'Supplier Performance',
    type: 'table',
    data: [],
    layout: {
      width: 4,
      height: 2,
      row: 1,
      column: 0
    }
  },
  {
    id: uuidv4(),
    title: 'Category Analysis',
    type: 'chart',
    data: {
      labels: [],
      datasets: [
        {
          label: 'RFQ Count',
          data: [],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    } as ChartData<'bar'>,
    options: {
      responsive: true,
      maintainAspectRatio: false
    },
    layout: {
      width: 2,
      height: 2,
      row: 1,
      column: 4
    }
  }
];

const defaultConfig: DashboardConfig = {
  id: uuidv4(),
  userId: 0,
  name: 'Default Dashboard',
  widgets: defaultWidgets,
  layout: {
    columns: 6,
    rows: 3
  }
};

// In-memory storage (would be a database in production)
const dashboardConfigs: DashboardConfig[] = [];

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  // Simulated data - in production this would come from your database
  return {
    totalRfqs: 1500,
    activeRfqs: 300,
    completedRfqs: 1200,
    averageResponseTime: 2.5, // hours
    responseRate: 0.85, // 85%
    supplierPerformance: [
      {
        id: uuidv4(),
        name: 'Supplier A',
        responseRate: 0.92,
        acceptanceRate: 0.88,
        deliveryPerformance: 0.95,
        rating: 4.8
      },
      {
        id: uuidv4(),
        name: 'Supplier B',
        responseRate: 0.88,
        acceptanceRate: 0.85,
        deliveryPerformance: 0.90,
        rating: 4.5
      },
      {
        id: uuidv4(),
        name: 'Supplier C',
        responseRate: 0.90,
        acceptanceRate: 0.90,
        deliveryPerformance: 0.93,
        rating: 4.7
      }
    ],
    categoryPerformance: [
      {
        category: 'Electronics',
        rfqCount: 300,
        averageQuoteTime: 1.5,
        averageDeliveryTime: 30
      },
      {
        category: 'Mechanical',
        rfqCount: 200,
        averageQuoteTime: 2.0,
        averageDeliveryTime: 45
      },
      {
        category: 'Chemicals',
        rfqCount: 150,
        averageQuoteTime: 1.8,
        averageDeliveryTime: 25
      }
    ],
    revenueTrend: Array.from({ length: 6 }, (_, i) => ({
      date: format(new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000), 'MMM d'),
      revenue: Math.floor(Math.random() * 10000)
    }))
  };
};

export const getDashboardConfig = async (userId: number): Promise<DashboardConfig> => {
  const config = dashboardConfigs.find(c => c.userId === userId);
  if (config) return config;
  
  const newConfig = { ...defaultConfig, userId };
  dashboardConfigs.push(newConfig);
  return newConfig;
};

export const updateDashboardConfig = async (userId: number, config: Partial<DashboardConfig>): Promise<DashboardConfig> => {
  const index = dashboardConfigs.findIndex(c => c.userId === userId);
  if (index === -1) {
    throw new Error('Dashboard configuration not found');
  }

  const updatedConfig = { ...dashboardConfigs[index], ...config };
  dashboardConfigs[index] = updatedConfig;
  return updatedConfig;
};

export const getWidgetData = async (widgetId: string): Promise<any> => {
  const metrics = await getDashboardMetrics();
  
  switch (widgetId) {
    case defaultWidgets[0].id: // Key Metrics
      return {
        totalRfqs: metrics.totalRfqs,
        activeRfqs: metrics.activeRfqs,
        completedRfqs: metrics.completedRfqs
      };
    case defaultWidgets[1].id: // Response Time
      return {
        labels: Array.from({ length: 7 }, (_, i) => format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), 'MMM d')),
        datasets: [
          {
            label: 'Average Response Time',
            data: Array.from({ length: 7 }, () => Math.random() * 4 + 1),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      };
    case defaultWidgets[2].id: // Supplier Performance
      return metrics.supplierPerformance;
    case defaultWidgets[3].id: // Category Analysis
      return {
        labels: metrics.categoryPerformance.map(c => c.category),
        datasets: [
          {
            label: 'RFQ Count',
            data: metrics.categoryPerformance.map(c => c.rfqCount),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }
        ]
      };
    default:
      throw new Error('Widget not found');
  }
};
