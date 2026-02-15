import { v4 as uuidv4 } from 'uuid';

interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'kpi';
  title: string;
  dataSources: {
    type: 'api' | 'database' | 'custom';
    endpoint?: string;
    query?: string;
    parameters?: Record<string, any>;
  }[];
  visualization: {
    type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge';
    options: Record<string, any>;
  };
  layout: {
    row: number;
    column: number;
    width: number;
    height: number;
  };
  filters: {
    type: 'date' | 'category' | 'supplier' | 'metric';
    values: any[];
  }[];
  settings: {
    refreshInterval: number;
    autoRefresh: boolean;
    theme: 'light' | 'dark' | 'custom';
    animation: boolean;
    tooltips: boolean;
  };
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: WidgetConfig[];
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  filters: {
    global: boolean;
    position: 'top' | 'left' | 'right' | 'bottom';
    presets: {
      name: string;
      values: Record<string, any>;
    }[];
  };
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: DashboardLayout;
  tags: string[];
  popularity: number;
  rating: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (would be a database in production)
const dashboardTemplates: DashboardTemplate[] = [
  {
    id: uuidv4(),
    name: 'RFQ Performance Dashboard',
    description: 'Track RFQ performance metrics and supplier response rates',
    category: 'rfq',
    layout: {
      id: uuidv4(),
      name: 'RFQ Performance',
      description: 'Default layout for RFQ performance tracking',
      widgets: [
        {
          id: uuidv4(),
          type: 'metric',
          title: 'Key Metrics',
          dataSources: [
            {
              type: 'api',
              endpoint: '/api/metrics/rfq-performance'
            }
          ],
          visualization: {
            type: 'kpi',
            options: {
              showTrend: true,
              showTargets: true
            }
          },
          layout: {
            row: 0,
            column: 0,
            width: 2,
            height: 1
          },
          settings: {
            refreshInterval: 300,
            autoRefresh: true,
            theme: 'light',
            animation: true,
            tooltips: true
          }
        },
        {
          id: uuidv4(),
          type: 'chart',
          title: 'Response Time Analysis',
          dataSources: [
            {
              type: 'api',
              endpoint: '/api/metrics/response-times'
            }
          ],
          visualization: {
            type: 'line',
            options: {
              showTrendLine: true,
              showAverage: true
            }
          },
          layout: {
            row: 0,
            column: 2,
            width: 2,
            height: 2
          },
          settings: {
            refreshInterval: 600,
            autoRefresh: true,
            theme: 'light',
            animation: true,
            tooltips: true
          }
        },
        {
          id: uuidv4(),
          type: 'table',
          title: 'Supplier Performance',
          dataSources: [
            {
              type: 'api',
              endpoint: '/api/suppliers/performance'
            }
          ],
          visualization: {
            type: 'table',
            options: {
              sortable: true,
              filterable: true
            }
          },
          layout: {
            row: 1,
            column: 0,
            width: 2,
            height: 2
          },
          settings: {
            refreshInterval: 900,
            autoRefresh: true,
            theme: 'light',
            animation: false,
            tooltips: true
          }
        }
      ],
      grid: {
        columns: 4,
        rows: 3,
        gap: 10
      },
      theme: {
        primaryColor: '#2196F3',
        secondaryColor: '#03A9F4',
        backgroundColor: '#FFFFFF',
        textColor: '#333333',
        fontFamily: 'Arial, sans-serif'
      },
      filters: {
        global: true,
        position: 'top',
        presets: [
          {
            name: 'Last 7 Days',
            values: {
              dateRange: '7d'
            }
          },
          {
            name: 'Last Month',
            values: {
              dateRange: '30d'
            }
          }
        ]
      }
    },
    tags: ['rfq', 'performance', 'supplier', 'analytics'],
    popularity: 150,
    rating: 4.8,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const getDashboardTemplates = async (): Promise<DashboardTemplate[]> => {
  return dashboardTemplates;
};

export const getDashboardTemplateById = async (id: string): Promise<DashboardTemplate | null> => {
  return dashboardTemplates.find(t => t.id === id) || null;
};

export const createDashboardTemplate = async (template: Omit<DashboardTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<DashboardTemplate> => {
  const newTemplate: DashboardTemplate = {
    id: uuidv4(),
    ...template,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  dashboardTemplates.push(newTemplate);
  return newTemplate;
};

export const updateDashboardTemplate = async (id: string, updates: Partial<DashboardTemplate>): Promise<DashboardTemplate | null> => {
  const index = dashboardTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;

  const updatedTemplate = { ...dashboardTemplates[index], ...updates, updatedAt: new Date() };
  dashboardTemplates[index] = updatedTemplate;
  return updatedTemplate;
};

export const deleteDashboardTemplate = async (id: string): Promise<boolean> => {
  const index = dashboardTemplates.findIndex(t => t.id === id);
  if (index === -1) return false;

  dashboardTemplates.splice(index, 1);
  return true;
};

export const getTemplatesByCategory = async (category: string): Promise<DashboardTemplate[]> => {
  return dashboardTemplates.filter(t => t.category === category);
};

export const getTemplatesByTags = async (tags: string[]): Promise<DashboardTemplate[]> => {
  return dashboardTemplates.filter(t => 
    t.tags.some(tag => tags.includes(tag.toLowerCase()))
  );
};

export const getPopularTemplates = async (limit: number = 10): Promise<DashboardTemplate[]> => {
  return dashboardTemplates
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
};

export const getHighestRatedTemplates = async (limit: number = 10): Promise<DashboardTemplate[]> => {
  return dashboardTemplates
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};
