import { io, Socket } from 'socket.io-client';

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'feature-request' | 'bug-report';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
  tags: string[];
  attachments: string[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  createdAt: Date;
  isInternal: boolean;
  attachments?: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId?: string;
  agentId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  isFromUser: boolean;
  attachments?: string[];
}

export interface ChatSession {
  id: string;
  userId?: string;
  agentId?: string;
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  rating?: number;
  feedback?: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  viewCount: number;
  helpfulCount: number;
  relatedArticles: string[];
}

class HelpCenterService {
  private socket: Socket | null = null;
  private chatSessions: Map<string, ChatSession> = new Map();
  private tickets: Map<string, Ticket> = new Map();
  private faqs: Map<string, FAQ> = new Map();
  private knowledgeBase: Map<string, KnowledgeBaseArticle> = new Map();

  constructor() {
    this.initializeSocket();
    this.initializeMockData();
  }

  // Socket.io Integration for Live Chat
  private initializeSocket() {
    if (typeof window !== 'undefined') {
      this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001', {
        transports: ['websocket'],
        autoConnect: false,
      });

      this.socket.on('connect', () => {
        console.log('Connected to help center socket');
      });

      this.socket.on('chat_message', (message: ChatMessage) => {
        this.handleIncomingMessage(message);
      });

      this.socket.on('ticket_update', (ticket: Ticket) => {
        this.handleTicketUpdate(ticket);
      });

