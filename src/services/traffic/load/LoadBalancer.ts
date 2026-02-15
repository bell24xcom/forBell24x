import { EventEmitter } from 'events';
import { Agent, LoadBalancerConfig, LoadBalancingAlgorithm } from '../types';

export class LoadBalancer extends EventEmitter {
  private config: LoadBalancerConfig;
  private agentHealth: Map<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    consecutiveFailures: number;
    currentLoad: number;
    responseTime: number;
  }>;
  private algorithm: LoadBalancingAlgorithm;

  constructor(config: LoadBalancerConfig) {
    super();
    this.config = config;
    this.agentHealth = new Map();
    this.algorithm = config.algorithm || 'round-robin';
    
    // Start health check interval if enabled
    if (config.healthCheckInterval > 0) {
      this.startHealthChecks();
    }
  }

  public async selectAgent(agents: Agent[], context?: any): Promise<Agent | null> {
    if (agents.length === 0) {
      return null;
    }

    // Filter out unhealthy agents
    const healthyAgents = agents.filter(agent => 
      this.isAgentHealthy(agent.id) && 
      this.canAgentHandleMoreLoad(agent)
    );

    if (healthyAgents.length === 0) {
      return null;
    }

    // Apply load balancing algorithm
    switch (this.algorithm) {
      case 'round-robin':
        return this.roundRobin(healthyAgents);
      case 'least-connections':
        return this.leastConnections(healthyAgents);
      case 'weighted-round-robin':
        return this.weightedRoundRobin(healthyAgents);
      case 'least-response-time':
        return this.leastResponseTime(healthyAgents);
      case 'resource-based':
        return this.resourceBased(healthyAgents, context);
      default:
        return this.roundRobin(healthyAgents);
    }
  }

  public updateAgentLoad(agentId: string, load: number): void {
    const health = this.agentHealth.get(agentId);
    if (health) {
      health.currentLoad = load;
      this.emit('agent:loadUpdated', { agentId, load });
    }
  }

  public updateAgentResponseTime(agentId: string, responseTime: number): void {
    const health = this.agentHealth.get(agentId);
    if (health) {
      health.responseTime = responseTime;
      this.emit('agent:responseTimeUpdated', { agentId, responseTime });
    }
  }

  public registerAgent(agent: Agent): void {
    this.agentHealth.set(agent.id, {
      status: 'healthy',
      lastCheck: new Date(),
      consecutiveFailures: 0,
      currentLoad: 0,
      responseTime: 0
    });
    this.emit('agent:registered', { agent });
  }

  public unregisterAgent(agentId: string): void {
    this.agentHealth.delete(agentId);
    this.emit('agent:unregistered', { agentId });
  }

  public getAgentHealth(agentId: string) {
    return this.agentHealth.get(agentId);
  }

  public getAllAgentHealth() {
    return Object.fromEntries(this.agentHealth);
  }

  private isAgentHealthy(agentId: string): boolean {
    const health = this.agentHealth.get(agentId);
    return health?.status === 'healthy' || health?.status === 'degraded';
  }

  private canAgentHandleMoreLoad(agent: Agent): boolean {
    const health = this.agentHealth.get(agent.id);
    return health ? health.currentLoad < this.config.maxConnectionsPerAgent : false;
  }

  private roundRobin(agents: Agent[]): Agent {
    // Simple round-robin implementation
    const index = Math.floor(Math.random() * agents.length);
    return agents[index];
  }

  private leastConnections(agents: Agent[]): Agent {
    return agents.reduce((min, agent) => {
      const minLoad = this.agentHealth.get(min.id)?.currentLoad || 0;
      const currentLoad = this.agentHealth.get(agent.id)?.currentLoad || 0;
      return currentLoad < minLoad ? agent : min;
    });
  }

  private weightedRoundRobin(agents: Agent[]): Agent {
    // Calculate total weight
    const totalWeight = agents.reduce((sum, agent) => {
      const health = this.agentHealth.get(agent.id);
      return sum + (health ? 1 / (health.currentLoad + 1) : 0);
    }, 0);

    // Select agent based on weight
    let random = Math.random() * totalWeight;
    for (const agent of agents) {
      const health = this.agentHealth.get(agent.id);
      const weight = health ? 1 / (health.currentLoad + 1) : 0;
      random -= weight;
      if (random <= 0) {
        return agent;
      }
    }

    return agents[0];
  }

  private leastResponseTime(agents: Agent[]): Agent {
    return agents.reduce((min, agent) => {
      const minTime = this.agentHealth.get(min.id)?.responseTime || Infinity;
      const currentTime = this.agentHealth.get(agent.id)?.responseTime || Infinity;
      return currentTime < minTime ? agent : min;
    });
  }

  private resourceBased(agents: Agent[], context?: any): Agent {
    // Implement resource-based selection based on context
    // This is a placeholder implementation
    return this.leastConnections(agents);
  }

  private async startHealthChecks(): Promise<void> {
    setInterval(async () => {
      for (const [agentId, health] of this.agentHealth.entries()) {
        try {
          await this.checkAgentHealth(agentId);
          health.consecutiveFailures = 0;
          health.status = 'healthy';
          health.lastCheck = new Date();
        } catch (error) {
          health.consecutiveFailures++;
          if (health.consecutiveFailures >= this.config.failoverThreshold) {
            health.status = 'unhealthy';
          } else {
            health.status = 'degraded';
          }
          this.emit('agent:healthCheckFailed', { agentId, error });
        }
      }
    }, this.config.healthCheckInterval * 1000);
  }

  private async checkAgentHealth(agentId: string): Promise<void> {
    // Implement actual health check logic here
    // This is a placeholder implementation
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  public setAlgorithm(algorithm: LoadBalancingAlgorithm): void {
    this.algorithm = algorithm;
    this.emit('algorithm:changed', { algorithm });
  }

  public getCurrentAlgorithm(): LoadBalancingAlgorithm {
    return this.algorithm;
  }
} 