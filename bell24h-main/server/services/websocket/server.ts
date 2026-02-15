import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

// Types
import { User, JwtPayload } from '../types/auth.js';

// Import database and schema
import { db } from '../server/db.js';
import { bids, rfqs, users, buyerProfiles, suppliers } from '../db/schema.js';

// Convert ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a properly typed database instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Create a typed Drizzle instance
const dbSchema = { users, rfqs, bids };
const drizzleDb = drizzle(pool, { schema: dbSchema });

// Enhanced logging utilities for WebSocket server
function logInfo(message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Bell24H WebSocket] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logError(message: string, error: any): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [Bell24H WebSocket] ERROR: ${message}`);
  console.error(error);
}

function logWarning(message: string): void {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [Bell24H WebSocket] WARNING: ${message}`);
}

// Test database connection function
async function testDatabaseConnection(): Promise<boolean> {
  logInfo('Testing database connection...');
  
  const testPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });
  
  try {
    // Test basic connectivity
    const timeResult = await testPool.query('SELECT NOW() as time');
    logInfo(`Database connection successful at ${timeResult.rows[0].time}`);
    
    // Verify schema tables exist
    const tablesResult = await testPool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    
    if (tablesResult.rows.length > 0) {
      const tables = tablesResult.rows.map(row => row.table_name);
      logInfo(`Found ${tables.length} tables in database:`, tables);
      
      // Check for required tables
      const requiredTables = ['users', 'buyer_profiles', 'suppliers', 'rfqs', 'bids'];
      const missingTables = requiredTables.filter(table => !tables.includes(table));
      
      if (missingTables.length > 0) {
        logWarning(`Missing required tables: ${missingTables.join(', ')}`);
      } else {
        logInfo('All required tables present in database');
      }
    } else {
      logWarning('No tables found in database schema');
    }
    
    return true;
  } catch (error) {
    logError('Database connection test failed', error);
    return false;
  } finally {
    await testPool.end();
  }
}

// TypeScript interfaces for notifications and messages
interface Notification {
  type: string;
  id: string;
  title: string;
  message: string;
  timestamp: string;
  userId?: number;        // ID of user who should receive this notification (if targeted)
  rfqId?: number;         // Related RFQ ID if applicable
  bidId?: number;         // Related Bid ID if applicable
  severity?: 'info' | 'success' | 'warning' | 'error'; // Notification severity
  isRead?: boolean;       // Whether notification has been read
  category?: 'bid' | 'rfq' | 'system' | 'payment'; // Category of notification
}

// WebSocket message types
interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

// User presence tracking
interface ConnectedUser {
  userId: number;
  username: string;
  role: string;
  connectionCount: number; // Multiple tabs/devices
  lastActive: Date;
  status: 'online' | 'away' | 'offline';
  ws: Set<any>; // Store all websocket connections for this user
}

// RFQ update message
interface RfqUpdateMessage extends WebSocketMessage {
  type: 'rfq_update';
  rfqId: number;
  action: 'created' | 'updated' | 'closed' | 'deleted';
  data: any;
}

// Bid notification message
interface BidNotificationMessage extends WebSocketMessage {
  type: 'bid_notification';
  bidId: number;
  rfqId: number;
  action: 'placed' | 'updated' | 'accepted' | 'rejected';
  data: any;
}

dotenv.config();

// Load environment variables first to ensure they're available
dotenv.config();

const WS_PORT = process.env.WS_PORT || 8080;
const HTTP_PORT = process.env.HTTP_PORT || 5002;
const JWT_SECRET = Buffer.from(process.env.JWT_SECRET || 'bell24h_default_secret'); // Default for development only

// Immediately test database connection on startup
testDatabaseConnection().then(success => {
  if (!success) {
    logError('Database connection failed during startup', 'Please check your DATABASE_URL configuration');
    // Continue anyway in case it's a temporary issue
  }
});

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

