import { setupServer } from 'msw/node';
import { rest } from 'msw';

// API endpoint handlers
export const handlers = [
  // Authentication endpoints
  rest.get('/api/auth/session', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      })
    );
  }),

  rest.get('/api/auth/providers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        credentials: {
          id: 'credentials',
          name: 'Credentials',
          type: 'credentials',
        },
      })
    );
  }),

  rest.get('/api/auth/csrf', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        csrfToken: 'test-csrf-token',
      })
    );
  }),

  // RFQ endpoints
  rest.post('/api/rfq', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'test-rfq-id',
        status: 'created',
        title: 'Test RFQ',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  rest.get('/api/rfq', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        rfqs: [
          {
            id: 'test-rfq-1',
            title: 'Test RFQ 1',
            status: 'active',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      })
    );
  }),

  rest.get('/api/rfq/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        title: `Test RFQ ${id}`,
        description: 'Test RFQ description',
        status: 'active',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // Video RFQ endpoints
  rest.post('/api/video-rfq', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'test-video-rfq-id',
        status: 'created',
        videoUrl: 'mock-video-url',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  rest.get('/api/video-rfq', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        videoRFQs: [
          {
            id: 'test-video-rfq-1',
            title: 'Test Video RFQ',
            videoUrl: 'mock-video-url',
            status: 'active',
          },
        ],
        total: 1,
      })
    );
  }),

  // Voice RFQ endpoints
  rest.post('/api/voice-rfq', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'test-voice-rfq-id',
        status: 'created',
        audioUrl: 'mock-audio-url',
        transcript: 'Test transcript',
        createdAt: new Date().toISOString(),
      })
    );
  }),

  // File upload endpoints
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        url: 'mock-upload-url',
        filename: 'test-file.txt',
      })
    );
  }),

  // AI/Analytics endpoints
  rest.post('/api/ai/recommendations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        recommendations: [
          {
            id: 'rec-1',
            title: 'Test Recommendation',
            confidence: 0.95,
          },
        ],
      })
    );
  }),

  rest.post('/api/ai/acceptance', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        accepted: true,
        reason: 'Test acceptance',
      })
    );
  }),

  // Dashboard/Analytics endpoints
  rest.get('/api/dashboard/stats', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        totalRFQs: 24,
        activeOrders: 8,
        walletBalance: 250000,
        supplierRating: 4.5,
      })
    );
  }),

  // Supplier endpoints
  rest.get('/api/suppliers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        suppliers: [
          {
            id: 'supplier-1',
            name: 'Test Supplier',
            rating: 4.8,
            category: 'Electronics',
          },
        ],
        total: 1,
      })
    );
  }),

  // Blockchain/Wallet endpoints
  rest.get('/api/blockchain/wallet', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        address: 'test-wallet-address',
        balance: '1000000000000000000', // 1 ETH in wei
        network: 'sepolia',
      })
    );
  }),

  // Generic test endpoint
  rest.get('/api/test', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Test API response',
        timestamp: new Date().toISOString(),
      })
    );
  }),

  // Catch-all handler for unhandled requests
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url.href}`);
    return res(
      ctx.status(404),
      ctx.json({
        error: 'Not Found',
        message: `No handler found for ${req.method} ${req.url.pathname}`,
      })
    );
  }),
];

// Create and export the server
export const server = setupServer(...handlers);
