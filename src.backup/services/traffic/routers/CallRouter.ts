import { EventEmitter } from 'events';
import { Call, CallRoutingConfig, Agent } from '../types';
import { QueueManager } from '../queue/QueueManager';
import { LoadBalancer } from '../load/LoadBalancer';

export class CallRouter extends EventEmitter {
  private config: CallRoutingConfig;
  private queueManager: QueueManager;
  private loadBalancer: LoadBalancer;
  private activeCalls: Map<string, Call>;
  private agentPool: Map<string, Agent>;

  constructor(config: CallRoutingConfig) {
    super();
    this.config = config;
    this.queueManager = new QueueManager({
      maxQueueLength: 100,
      timeout: 300,
      priorityLevels: 5,
      overflowThreshold: 80,
      retryAttempts: 3,
      retryDelay: 30
    });
    this.loadBalancer = new LoadBalancer({
      algorithm: 'least-connections',
      maxConnectionsPerAgent: 5,
      healthCheckInterval: 30,
      failoverThreshold: 3,
      autoScaling: {
        enabled: true,
        minInstances: 2,
        maxInstances: 10,
        scaleUpThreshold: 80,
        scaleDownThreshold: 20
      }
    });
    this.activeCalls = new Map();
    this.agentPool = new Map();
  }

  public async route(call: Call): Promise<void> {
    try {
      // Check if call can be handled directly
      if (await this.canHandleDirectly(call)) {
        await this.handleDirectCall(call);
        return;
      }

      // Queue the call if direct handling is not possible
      await this.queueCall(call);
    } catch (error) {
      this.emit('error', { call, error });
      throw error;
    }
  }

  private async canHandleDirectly(call: Call): Promise<boolean> {
    // Check if we have available agents
    const availableAgents = await this.getAvailableAgents(call);
    if (availableAgents.length === 0) {
      return false;
    }

    // Check if any agent can handle the call based on skills and load
    const suitableAgent = await this.findSuitableAgent(call, availableAgents);
    return !!suitableAgent;
  }

  private async handleDirectCall(call: Call): Promise<void> {
    const availableAgents = await this.getAvailableAgents(call);
    const agent = await this.findSuitableAgent(call, availableAgents);

    if (!agent) {
      throw new Error('No suitable agent found for direct call handling');
    }

    // Update call status and assign agent
    call.status = 'routing';
    call.agent = agent;
    call.startTime = new Date();

    // Update agent status
    agent.status = 'busy';
    agent.currentLoad++;

    // Store active call
    this.activeCalls.set(call.id, call);

    // Emit routing event
    this.emit('call:routing', { call, agent });

    try {
      // Attempt to connect call to agent
      await this.connectCallToAgent(call, agent);
      
      // Update call status
      call.status = 'active';
      this.emit('call:routed', { call, agent });
    } catch (error) {
      // Handle connection failure
      call.status = 'failed';
      agent.status = 'available';
      agent.currentLoad--;
      this.activeCalls.delete(call.id);
      this.emit('call:failed', { call, agent, error });
      throw error;
    }
  }

  private async queueCall(call: Call): Promise<void> {
    // Set initial queue status
    call.status = 'queued';
    call.queue = this.determineQueue(call);

    // Add to queue
    await this.queueManager.addToQueue(call.queue, call, call.priority);

    // Emit queued event
    this.emit('call:queued', call);

    // Start queue processing
    this.processQueue(call.queue);
  }

  private async processQueue(queueName: string): Promise<void> {
    while (true) {
      const call = await this.queueManager.getNextFromQueue(queueName);
      if (!call) {
        break;
      }

      try {
        await this.handleDirectCall(call);
      } catch (error) {
        // If direct handling fails, requeue with lower priority
        if (call.priority > 0) {
          call.priority--;
          await this.queueManager.addToQueue(queueName, call, call.priority);
        } else {
          this.emit('call:failed', { call, error });
        }
      }
    }
  }

  private async getAvailableAgents(call: Call): Promise<Agent[]> {
    const agents = Array.from(this.agentPool.values());
    return agents.filter(agent => 
      agent.status === 'available' && 
      agent.currentLoad < agent.maxLoad &&
      this.agentCanHandleCall(agent, call)
    );
  }

  private agentCanHandleCall(agent: Agent, call: Call): boolean {
    // Check language compatibility
    if (call.customer.language && !agent.languages.includes(call.customer.language)) {
      return false;
    }

    // Check VIP handling
    if (call.customer.vip && !agent.skills.includes('vip')) {
      return false;
    }

    // Check skill-based routing
    if (this.config.skillBasedRouting) {
      const requiredSkills = this.getRequiredSkills(call);
      if (!requiredSkills.every(skill => agent.skills.includes(skill))) {
        return false;
      }
    }

    return true;
  }

  private getRequiredSkills(call: Call): string[] {
    const skills: string[] = [];

    // Add skills based on call type
    if (call.type === 'inbound') {
      skills.push('inbound');
    } else {
      skills.push('outbound');
    }

    // Add skills based on customer type
    if (call.customer.vip) {
      skills.push('vip');
    }

    // Add skills based on metadata
    if (call.metadata.technical) {
      skills.push('technical');
    }
    if (call.metadata.sales) {
      skills.push('sales');
    }

    return skills;
  }

  private async findSuitableAgent(call: Call, availableAgents: Agent[]): Promise<Agent | null> {
    if (availableAgents.length === 0) {
      return null;
    }

    // Apply load balancing algorithm
    return this.loadBalancer.selectAgent(availableAgents, call);
  }

  private determineQueue(call: Call): string {
    if (this.config.priorityRouting && call.customer.vip) {
      return 'vip';
    }

    if (this.config.departmentRouting) {
      if (call.metadata.technical) {
        return 'technical';
      }
      if (call.metadata.sales) {
        return 'sales';
      }
    }

    return 'general';
  }

  private async connectCallToAgent(call: Call, agent: Agent): Promise<void> {
    // Implement actual call connection logic here
    // This could involve integration with a telephony system
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated connection delay
  }

  public async getActiveCallCount(): Promise<number> {
    return this.activeCalls.size;
  }

  public async completeCall(callId: string): Promise<void> {
    const call = this.activeCalls.get(callId);
    if (!call) {
      throw new Error('Call not found');
    }

    const agent = call.agent;
    if (agent) {
      agent.status = 'available';
      agent.currentLoad--;
    }

    call.status = 'completed';
    call.endTime = new Date();
    call.duration = call.endTime.getTime() - call.startTime!.getTime();

    this.activeCalls.delete(callId);
    this.emit('call:completed', call);
  }

  public async updateAgentPool(agents: Agent[]): Promise<void> {
    this.agentPool.clear();
    agents.forEach(agent => this.agentPool.set(agent.id, agent));
  }
} 