      this.socket.on('agent_available', (agentId: string) => {
        this.handleAgentAvailable(agentId);
      });
    }
  }

  // Live Chat Methods
  async startChatSession(
    userId?: string,
    subject: string = 'General Inquiry',
    category: string = 'general',
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<ChatSession> {
    const sessionId = this.generateSessionId();

    const session: ChatSession = {
      id: sessionId,
      userId,
      status: 'waiting',
      subject,
      category,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    this.chatSessions.set(sessionId, session);

    // Connect to socket if not connected
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }

    // Emit session start
    if (this.socket) {
      this.socket.emit('start_chat', {
        sessionId,
        userId,
        subject,
        category,
        priority,
      });
    }

    return session;
  }

  async sendChatMessage(
    sessionId: string,
    content: string,
    userId?: string,
    type: 'text' | 'image' | 'file' = 'text',
    attachments?: string[]
  ): Promise<ChatMessage> {
    const session = this.chatSessions.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const message: ChatMessage = {
      id: this.generateMessageId(),
      sessionId,
      userId,
      content,
      type,
      timestamp: new Date(),
      isFromUser: true,
      attachments,
    };

    session.messages.push(message);
    session.updatedAt = new Date();

    // Emit message to server
    if (this.socket) {
      this.socket.emit('chat_message', message);
    }

    return message;
  }

  async endChatSession(sessionId: string, rating?: number, feedback?: string): Promise<void> {
    const session = this.chatSessions.get(sessionId);
    if (!session) return;

    session.status = 'closed';
    session.updatedAt = new Date();
    if (rating !== undefined) session.rating = rating;
    if (feedback) session.feedback = feedback;

    // Emit session end
    if (this.socket) {
      this.socket.emit('end_chat', { sessionId, rating, feedback });
    }
  }

  // Ticket Management
  async createTicket(
    userId: string,
    subject: string,
    description: string,
    category: Ticket['category'],
    priority: Ticket['priority'] = 'medium',
    tags: string[] = []
  ): Promise<Ticket> {
    const ticketId = this.generateTicketId();

    const ticket: Ticket = {
      id: ticketId,
      userId,
      subject,
      description,
      category,
      priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      tags,
      attachments: [],
    };

    this.tickets.set(ticketId, ticket);

    // Emit ticket creation
    if (this.socket) {
      this.socket.emit('ticket_created', ticket);
    }

    return ticket;
  }

  async addTicketMessage(
    ticketId: string,
    userId: string,
    content: string,
    isInternal: boolean = false,
    attachments?: string[]
  ): Promise<TicketMessage> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const message: TicketMessage = {
      id: this.generateMessageId(),
      ticketId,
      userId,
      content,
      type: 'text',
      createdAt: new Date(),
      isInternal,
      attachments,
    };

    ticket.messages.push(message);
    ticket.updatedAt = new Date();

    // Emit message
    if (this.socket) {
      this.socket.emit('ticket_message', message);
    }

    return message;
  }

  async updateTicketStatus(
    ticketId: string,
    status: Ticket['status'],
    assignedTo?: string
  ): Promise<Ticket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    if (assignedTo) ticket.assignedTo = assignedTo;

    // Emit status update
    if (this.socket) {
      this.socket.emit('ticket_updated', ticket);
    }

    return ticket;
  }

  async getTickets(
    userId?: string,
    status?: Ticket['status'],
    category?: Ticket['category']
  ): Promise<Ticket[]> {
    let tickets = Array.from(this.tickets.values());

    if (userId) {
      tickets = tickets.filter(t => t.userId === userId);
    }
    if (status) {
      tickets = tickets.filter(t => t.status === status);
    }
    if (category) {
      tickets = tickets.filter(t => t.category === category);
    }

    return tickets.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // FAQ Management
  async getFAQs(category?: string, searchQuery?: string): Promise<FAQ[]> {
    let faqs = Array.from(this.faqs.values()).filter(faq => faq.isPublished);

    if (category) {
      faqs = faqs.filter(faq => faq.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      faqs = faqs.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return faqs.sort((a, b) => b.helpful - b.notHelpful - (a.helpful - a.notHelpful));
  }

  async markFAQHelpful(faqId: string, isHelpful: boolean): Promise<void> {
    const faq = this.faqs.get(faqId);
    if (!faq) return;

    if (isHelpful) {
      faq.helpful++;
    } else {
      faq.notHelpful++;
    }
  }

  async createFAQ(
    question: string,
    answer: string,
    category: string,
    tags: string[] = []
  ): Promise<FAQ> {
    const faq: FAQ = {
      id: this.generateFAQId(),
      question,
      answer,
      category,
      tags,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true,
    };

    this.faqs.set(faq.id, faq);
    return faq;
  }

  // Knowledge Base
  async getKnowledgeBaseArticles(
    category?: string,
    searchQuery?: string
  ): Promise<KnowledgeBaseArticle[]> {
    let articles = Array.from(this.knowledgeBase.values()).filter(article => article.isPublished);

    if (category) {
      articles = articles.filter(article => article.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      articles = articles.filter(
        article =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return articles.sort((a, b) => b.viewCount - a.viewCount);
  }

  async getArticle(articleId: string): Promise<KnowledgeBaseArticle | null> {
    const article = this.knowledgeBase.get(articleId);
    if (!article) return null;

    // Increment view count
    article.viewCount++;
    return article;
  }

  async markArticleHelpful(articleId: string): Promise<void> {
    const article = this.knowledgeBase.get(articleId);
    if (!article) return;

    article.helpfulCount++;
  }

  // Search and Analytics
  async searchHelpCenter(query: string): Promise<{
    faqs: FAQ[];
    articles: KnowledgeBaseArticle[];
    tickets: Ticket[];
  }> {
    const searchTerm = query.toLowerCase();

    const faqs = Array.from(this.faqs.values()).filter(
      faq =>
        faq.isPublished &&
        (faq.question.toLowerCase().includes(searchTerm) ||
          faq.answer.toLowerCase().includes(searchTerm))
    );

    const articles = Array.from(this.knowledgeBase.values()).filter(
      article =>
        article.isPublished &&
        (article.title.toLowerCase().includes(searchTerm) ||
          article.content.toLowerCase().includes(searchTerm))
    );

    const tickets = Array.from(this.tickets.values()).filter(
      ticket =>
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm)
    );

    return { faqs, articles, tickets };
  }

  // Event Handlers
  private handleIncomingMessage(message: ChatMessage): void {
    const session = this.chatSessions.get(message.sessionId);
    if (session) {
      session.messages.push(message);
      session.updatedAt = new Date();

      // Trigger UI update event
      window.dispatchEvent(new CustomEvent('chat_message_received', { detail: message }));
    }
  }

  private handleTicketUpdate(ticket: Ticket): void {
    this.tickets.set(ticket.id, ticket);

    // Trigger UI update event
    window.dispatchEvent(new CustomEvent('ticket_updated', { detail: ticket }));
  }

  private handleAgentAvailable(agentId: string): void {
    // Trigger UI update event
    window.dispatchEvent(new CustomEvent('agent_available', { detail: agentId }));
  }

  // Utility Methods
  private generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTicketId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFAQId(): string {
    return `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize Mock Data
  private initializeMockData(): void {
    // Mock FAQs
    const mockFAQs: FAQ[] = [
      {
        id: 'faq_1',
        question: 'How do I create an RFQ?',
        answer:
          'To create an RFQ, go to the RFQ section and click "Create New RFQ". Fill in the required details including title, description, category, and requirements.',
        category: 'rfq',
        tags: ['rfq', 'creation', 'buyer'],
        helpful: 45,
        notHelpful: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isPublished: true,
      },
      {
        id: 'faq_2',
        question: 'How does the payment system work?',
        answer:
          'We use secure escrow payments. Funds are held securely until the transaction is completed and both parties are satisfied.',
        category: 'payment',
        tags: ['payment', 'escrow', 'security'],
        helpful: 38,
        notHelpful: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isPublished: true,
      },
      {
        id: 'faq_3',
        question: 'How do I verify a supplier?',
        answer:
          'Suppliers are verified through our blockchain-based verification system. You can view their verification status and credentials on their profile.',
        category: 'verification',
        tags: ['supplier', 'verification', 'blockchain'],
        helpful: 52,
        notHelpful: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isPublished: true,
      },
    ];

    mockFAQs.forEach(faq => this.faqs.set(faq.id, faq));

    // Mock Knowledge Base Articles
    const mockArticles: KnowledgeBaseArticle[] = [
      {
        id: 'kb_1',
        title: 'Complete Guide to RFQ Management',
        content:
          'This comprehensive guide covers everything you need to know about creating, managing, and optimizing your RFQs for better supplier responses.',
        category: 'rfq',
        tags: ['rfq', 'guide', 'management'],
        author: 'Bell24H Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isPublished: true,
        viewCount: 1250,
        helpfulCount: 89,
        relatedArticles: ['kb_2', 'kb_3'],
      },
      {
        id: 'kb_2',
        title: 'Supplier Verification Process',
        content:
          'Learn about our multi-layered supplier verification process including blockchain verification, document validation, and performance tracking.',
        category: 'verification',
        tags: ['supplier', 'verification', 'blockchain'],
        author: 'Bell24H Team',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isPublished: true,
        viewCount: 890,
        helpfulCount: 67,
        relatedArticles: ['kb_1', 'kb_3'],
      },
    ];

    mockArticles.forEach(article => this.knowledgeBase.set(article.id, article));
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const helpCenterService = new HelpCenterService();
