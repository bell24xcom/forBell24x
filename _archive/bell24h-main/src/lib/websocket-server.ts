import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  companyId?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  rfqId?: string;
  message: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  read: boolean;
}

interface ChatRoom {
  id: string;
  participants: string[];
  rfqId?: string;
  lastMessage?: ChatMessage;
  unreadCount: { [userId: string]: number };
}

class WebSocketService {
  private io: SocketIOServer;
  private chatRooms: Map<string, ChatRoom> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/socket.io'
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Get user details from database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { company: true }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        socket.companyId = user.companyId || undefined;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user socket mapping
      if (socket.userId) {
        this.userSockets.set(socket.userId, socket.id);
      }

      // Join user to their personal room
      socket.join(`user:${socket.userId}`);

      // Handle joining chat rooms
      socket.on('join_room', async (data: { rfqId: string, otherUserId: string }) => {
        await this.handleJoinRoom(socket, data);
      });

      // Handle leaving chat rooms
      socket.on('leave_room', (data: { rfqId: string }) => {
        socket.leave(`rfq:${data.rfqId}`);
      });

      // Handle sending messages
      socket.on('send_message', async (data: {
        receiverId: string;
        rfqId?: string;
        message: string;
        type?: 'text' | 'image' | 'file';
      }) => {
        await this.handleSendMessage(socket, data);
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { rfqId: string, receiverId: string }) => {
        socket.to(`user:${data.receiverId}`).emit('typing_start', {
          senderId: socket.userId,
          rfqId: data.rfqId
        });
      });

      socket.on('typing_stop', (data: { rfqId: string, receiverId: string }) => {
        socket.to(`user:${data.receiverId}`).emit('typing_stop', {
          senderId: socket.userId,
          rfqId: data.rfqId
        });
      });

      // Handle message read status
      socket.on('mark_read', async (data: { messageId: string }) => {
        await this.handleMarkRead(socket, data);
      });

      // Handle getting chat history
      socket.on('get_chat_history', async (data: { rfqId: string, otherUserId: string, page?: number }) => {
        await this.handleGetChatHistory(socket, data);
      });

      // Handle getting unread count
      socket.on('get_unread_count', async (data: { rfqId?: string }) => {
        await this.handleGetUnreadCount(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
        }
      });
    });
  }

  private async handleJoinRoom(socket: AuthenticatedSocket, data: { rfqId: string, otherUserId: string }) {
    const roomId = `rfq:${data.rfqId}`;
    
    // Verify user has access to this RFQ
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id: data.rfqId,
        OR: [
          { buyerId: socket.userId },
          { quotes: { some: { supplierId: socket.userId } } }
        ]
      }
    });

    if (!rfq) {
      socket.emit('error', { message: 'Access denied to this RFQ' });
      return;
    }

    // Join the room
    socket.join(roomId);
    
    // Create or update chat room
    const chatRoomId = `${data.rfqId}-${[socket.userId, data.otherUserId].sort().join('-')}`;
    if (!this.chatRooms.has(chatRoomId)) {
      this.chatRooms.set(chatRoomId, {
        id: chatRoomId,
        participants: [socket.userId!, data.otherUserId],
        rfqId: data.rfqId,
        unreadCount: { [socket.userId!]: 0, [data.otherUserId]: 0 }
      });
    }

    socket.emit('room_joined', { roomId, chatRoomId });
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: {
    receiverId: string;
    rfqId?: string;
    message: string;
    type?: 'text' | 'image' | 'file';
  }) {
    try {
      // Save message to database
      const message = await prisma.chatMessage.create({
        data: {
          senderId: socket.userId!,
          receiverId: data.receiverId,
          rfqId: data.rfqId,
          message: data.message,
          type: data.type || 'text',
          read: false
        }
      });

      // Emit to sender
      socket.emit('message_sent', {
        id: message.id,
        message: data.message,
        timestamp: message.createdAt,
        status: 'sent'
      });

      // Emit to receiver
      const receiverSocketId = this.userSockets.get(data.receiverId);
      if (receiverSocketId) {
        this.io.to(receiverSocketId).emit('new_message', {
          id: message.id,
          senderId: socket.userId,
          message: data.message,
          type: data.type || 'text',
          timestamp: message.createdAt,
          rfqId: data.rfqId
        });
      }

      // Update chat room
      if (data.rfqId) {
        const chatRoomId = `${data.rfqId}-${[socket.userId!, data.receiverId].sort().join('-')}`;
        const room = this.chatRooms.get(chatRoomId);
        if (room) {
          room.lastMessage = {
            id: message.id,
            senderId: socket.userId!,
            receiverId: data.receiverId,
            rfqId: data.rfqId,
            message: data.message,
            type: data.type || 'text',
            timestamp: message.createdAt,
            read: false
          };
          room.unreadCount[data.receiverId] = (room.unreadCount[data.receiverId] || 0) + 1;
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private async handleMarkRead(socket: AuthenticatedSocket, data: { messageId: string }) {
    try {
      await prisma.chatMessage.update({
        where: { id: data.messageId },
        data: { read: true }
      });

      socket.emit('message_read', { messageId: data.messageId });
    } catch (error) {
      console.error('Error marking message as read:', error);
      socket.emit('error', { message: 'Failed to mark message as read' });
    }
  }

  private async handleGetChatHistory(socket: AuthenticatedSocket, data: {
    rfqId: string;
    otherUserId: string;
    page?: number;
  }) {
    try {
      const page = data.page || 1;
      const limit = 50;
      const skip = (page - 1) * limit;

      const messages = await prisma.chatMessage.findMany({
        where: {
          rfqId: data.rfqId,
          OR: [
            { senderId: socket.userId, receiverId: data.otherUserId },
            { senderId: data.otherUserId, receiverId: socket.userId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      });

      socket.emit('chat_history', {
        messages: messages.reverse(),
        page,
        hasMore: messages.length === limit
      });
    } catch (error) {
      console.error('Error getting chat history:', error);
      socket.emit('error', { message: 'Failed to get chat history' });
    }
  }

  private async handleGetUnreadCount(socket: AuthenticatedSocket, data: { rfqId?: string }) {
    try {
      const where: any = {
        receiverId: socket.userId,
        read: false
      };

      if (data.rfqId) {
        where.rfqId = data.rfqId;
      }

      const unreadCount = await prisma.chatMessage.count({ where });

      socket.emit('unread_count', { count: unreadCount });
    } catch (error) {
      console.error('Error getting unread count:', error);
      socket.emit('error', { message: 'Failed to get unread count' });
    }
  }

  // Public methods for external use
  public async notifyRFQUpdate(rfqId: string, update: any) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { quotes: { include: { supplier: true } } }
    });

    if (!rfq) return;

    // Notify buyer
    const buyerSocketId = this.userSockets.get(rfq.buyerId);
    if (buyerSocketId) {
      this.io.to(buyerSocketId).emit('rfq_update', { rfqId, update });
    }

    // Notify suppliers who quoted
    for (const quote of rfq.quotes) {
      const supplierSocketId = this.userSockets.get(quote.supplierId);
      if (supplierSocketId) {
        this.io.to(supplierSocketId).emit('rfq_update', { rfqId, update });
      }
    }
  }

  public async notifyNewQuote(rfqId: string, quote: any) {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId }
    });

    if (!rfq) return;

    // Notify buyer
    const buyerSocketId = this.userSockets.get(rfq.buyerId);
    if (buyerSocketId) {
      this.io.to(buyerSocketId).emit('new_quote', { rfqId, quote });
    }
  }

  public getIO() {
    return this.io;
  }
}

export default WebSocketService;