logInfo(`Initializing Bell24H WebSocket server on port ${WS_PORT}`);
logInfo(`JWT auth enabled with secret length: ${JWT_SECRET.length} bytes`);
logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`)

/**
 * Validate JWT token and retrieve user information
 */
async function validateToken(token: string): Promise<{ valid: boolean; userId?: number; username?: string; role?: string }> {
  try {
    // Skip validation in development mode with special token
    if (process.env.NODE_ENV === 'development' && token === 'dev_token') {
      return { valid: true, userId: 0, username: 'dev_user', role: 'admin' };
    }

    // Verify token signature
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded || !decoded.id) {
      return { valid: false };
    }
    
    // Check if user exists in database
    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.id),
      columns: {
        id: true,
        username: true,
        role: true,
      }
    });
    
    if (!user) {
      console.error('User not found for token:', decoded.id);
      return { valid: false };
    }
    
    return { 
      valid: true, 
      userId: user.id,
      username: user.username,
      role: user.role
    };
  } catch (err) {
    console.error('Token validation error:', err);
    return { valid: false };
  }
}

// Global state
const CONNECTED_CLIENTS: Set<any> = new Set();
const RECENT_NOTIFICATIONS: Notification[] = [];
const MAX_RECENT_NOTIFICATIONS = 100;

// User presence tracking
const CONNECTED_USERS: Map<number, ConnectedUser> = new Map();
const USER_ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes for 'away' status

// Room/channel subscriptions for targeted notifications
const RFQ_SUBSCRIBERS: Map<number, Set<any>> = new Map(); // RFQ ID -> Set of websocket connections
const USER_NOTIFICATIONS: Map<number, Notification[]> = new Map(); // User ID -> Notifications

/**
 * Create and add a new notification with enhanced targeting and categorization
 */
function createNotification(title: string, message: string, options?: {
  userId?: number,
  rfqId?: number,
  bidId?: number,
  severity?: 'info' | 'success' | 'warning' | 'error',
  category?: 'bid' | 'rfq' | 'system' | 'payment'
}): Notification {
  // Create notification object with base fields and options
  const notification: Notification = {
    type: 'notification',
    id: randomUUID(),
    title,
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
    ...options,
    severity: options?.severity || 'info',
    category: options?.category || 'system'
  };

  // Add to global recent notifications if not user-specific
  if (!options?.userId) {
    RECENT_NOTIFICATIONS.unshift(notification);
    if (RECENT_NOTIFICATIONS.length > MAX_RECENT_NOTIFICATIONS) {
      RECENT_NOTIFICATIONS.pop();
    }
  } else {
    // Add to user-specific notifications
    const userNotifications = USER_NOTIFICATIONS.get(options.userId) || [];
    userNotifications.unshift(notification);
    
    // Limit per-user notifications
    if (userNotifications.length > 50) {
      userNotifications.pop();
    }
    
    USER_NOTIFICATIONS.set(options.userId, userNotifications);
  }

  console.log(`Created ${notification.category} notification: ${notification.title}`);
  return notification;
}

/**
 * Broadcast a message to all connected WebSocket clients
 */
function broadcastMessage(message: string | object) {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      try {
        client.send(messageStr);
      } catch (err) {
        console.error('Error broadcasting message to client:', err);
      }
    }
  });
}

/**
 * Broadcast a message to users with a specific role
 */
function broadcastToRole(message: string | object, targetRole: string) {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  
  // Iterate through connected users with matching role
  for (const [_, user] of CONNECTED_USERS.entries()) {
    if (user.role === targetRole) {
      // Send to all connections for this user
      user.ws.forEach(client => {
        if (client.readyState === 1) { // OPEN
          try {
            client.send(messageStr);
          } catch (err) {
            console.error(`Error sending message to ${user.username}:`, err);
          }
        }
      });
    }
  }
}

/**
 * Broadcast a message to subscribers of a specific RFQ
 */
function broadcastToRfqSubscribers(message: string | object, rfqId: number) {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  
  // Get subscribers for this RFQ
  const subscribers = RFQ_SUBSCRIBERS.get(rfqId);
  if (!subscribers || subscribers.size === 0) {
    return; // No subscribers
  }
  
  subscribers.forEach(client => {
    if (client.readyState === 1) { // OPEN
      try {
        client.send(messageStr);
      } catch (err) {
        console.error(`Error sending RFQ update for RFQ ${rfqId}:`, err);
      }
    }
  });
}

/**
 * Send notification to a specific user across all their connections
 */
function sendNotificationToUser(userId: number, notification: Notification) {
  const user = CONNECTED_USERS.get(userId);
  if (!user) return; // User not connected
  
  const messageStr = JSON.stringify(notification);
  
  user.ws.forEach(client => {
    if (client.readyState === 1) { // OPEN
      try {
        client.send(messageStr);
      } catch (err) {
        console.error(`Error sending notification to user ${userId}:`, err);
      }
    }
  });
}

/**
 * Send a message to a specific WebSocket client
 */
function sendToClient(ws: any, message: string | object) {
  const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
  
  try {
    if (ws.readyState === 1) { // OPEN
      ws.send(messageStr);
    }
  } catch (err) {
    console.error('Error sending message to client:', err);
  }
}

/**
 * Generate a demo notification for testing
 */
function generateDemoNotification(): Notification {
  const notificationTypes = [
    "New RFQ Posted", 
    "Bid Status Updated", 
    "Payment Processed", 
    "New Message Received",
    "Order Status Changed",
    "New Request for Quote",
    "Delivery Update",
    "Supplier Verification Completed"
  ];
  
  const title = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  const message = `Demo notification created at ${new Date().toLocaleTimeString()}`;
  
  return createNotification(title, message);
}

/**
 * Start the background notifier to periodically send notifications
 */
let backgroundNotifierRunning = false;
async function startBackgroundNotifier() {
  backgroundNotifierRunning = true;
  console.log('Started background notifier');
  
  while (backgroundNotifierRunning) {
    try {
      // Wait for random time between 15-45 seconds
      const sleepTime = Math.floor(Math.random() * 30000) + 15000;
      await new Promise(resolve => setTimeout(resolve, sleepTime));
      
      if (!backgroundNotifierRunning) break;
      
      // Create and broadcast a notification
      const notification = generateDemoNotification();
      broadcastMessage(notification);
      
      console.log(`Generated automatic notification: ${notification.title}`);
    } catch (err) {
      console.error('Error in background notifier:', err);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log('Background notifier stopped');
}

// Initialize Express routes for HTTP endpoints
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  next();
});

// API endpoints
app.get('/api/notification/create', (req, res) => {
  const notification = generateDemoNotification();
  broadcastMessage(notification);
  res.json(notification);
});

app.get('/api/notifications', (req, res) => {
  res.json({
    notifications: RECENT_NOTIFICATIONS,
    count: RECENT_NOTIFICATIONS.length
  });
});

/**
 * Track user presence and status
 */
function trackUserPresence(userId: number, username: string, role: string, ws: any) {
  let user = CONNECTED_USERS.get(userId);
  
  if (!user) {
    // Create new user entry
    user = {
      userId,
      username,
      role,
      connectionCount: 0,
      lastActive: new Date(),
      status: 'online',
      ws: new Set()
    };
    CONNECTED_USERS.set(userId, user);
    
    // Broadcast user presence update to admin users
    broadcastToRole({
      type: 'user_presence',
      action: 'connected',
      userId,
      username,
      status: 'online',
      timestamp: new Date().toISOString()
    }, 'admin');
  }
  
  // Add this WebSocket connection
  user.ws.add(ws);
  user.connectionCount++;
  user.lastActive = new Date();
  user.status = 'online';
  
  // Update WS with user info
  (ws as any).userId = userId;
  (ws as any).username = username;
  (ws as any).role = role;
  
  return user;
}

/**
 * Remove user connection and update presence
 */
function removeUserConnection(ws: any) {
  const userId = (ws as any).userId;
  if (!userId) return;
  
  const user = CONNECTED_USERS.get(userId);
  if (!user) return;
  
  // Remove this connection
  user.ws.delete(ws);
  user.connectionCount--;
  
  if (user.connectionCount <= 0) {
    // User is completely disconnected
    CONNECTED_USERS.delete(userId);
    
    // Broadcast user disconnection to admin users
    broadcastToRole({
      type: 'user_presence',
      action: 'disconnected',
      userId,
      username: (ws as any).username,
      status: 'offline',
      timestamp: new Date().toISOString()
    }, 'admin');
  }
}

/**
 * Subscribe a client to RFQ updates
 */
function subscribeToRfq(ws: any, rfqId: number) {
  if (!RFQ_SUBSCRIBERS.has(rfqId)) {
    RFQ_SUBSCRIBERS.set(rfqId, new Set());
  }
  
  const subscribers = RFQ_SUBSCRIBERS.get(rfqId);
  subscribers?.add(ws);
  
  console.log(`User ${(ws as any).userId} subscribed to RFQ ${rfqId}`);
}

/**
 * Unsubscribe a client from RFQ updates
 */
function unsubscribeFromRfq(ws: any, rfqId: number) {
  const subscribers = RFQ_SUBSCRIBERS.get(rfqId);
  if (subscribers) {
    subscribers.delete(ws);
    if (subscribers.size === 0) {
      RFQ_SUBSCRIBERS.delete(rfqId);
    }
  }
}

// WebSocket connection handler
wss.on('connection', async (ws, request) => {
  // Extract token from Sec-WebSocket-Protocol header or query parameter
  const token = request.headers['sec-websocket-protocol'] || 
                new URL(request.url || '', `http://${request.headers.host}`).searchParams.get('token');
  
  // Validate authentication
  if (!token) {
    console.log('WebSocket connection rejected: No authentication token provided');
    ws.close(1008, 'Unauthorized: No token provided');
    return;
  }
  
  // Validate the token asynchronously
  try {
    const authResult = await validateToken(token.toString());
    if (!authResult.valid) {
      console.log('WebSocket connection rejected: Invalid authentication token');
      ws.close(1008, 'Unauthorized: Invalid token');
      return;
    }
    
    if (!authResult.userId || !authResult.username || !authResult.role) {
      console.log('WebSocket connection rejected: Incomplete user information');
      ws.close(1008, 'Unauthorized: Invalid user information');
      return;
    }
    
    console.log(`New authenticated WebSocket connection: User ${authResult.username} (${authResult.role})`);
    
    // Track user presence
    const user = trackUserPresence(authResult.userId, authResult.username, authResult.role, ws);
    
    // Add to connected clients (for backward compatibility)
    CONNECTED_CLIENTS.add(ws);
  } catch (error) {
    console.error('Error during WebSocket authentication:', error);
    ws.close(1008, 'Error during authentication');
    return;
  }

  ws.on('message', async (message) => {
    try {
      const data: WebSocketMessage = JSON.parse(message.toString());
      console.log(`Received message from ${(ws as any).username}:`, data.type);

      // Update user's last active timestamp
      const userId = (ws as any).userId;
      const user = CONNECTED_USERS.get(userId);
      if (user) {
        user.lastActive = new Date();
        if (user.status !== 'online') {
          user.status = 'online';
          // Broadcast status change to admins
          broadcastToRole({
            type: 'user_presence',
            action: 'status_change',
            userId,
            username: user.username,
            status: 'online',
            timestamp: new Date().toISOString()
          }, 'admin');
        }
      }

      // Add enhanced logging to trace message routing
      function routeMessage(message: WebSocketMessage, sender: any) {
        logInfo(`Routing message type: ${message.type}`, message);
        // The message will be processed by the switch statement below
      }

      // Log and route the incoming message
      routeMessage(data, ws);

      // Handle different message types
      switch (data.type) {
        case 'rfq_update': {
          // Validate that this is a legitimate RFQ update
          const rfqData = data as RfqUpdateMessage;
          if (!rfqData.rfqId) {
            sendToClient(ws, { type: 'error', message: 'Missing RFQ ID', timestamp: new Date().toISOString() });
            return;
          }
          
          // Check permissions based on user role and RFQ ownership
          const userRole = (ws as any).role;
          if (userRole !== 'admin' && userRole !== 'buyer') {
            // Only admins and buyers can update RFQs
            sendToClient(ws, { type: 'error', message: 'Unauthorized to update RFQs', timestamp: new Date().toISOString() });
            return;
          }
          
          // For buyers, verify they own the RFQ using direct SQL query
          if (userRole === 'buyer') {
            // Setup a connection to the database
            const pool = new Pool({
              connectionString: process.env.DATABASE_URL,
              ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
            });

            try {
              // Query to verify ownership
              const ownershipResult = await pool.query(
                'SELECT r.id, bp.user_id FROM rfqs r JOIN buyer_profiles bp ON r.buyer_id = bp.id WHERE r.id = $1',
                [rfqData.rfqId]
              );

              if (ownershipResult.rows.length === 0) {
                sendToClient(ws, { type: 'error', message: 'RFQ not found', timestamp: new Date().toISOString() });
                return;
              }
              
              // Verify the user owns this RFQ
              if (ownershipResult.rows[0].user_id !== userId) {
                sendToClient(ws, { type: 'error', message: 'You can only update your own RFQs', timestamp: new Date().toISOString() });
                return;
              }
            } catch (error) {
              console.error('Error verifying RFQ ownership:', error);
              sendToClient(ws, { type: 'error', message: 'Database error', timestamp: new Date().toISOString() });
              return;
            } finally {
              await pool.end();
            }
          }
          
          // Send RFQ update to all subscribers
          broadcastToRfqSubscribers({
            type: 'rfq_update',
            rfqId: rfqData.rfqId,
            action: rfqData.action,
            data: rfqData.data,
            timestamp: new Date().toISOString(),
            updatedBy: (ws as any).username
          }, rfqData.rfqId);
          
          // Create notification for all subscribers
          const notification = createNotification(
            `RFQ ${rfqData.rfqId} ${rfqData.action}`,
            `RFQ has been ${rfqData.action} by ${(ws as any).username}`,
            {
              rfqId: rfqData.rfqId,
              category: 'rfq',
              severity: 'info'
            }
          );
          
          broadcastToRfqSubscribers(notification, rfqData.rfqId);
          break;
        }

        case 'bid_notification': {
          // Process bid notifications securely
          const bidData = data as BidNotificationMessage;
          if (!bidData.bidId || !bidData.rfqId) {
            sendToClient(ws, { type: 'error', message: 'Missing bid details', timestamp: new Date().toISOString() });
            return;
          }
          
          // Verify the user is authorized to send bid notifications
          const userRole = (ws as any).role;
          if (userRole !== 'admin' && userRole !== 'supplier') {
            sendToClient(ws, { type: 'error', message: 'Unauthorized to send bid notifications', timestamp: new Date().toISOString() });
            return;
          }
          
          // For suppliers, verify they own the bid using direct SQL
          if (userRole === 'supplier') {
            // Use a more specific variable name to avoid conflicts
            const bidDbPool = new Pool({
              connectionString: process.env.DATABASE_URL,
              ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
            });
            
            try {
              // Query to verify bid ownership
              const bidResult = await bidDbPool.query(
                'SELECT b.*, s.user_id FROM bids b JOIN suppliers s ON b.supplier_id = s.id WHERE b.id = $1',
                [bidData.bidId]
              );
              
              if (bidResult.rows.length === 0) {
                sendToClient(ws, { type: 'error', message: 'Bid not found', timestamp: new Date().toISOString() });
                return;
              }
              
              // Type-safe check of user ownership
              if (bidResult.rows[0].user_id !== userId) {
                sendToClient(ws, { type: 'error', message: 'You can only notify about your own bids', timestamp: new Date().toISOString() });
                return;
              }
            } catch (error) {
              console.error('Error verifying bid ownership:', error);
              sendToClient(ws, { type: 'error', message: 'Database error', timestamp: new Date().toISOString() });
              return;
            } finally {
              await bidDbPool.end();
            }
          }
          
          // Find the RFQ owner to send them the notification
          // Use regular database client for direct query to avoid Drizzle ORM typing issues
          const rfqOwnerPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
          });

          try {
            // Find the RFQ and get the buyer's user ID in one query
            const rfqResult = await rfqOwnerPool.query(
              'SELECT r.*, b.user_id as buyer_user_id FROM rfqs r JOIN buyer_profiles b ON r.buyer_id = b.id WHERE r.id = $1',
              [bidData.rfqId]
            );
            
            if (rfqResult.rows.length === 0) {
              sendToClient(ws, { type: 'error', message: 'RFQ not found', timestamp: new Date().toISOString() });
              return;
            }
            
            // Get the buyer user ID from the joined query result
            const buyerUserId = rfqResult.rows[0].buyer_user_id;
            
            // Create notification for RFQ owner
            const bidNotification = createNotification(
              `New bid ${bidData.action}`,
              `A bid has been ${bidData.action} for your RFQ #${bidData.rfqId}`,
              {
                userId: buyerUserId,
                rfqId: bidData.rfqId,
                bidId: bidData.bidId,
                category: 'bid',
                severity: 'info'
              }
            );
            
            // Send notification to the RFQ owner
            sendNotificationToUser(buyerUserId, bidNotification);
            
            // Confirm successful notification
            sendToClient(ws, {
              type: 'success',
              message: `Notification sent for bid on RFQ #${bidData.rfqId}`,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Error processing bid notification:', error);
            sendToClient(ws, { type: 'error', message: 'Failed to process bid notification', timestamp: new Date().toISOString() });
          } finally {
            await rfqOwnerPool.end();
          }
          
          // Confirm to the bid sender
          sendToClient(ws, {
            type: 'bid_notification_sent',
            bidId: bidData.bidId,
            rfqId: bidData.rfqId,
            timestamp: new Date().toISOString()
          });
          break;
        }
          
        case 'subscribe_rfq': {
          // Subscribe to real-time updates for an RFQ
          const rfqId = data.rfqId;
          if (!rfqId) {
            sendToClient(ws, { type: 'error', message: 'Missing RFQ ID', timestamp: new Date().toISOString() });
            return;
          }
          
          subscribeToRfq(ws, rfqId);
          sendToClient(ws, {
            type: 'subscribed',
            rfqId,
            timestamp: new Date().toISOString()
          });
          break;
        }
        
        case 'unsubscribe_rfq': {
          // Unsubscribe from real-time updates for an RFQ
          const rfqId = data.rfqId;
          if (!rfqId) {
            sendToClient(ws, { type: 'error', message: 'Missing RFQ ID', timestamp: new Date().toISOString() });
            return;
          }
          
          unsubscribeFromRfq(ws, rfqId);
          sendToClient(ws, {
            type: 'unsubscribed',
            rfqId,
            timestamp: new Date().toISOString()
          });
          break;
        }
        
        case 'mark_notification_read': {
          // Mark a notification as read
          const notificationId = data.notificationId;
          if (!notificationId) {
            sendToClient(ws, { type: 'error', message: 'Missing notification ID', timestamp: new Date().toISOString() });
            return;
          }
          
          // Update user's notifications
          const userNotifications = USER_NOTIFICATIONS.get(userId) || [];
          const notification = userNotifications.find(n => n.id === notificationId);
          if (notification) {
            notification.isRead = true;
            USER_NOTIFICATIONS.set(userId, userNotifications);
            
            sendToClient(ws, {
              type: 'notification_updated',
              notificationId,
              status: 'read',
              timestamp: new Date().toISOString()
            });
          }
          break;
        }
          
        case 'subscribe': {
          // Generic channel subscription handler
          const channel = data.channel;
          if (!channel) {
            sendToClient(ws, { type: 'error', message: 'Missing channel name', timestamp: new Date().toISOString() });
            return;
          }
          
          logInfo(`User ${userId} subscribing to channel: ${channel}`);
          
          // Add this channel to client subscriptions if not already tracked on the client object
          if (!(ws as any).subscriptions) {
            (ws as any).subscriptions = new Set();
          }
          
          // Add the subscription
          (ws as any).subscriptions.add(channel);
          
          // Handle special channel types
          if (channel.startsWith('rfq:')) {
            // RFQ-specific channel, extract the RFQ ID
            const rfqId = parseInt(channel.split(':')[1], 10);
            if (!isNaN(rfqId)) {
              subscribeToRfq(ws, rfqId);
            }
          } else if (channel === 'rfq-updates') {
            // Subscribe to all RFQ updates
            if (!(ws as any).globalSubscriptions) {
              (ws as any).globalSubscriptions = new Set();
            }
            (ws as any).globalSubscriptions.add('rfq-updates');
            logInfo(`User ${userId} subscribed to all RFQ updates`);
          }
          
          // Send subscription confirmation
          sendToClient(ws, {
            type: 'subscription-success',
            channel: channel,
            timestamp: new Date().toISOString()
          });
          break;
        }
        
        case 'get_user_notifications': {
          // Retrieve all notifications for the user
          const userNotifications = USER_NOTIFICATIONS.get(userId) || [];
          sendToClient(ws, {
            type: 'user_notifications',
            notifications: userNotifications,
            count: userNotifications.length,
            timestamp: new Date().toISOString()
          });
          break;
        }
          
        case 'presence_update': {
          // Update user's presence status (away/online)
          const status = data.status;
          if (!status || !['online', 'away'].includes(status)) {
            sendToClient(ws, { type: 'error', message: 'Invalid status', timestamp: new Date().toISOString() });
            return;
          }
          
          const user = CONNECTED_USERS.get(userId);
          if (user) {
            user.status = status;
            user.lastActive = new Date();
            
            // Broadcast status change to admins
            broadcastToRole({
              type: 'user_presence',
              action: 'status_change',
              userId,
              username: user.username,
              status,
              timestamp: new Date().toISOString()
            }, 'admin');
            
            sendToClient(ws, {
              type: 'presence_updated',
              status,
              timestamp: new Date().toISOString()
            });
          }
          break;
        }
          
        case 'get_active_users': {
          // Only admins can see all active users
          if ((ws as any).role !== 'admin') {
            sendToClient(ws, { type: 'error', message: 'Unauthorized', timestamp: new Date().toISOString() });
            return;
          }
          
          // Send list of all active users
          const activeUsers = Array.from(CONNECTED_USERS.values()).map(user => ({
            userId: user.userId,
            username: user.username,
            role: user.role,
            status: user.status,
            connectionCount: user.connectionCount,
            lastActive: user.lastActive.toISOString()
          }));
          
          sendToClient(ws, {
            type: 'active_users',
            users: activeUsers,
            count: activeUsers.length,
            timestamp: new Date().toISOString()
          });
          break;
        }
          
        case 'ping':
          // Respond with pong to keep connection alive
          sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
          break;

        default:
          // Echo the message back by default
          sendToClient(ws, {
            type: 'echo',
            message: data,
            timestamp: new Date().toISOString()
          });
          console.log('Unknown message type, echoing back:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      sendToClient(ws, { type: 'error', message: 'Failed to process message', timestamp: new Date().toISOString() });
    }
  });

  ws.on('close', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected: ${(ws as any).username || 'unknown'}`);
    
    // Clean up user tracking
    removeUserConnection(ws);
    
    // Clean up RFQ subscriptions
    RFQ_SUBSCRIBERS.forEach((subscribers, rfqId) => {
      if (subscribers.has(ws)) {
        subscribers.delete(ws);
        if (subscribers.size === 0) {
          RFQ_SUBSCRIBERS.delete(rfqId);
        }
      }
    });
    
    // Remove from general client list (backward compatibility)
    CONNECTED_CLIENTS.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${(ws as any).username || 'unknown'}:`, error);
    removeUserConnection(ws);
    CONNECTED_CLIENTS.delete(ws);
  });

  // Send initial connection success message with recent notifications
  sendToClient(ws, {
    type: 'connection_established',
    message: 'Successfully connected to Bell24H WebSocket server',
    timestamp: new Date().toISOString(),
    recentNotifications: RECENT_NOTIFICATIONS.slice(0, 5) // Send 5 most recent notifications
  });
});

// ... existing code ...

// Start the background notifier
startBackgroundNotifier();
if (HTTP_PORT !== WS_PORT) {
  const httpApp = express();
  
  // Apply same middleware and routes
  httpApp.use(express.json());
  httpApp.use(express.static(path.join(__dirname, '..', '..', 'public')));
  
  // CORS middleware
  httpApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
    next();
  });
  
  // API endpoints
  httpApp.get('/api/notification/create', (req, res) => {
    const notification = generateDemoNotification();
    broadcastMessage(notification);
    res.json(notification);
  });
  
  httpApp.get('/api/notifications', (req, res) => {
    res.json({
      notifications: RECENT_NOTIFICATIONS,
      count: RECENT_NOTIFICATIONS.length
    });
  });
  
  httpApp.listen(HTTP_PORT, () => {
    console.log(`HTTP API server running on port ${HTTP_PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backgroundNotifierRunning = false;
  
  // Close all WebSocket connections
  wss.clients.forEach(client => {
    try {
      client.terminate();
    } catch (err) {}
  });
  
  // Close the servers
  server.close(() => {
    console.log('Servers closed, exiting process');
    process.exit(0);
  });
});
