import axios from 'axios';

export interface N8nConfig {
  baseUrl: string;
  apiKey: string;
  webhookSecret: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  data: any;
  error?: string;
}

export class N8nService {
  private config: N8nConfig;
  private client: any;

  constructor() {
    this.config = {
      baseUrl: process.env.N8N_API_URL || 'https://n8n.bell24h.com/api',
      apiKey: process.env.N8N_API_KEY || '',
      webhookSecret: process.env.N8N_WEBHOOK_SECRET || ''
    };

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'X-N8N-API-KEY': this.config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  // Test N8N connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.get('/workflows');
      return {
        success: true,
        message: `Connected to N8N successfully. Found ${response.data.data?.length || 0} workflows.`
      };
    } catch (error: any) {
      console.error('N8N connection test failed:', error.message);
      return {
        success: false,
        message: `Failed to connect to N8N: ${error.message}`
      };
    }
  }

  // Get all workflows
  async getWorkflows(): Promise<N8nWorkflow[]> {
    try {
      const response = await this.client.get('/workflows');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      throw new Error('Failed to fetch workflows from N8N');
    }
  }

  // Get workflow by ID
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    try {
      const response = await this.client.get(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch workflow ${id}:`, error);
      throw new Error(`Failed to fetch workflow ${id}`);
    }
  }

  // Execute workflow
  async executeWorkflow(id: string, data: any = {}): Promise<N8nExecution> {
    try {
      const response = await this.client.post(`/workflows/${id}/execute`, {
        data
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to execute workflow ${id}:`, error);
      throw new Error(`Failed to execute workflow ${id}`);
    }
  }

  // Get execution status
  async getExecution(id: string): Promise<N8nExecution> {
    try {
      const response = await this.client.get(`/executions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch execution ${id}:`, error);
      throw new Error(`Failed to fetch execution ${id}`);
    }
  }

  // Get all executions for a workflow
  async getWorkflowExecutions(workflowId: string, limit: number = 20): Promise<N8nExecution[]> {
    try {
      const response = await this.client.get(`/executions`, {
        params: {
          workflowId,
          limit
        }
      });
      return response.data.data || [];
    } catch (error) {
      console.error(`Failed to fetch executions for workflow ${workflowId}:`, error);
      throw new Error(`Failed to fetch executions for workflow ${workflowId}`);
    }
  }

  // Create webhook URL for workflow
  getWebhookUrl(workflowId: string, nodeId: string): string {
    return `${this.config.baseUrl}/webhook/${workflowId}/${nodeId}`;
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // In a real implementation, you would verify the webhook signature
    // using HMAC-SHA256 with your webhook secret
    return true; // Simplified for now
  }

  // Trigger workflow via webhook
  async triggerWebhook(workflowId: string, nodeId: string, data: any): Promise<any> {
    try {
      const webhookUrl = this.getWebhookUrl(workflowId, nodeId);
      const response = await axios.post(webhookUrl, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to trigger webhook for workflow ${workflowId}:`, error);
      throw new Error(`Failed to trigger webhook for workflow ${workflowId}`);
    }
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
  }> {
    try {
      const executions = await this.getWorkflowExecutions(workflowId, 100);
      
      const stats = {
        totalExecutions: executions.length,
        successfulExecutions: executions.filter(e => e.status === 'success').length,
        failedExecutions: executions.filter(e => e.status === 'error').length,
        averageExecutionTime: 0
      };

      // Calculate average execution time
      const completedExecutions = executions.filter(e => e.finishedAt && e.startedAt);
      if (completedExecutions.length > 0) {
        const totalTime = completedExecutions.reduce((sum, exec) => {
          const start = new Date(exec.startedAt).getTime();
          const end = new Date(exec.finishedAt!).getTime();
          return sum + (end - start);
        }, 0);
        stats.averageExecutionTime = totalTime / completedExecutions.length;
      }

      return stats;
    } catch (error) {
      console.error(`Failed to get stats for workflow ${workflowId}:`, error);
      throw new Error(`Failed to get stats for workflow ${workflowId}`);
    }
  }
}

// Export singleton instance
export const n8nService = new N8nService();
