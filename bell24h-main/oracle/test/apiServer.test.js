const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const pauseService = require('../src/services/pauseService');
const { createApiServer } = require('../src/services/apiServer');

describe('API Server', () => {
  let app;
  let server;
  let mockTaskQueue;
  let mockConfig;
  const API_KEY = 'test-api-key';
  
  beforeEach(async () => {
    // Reset the pause service state
    pauseService._resetForTest();
    
    // Initialize pause service with mocks
    const mockContract = {
      paused: sinon.stub().resolves(false),
      pause: sinon.stub().resolves({
        wait: sinon.stub().resolves({})
      }),
      unpause: sinon.stub().resolves({
        wait: sinon.stub().resolves({})
      }),
      hasRole: sinon.stub().resolves(true),
      PAUSER_ROLE: sinon.stub().resolves('0x123456')
    };
    
    const mockSigner = {
      getAddress: sinon.stub().resolves('0x1234567890123456789012345678901234567890')
    };
    
    mockContract.on = sinon.stub();
    await pauseService.initialize(mockContract, mockSigner);
    
    // Mock task queue service
    mockTaskQueue = {
      getTasksInQueue: sinon.stub().returns([]),
      getProcessingTasks: sinon.stub().returns([]),
      getFailedTasks: sinon.stub().returns([])
    };
    
    // Mock config
    mockConfig = {
      apiKey: API_KEY,
      apiPort: 3001
    };
    
    // Create express app with our API server
    const { app: expressApp, server: httpServer } = createApiServer(
      mockConfig,
      pauseService,
      mockTaskQueue
    );
    
    app = expressApp;
    server = httpServer;
  });
  
  afterEach(() => {
    if (server) {
      server.close();
    }
    sinon.restore();
  });
  
  describe('Public Endpoints', () => {
    it('GET /health should return 200 and include pause status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'OK');
      expect(res.body).to.have.property('paused', false);
    });
    
    it('GET /health should reflect paused state', async () => {
      // Pause the service
      await pauseService.pause('Testing API', 'test');
      
      const res = await request(app).get('/health');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'OK');
      expect(res.body).to.have.property('paused', true);
    });
    
    it('GET / should return API information', async () => {
      const res = await request(app).get('/');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('name', 'Bell24H Oracle API');
      expect(res.body).to.have.property('version');
    });
  });
  
  describe('Authenticated Endpoints', () => {
    it('GET /status should require API key', async () => {
      const res = await request(app).get('/status');
      expect(res.status).to.equal(401);
    });
    
    it('GET /status should return detailed pause status with valid API key', async () => {
      // First pause to have some interesting data
      await pauseService.pause('Testing API status', 'api-test');
      
      const res = await request(app)
        .get('/status')
        .set('X-API-Key', API_KEY);
        
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('paused', true);
      expect(res.body).to.have.property('pauseStatus');
      expect(res.body.pauseStatus).to.have.property('paused', true);
      expect(res.body.pauseStatus).to.have.property('reason', 'Testing API status');
      expect(res.body.pauseStatus).to.have.property('source', 'api-test');
      expect(res.body.pauseStatus).to.have.property('timestamp');
    });
    
    it('POST /pause should require API key', async () => {
      const res = await request(app)
        .post('/pause')
        .send({ reason: 'Testing unauthorized' });
      
      expect(res.status).to.equal(401);
      expect(pauseService.isPausedState()).to.be.false;
    });
    
    it('POST /pause should pause the service with valid API key', async () => {
      const pauseReason = 'API test pause';
      
      const res = await request(app)
        .post('/pause')
        .set('X-API-Key', API_KEY)
        .send({ reason: pauseReason });
        
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('paused', true);
      expect(res.body).to.have.property('reason', pauseReason);
      expect(pauseService.isPausedState()).to.be.true;
      
      const pauseStatus = pauseService.getPauseStatus();
      expect(pauseStatus.reason).to.equal(pauseReason);
      expect(pauseStatus.source).to.equal('api');
    });
    
    it('POST /unpause should require API key', async () => {
      // First pause
      await pauseService.pause('Initial pause', 'test');
      
      const res = await request(app)
        .post('/unpause')
        .send({ reason: 'Testing unauthorized' });
      
      expect(res.status).to.equal(401);
      expect(pauseService.isPausedState()).to.be.true;
    });
    
    it('POST /unpause should unpause the service with valid API key', async () => {
      // First pause
      await pauseService.pause('Initial pause', 'test');
      
      const unpauseReason = 'API test unpause';
      
      const res = await request(app)
        .post('/unpause')
        .set('X-API-Key', API_KEY)
        .send({ reason: unpauseReason });
        
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('paused', false);
      expect(res.body).to.have.property('reason', unpauseReason);
      expect(pauseService.isPausedState()).to.be.false;
    });
    
    it('GET /admin/active-tasks should require API key', async () => {
      const res = await request(app).get('/admin/active-tasks');
      expect(res.status).to.equal(401);
    });
    
    it('GET /admin/active-tasks should return task status with valid API key', async () => {
      mockTaskQueue.getTasksInQueue.returns([{ id: 1, type: 'gst-verification' }]);
      mockTaskQueue.getProcessingTasks.returns([{ id: 2, type: 'delivery-tracking' }]);
      
      const res = await request(app)
        .get('/admin/active-tasks')
        .set('X-API-Key', API_KEY);
        
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('queued').with.lengthOf(1);
      expect(res.body).to.have.property('processing').with.lengthOf(1);
      expect(res.body).to.have.property('failed').with.lengthOf(0);
    });
  });
  
  describe('API Server State', () => {
    it('should reflect pause state changes', async () => {
      // Initial state - unpaused
      let res = await request(app).get('/health');
      expect(res.body.paused).to.be.false;
      
      // Pause the service
      await pauseService.pause('API state test', 'test');
      
      // Check updated state
      res = await request(app).get('/health');
      expect(res.body.paused).to.be.true;
      
      // Unpause the service
      await pauseService.unpause('API state test', 'test');
      
      // Check updated state again
      res = await request(app).get('/health');
      expect(res.body.paused).to.be.false;
    });
  });
});
