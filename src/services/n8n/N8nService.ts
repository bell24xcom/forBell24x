import axios from 'axios';
import { logger } from '../../utils/logger';

interface N8nConfig {
  apiKey: string;
  baseUrl: string;
  webhookUrl: string;
}

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any[];
  settings: any;
  tags: string[];
  triggerCount: number;
  updatedAt: string;
  createdAt: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'error' | 'running';
  startedAt: string;
  finishedAt?: string;
  data: any;
  error?: string;
}

export class N8nService {
  private config: N8nConfig;
  private client: any;

  constructor(config: N8nConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Workflow Management
  async getWorkflows(): Promise<Workflow[]> {
    try {
      const response = await this.client.get('/workflows');
      return response.data;
    } catch (error) {
      logger.error('Error fetching workflows', { error });
      throw error;
    }
  }

  async getWorkflow(id: string): Promise<Workflow> {
    try {
      const response = await this.client.get(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching workflow', { error, workflowId: id });
      throw error;
    }
  }

  async createWorkflow(workflow: Partial<Workflow>): Promise<Workflow> {
    try {
      const response = await this.client.post('/workflows', workflow);
      return response.data;
    } catch (error) {
      logger.error('Error creating workflow', { error, workflow });
      throw error;
    }
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    try {
      const response = await this.client.put(`/workflows/${id}`, workflow);
      return response.data;
    } catch (error) {
      logger.error('Error updating workflow', { error, workflowId: id });
      throw error;
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    try {
      await this.client.delete(`/workflows/${id}`);
    } catch (error) {
      logger.error('Error deleting workflow', { error, workflowId: id });
      throw error;
    }
  }

  // Workflow Execution
  async executeWorkflow(id: string, data?: any): Promise<WorkflowExecution> {
    try {
      const response = await this.client.post(`/workflows/${id}/execute`, { data });
      return response.data;
    } catch (error) {
      logger.error('Error executing workflow', { error, workflowId: id });
      throw error;
    }
  }

  async getWorkflowExecutions(id: string): Promise<WorkflowExecution[]> {
    try {
      const response = await this.client.get(`/workflows/${id}/executions`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching workflow executions', { error, workflowId: id });
      throw error;
    }
  }

  // Webhook Management
  async createWebhook(workflowId: string, path: string): Promise<string> {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/webhooks`, { path });
      return response.data.webhookUrl;
    } catch (error) {
      logger.error('Error creating webhook', { error, workflowId });
      throw error;
    }
  }

  async deleteWebhook(workflowId: string, webhookId: string): Promise<void> {
    try {
      await this.client.delete(`/workflows/${workflowId}/webhooks/${webhookId}`);
    } catch (error) {
      logger.error('Error deleting webhook', { error, workflowId, webhookId });
      throw error;
    }
  }

  // Analytics and Reporting
  async getWorkflowStats(workflowId: string, startDate?: Date, endDate?: Date): Promise<any> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await this.client.get(`/workflows/${workflowId}/stats`, { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching workflow stats', { error, workflowId });
      throw error;
    }
  }

  async getSystemStats(): Promise<any> {
    try {
      const response = await this.client.get('/stats');
      return response.data;
    } catch (error) {
      logger.error('Error fetching system stats', { error });
      throw error;
    }
  }

  // Error Handling and Monitoring
  async getErrorLogs(workflowId: string, limit: number = 100): Promise<any[]> {
    try {
      const response = await this.client.get(`/workflows/${workflowId}/errors`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching error logs', { error, workflowId });
      throw error;
    }
  }

  async getActiveWorkflows(): Promise<Workflow[]> {
    try {
      const response = await this.client.get('/workflows/active');
      return response.data;
    } catch (error) {
      logger.error('Error fetching active workflows', { error });
      throw error;
    }
  }
} 