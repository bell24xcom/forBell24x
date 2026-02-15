import { EventEmitter } from 'events';
import { Message, MessageRoutingConfig, Agent } from '../types';
import { QueueManager } from '../queue/QueueManager';
import { LoadBalancer } from '../load/LoadBalancer';

export class MessageRouter extends EventEmitter {
  private config: MessageRoutingConfig;
  private queueManager: QueueManager;
  private loadBalancer: LoadBalancer;
  private activeMessages: Map<string, Message>;
  private agentPool: Map<string, Agent>;

  constructor(config: MessageRoutingConfig) {
    super();
    this.config = config;
    this.queueManager = new QueueManager({
      maxQueueLength: 1000,
      timeout: 300,
      priorityLevels: 5,
      overflowThreshold: 80,
      retryAttempts: 3,
      retryDelay: 30
    });
    this.loadBalancer = new LoadBalancer({
      algorithm: 'least-connections',
      maxConnectionsPerAgent: 10,
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
    this.activeMessages = new Map();
    this.agentPool = new Map();
  }

  public async route(message: Message): Promise<void> {
    try {
      // Check if message can be handled by bot
      if (await this.canHandleByBot(message)) {
        await this.handleBotMessage(message);
        return;
      }

      // Check if message can be handled directly by agent
      if (await this.canHandleDirectly(message)) {
        await this.handleDirectMessage(message);
        return;
      }

      // Queue the message if direct handling is not possible
      await this.queueMessage(message);
    } catch (error) {
      this.emit('error', { message, error });
      throw error;
    }
  }

  private async canHandleByBot(message: Message): Promise<boolean> {
    if (!this.config.botHandling.enabled) {
      return false;
    }

    // Check if message type is supported by bot
    if (message.type === 'whatsapp' || message.type === 'chatbot') {
      // Implement bot intent detection logic here
      const intent = await this.detectIntent(message);
      return intent.confidence >= this.config.botHandling.intentThreshold;
    }

    return false;
  }

  private async handleBotMessage(message: Message): Promise<void> {
    message.status = 'processing';
    this.emit('message:processing', message);

    try {
      // Implement bot response generation logic here
      const response = await this.generateBotResponse(message);
      
      // Send bot response
      await this.sendMessage(response);
      
      message.status = 'completed';
      this.emit('message:completed', message);
    } catch (error) {
      // If bot handling fails, try human handoff
      if (this.config.humanHandoff.enabled) {
        await this.handleHumanHandoff(message);
      } else {
        message.status = 'failed';
        this.emit('message:failed', { message, error });
        throw error;
      }
    }
  }

  private async canHandleDirectly(message: Message): Promise<boolean> {
    // Check if we have available agents
    const availableAgents = await this.getAvailableAgents(message);
    if (availableAgents.length === 0) {
      return false;
    }

    // Check if any agent can handle the message based on skills and load
    const suitableAgent = await this.findSuitableAgent(message, availableAgents);
    return !!suitableAgent;
  }

  private async handleDirectMessage(message: Message): Promise<void> {
    const availableAgents = await this.getAvailableAgents(message);
    const agent = await this.findSuitableAgent(message, availableAgents);

    if (!agent) {
      throw new Error('No suitable agent found for direct message handling');
    }

    // Update message status and assign agent
    message.status = 'processing';
    message.metadata.agent = agent;
    message.metadata.startTime = new Date();

    // Update agent status
    agent.status = 'busy';
    agent.currentLoad++;

    // Store active message
    this.activeMessages.set(message.id, message);

    // Emit processing event
    this.emit('message:processing', { message, agent });

    try {
      // Attempt to assign message to agent
      await this.assignMessageToAgent(message, agent);
      
      // Update message status
      message.status = 'sent';
      this.emit('message:routed', { message, agent });
    } catch (error) {
      // Handle assignment failure
      message.status = 'failed';
      agent.status = 'available';
      agent.currentLoad--;
      this.activeMessages.delete(message.id);
      this.emit('message:failed', { message, agent, error });
      throw error;
    }
  }

  private async queueMessage(message: Message): Promise<void> {
    // Set initial queue status
    message.status = 'queued';
    message.metadata.queue = this.determineQueue(message);

    // Add to queue
    await this.queueManager.addToQueue(message.metadata.queue, message, message.priority);

    // Emit queued event
    this.emit('message:queued', message);

    // Start queue processing
    this.processQueue(message.metadata.queue);
  }

  private async processQueue(queueName: string): Promise<void> {
    while (true) {
      const message = await this.queueManager.getNextFromQueue(queueName);
      if (!message) {
        break;
      }

      try {
        await this.handleDirectMessage(message);
      } catch (error) {
        // If direct handling fails, requeue with lower priority
        if (message.priority > 0) {
          message.priority--;
          await this.queueManager.addToQueue(queueName, message, message.priority);
        } else {
          this.emit('message:failed', { message, error });
        }
      }
    }
  }

  private async getAvailableAgents(message: Message): Promise<Agent[]> {
    const agents = Array.from(this.agentPool.values());
    return agents.filter(agent => 
      agent.status === 'available' && 
      agent.currentLoad < agent.maxLoad &&
      this.agentCanHandleMessage(agent, message)
    );
  }

  private agentCanHandleMessage(agent: Agent, message: Message): boolean {
    // Check language compatibility
    if (message.customer.language && !agent.languages.includes(message.customer.language)) {
      return false;
    }

    // Check VIP handling
    if (message.customer.vip && !agent.skills.includes('vip')) {
      return false;
    }

    // Check channel-specific skills
    if (!agent.skills.includes(message.type)) {
      return false;
    }

    return true;
  }

  private async findSuitableAgent(message: Message, availableAgents: Agent[]): Promise<Agent | null> {
    if (availableAgents.length === 0) {
      return null;
    }

    // Apply load balancing algorithm
    return this.loadBalancer.selectAgent(availableAgents, message);
  }

  private determineQueue(message: Message): string {
    // Check channel priority
    const channelConfig = this.config.channelPriority.find(c => c.channel === message.type);
    if (channelConfig) {
      return `${message.type}_${channelConfig.priority}`;
    }

    // Check customer priority
    if (message.customer.vip) {
      return 'vip';
    }

    return 'general';
  }

  private async assignMessageToAgent(message: Message, agent: Agent): Promise<void> {
    // Implement actual message assignment logic here
    // This could involve integration with a messaging platform
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated assignment delay
  }

  private async detectIntent(message: Message): Promise<{ intent: string; confidence: number }> {
    // Implement intent detection logic here
    // This is a placeholder implementation
    return {
      intent: 'general_inquiry',
      confidence: 0.85
    };
  }

  private async generateBotResponse(message: Message): Promise<Message> {
    // Implement bot response generation logic here
    // This is a placeholder implementation
    return {
      ...message,
      id: `response_${message.id}`,
      content: 'This is an automated response.',
      timestamp: new Date()
    };
  }

  private async handleHumanHandoff(message: Message): Promise<void> {
    message.metadata.handoffReason = 'bot_failure';
    message.priority = this.config.humanHandoff.priority;
    await this.queueMessage(message);
  }

  private async sendMessage(message: Message): Promise<void> {
    // Implement actual message sending logic here
    // This could involve integration with various messaging platforms
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulated sending delay
  }

  public async getActiveMessageCount(): Promise<number> {
    return this.activeMessages.size;
  }

  public async completeMessage(messageId: string): Promise<void> {
    const message = this.activeMessages.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const agent = message.metadata.agent as Agent;
    if (agent) {
      agent.status = 'available';
      agent.currentLoad--;
    }

    message.status = 'completed';
    message.metadata.endTime = new Date();
    message.metadata.duration = message.metadata.endTime.getTime() - message.metadata.startTime.getTime();

    this.activeMessages.delete(messageId);
    this.emit('message:completed', message);
  }

  public async updateAgentPool(agents: Agent[]): Promise<void> {
    this.agentPool.clear();
    agents.forEach(agent => this.agentPool.set(agent.id, agent));
  }
} 