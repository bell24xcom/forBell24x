import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { app } from '@/server/app';
import request from 'supertest';

describe('ExplanationHistory API Integration', () => {
  let server;

  beforeEach(() => {
    server = app.listen();
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  it('should return 200 OK for explanation history', async () => {
    const response = await request(server).get('/api/explanations/history');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('should return explanations with expected structure', async () => {
    const response = await request(server).get('/api/explanations/history');
    
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    
    if (response.body.items.length > 0) {
      const item = response.body.items[0];
      
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('modelUsed');
      expect(item).toHaveProperty('explanation');
      expect(item.explanation).toHaveProperty('summary');
      expect(item.explanation).toHaveProperty('details');
    }
  });
  
  it('should filter explanations by model type', async () => {
    const response = await request(server)
      .get('/api/explanations/history')
      .query({ modelType: 'shap' });
    
    expect(response.status).toBe(200);
    
    const items = response.body.items;
    if (items.length > 0) {
      expect(items.every(item => item.modelUsed.toLowerCase() === 'shap')).toBe(true);
    }
  });
  
  it('should paginate results correctly', async () => {
    const pageSize = 5;
    const page = 2;
    
    const response = await request(server)
      .get('/api/explanations/history')
      .query({ page, pageSize });
    
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeLessThanOrEqual(pageSize);
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('currentPage', page);
    expect(response.body.pagination).toHaveProperty('pageSize', pageSize);
    expect(response.body.pagination).toHaveProperty('totalItems');
    expect(response.body.pagination).toHaveProperty('totalPages');
  });
  
  it('should return 404 for non-existent explanation', async () => {
    const response = await request(server)
      .get('/api/explanations/non-existent-id');
    
    expect(response.status).toBe(404);
  });
  
  it('should sort explanations by timestamp', async () => {
    const response = await request(server)
      .get('/api/explanations/history')
      .query({ sortBy: 'timestamp', sortOrder: 'desc' });
    
    expect(response.status).toBe(200);
    
    const items = response.body.items;
    if (items.length >= 2) {
      const firstTimestamp = new Date(items[0].timestamp).getTime();
      const secondTimestamp = new Date(items[1].timestamp).getTime();
      
      expect(firstTimestamp).toBeGreaterThanOrEqual(secondTimestamp);
    }
  });
});
