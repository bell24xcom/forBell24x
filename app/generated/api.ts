// Auto-generated API stub - replace with actual generated client
export class Configuration {
  basePath: string;
  constructor(config: { basePath?: string }) {
    this.basePath = config.basePath || '/api';
  }
}

export class RfqsApi {
  private config: Configuration;
  constructor(config: Configuration) {
    this.config = config;
  }

  async getRfqs(params?: Record<string, unknown>) {
    const response = await fetch(`${this.config.basePath}/rfqs`);
    return response.json();
  }

  async getRfqById(id: string) {
    const response = await fetch(`${this.config.basePath}/rfqs/${id}`);
    return response.json();
  }

  async createRfq(data: Record<string, unknown>) {
    const response = await fetch(`${this.config.basePath}/rfqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
