import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/db';
import { createTestUser, generateToken } from '../helpers/auth';
import { createTestRFQ } from '../helpers/rfq';

describe('Escrow API Integration Tests', () => {
  let buyerToken: string;
  let supplierToken: string;
  let testRFQId: string;
  let testEscrowId: string;

  beforeAll(async () => {
    // Create test users
    const buyer = await createTestUser('buyer');
    const supplier = await createTestUser('supplier');
    
    // Generate tokens
    buyerToken = generateToken(buyer);
    supplierToken = generateToken(supplier);
    
    // Create test RFQ
    const rfq = await createTestRFQ(buyer.id);
    testRFQId = rfq.id;
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete().from('escrows').where('id', testEscrowId);
    await db.delete().from('rfqs').where('id', testRFQId);
    await db.delete().from('users').whereIn('id', ['buyer', 'supplier']);
  });

  describe('POST /api/escrow/create', () => {
    it('should create a new escrow', async () => {
      const response = await request(app)
        .post('/api/escrow/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          rfqId: testRFQId,
          amount: 1000,
          currency: 'USD'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
      testEscrowId = response.body.id;
    });

    it('should not create escrow with invalid amount', async () => {
      const response = await request(app)
        .post('/api/escrow/create')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          rfqId: testRFQId,
          amount: -1000,
          currency: 'USD'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/escrow/release', () => {
    it('should release escrow funds', async () => {
      const response = await request(app)
        .post(`/api/escrow/${testEscrowId}/release`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('released');
    });

    it('should not allow unauthorized release', async () => {
      const response = await request(app)
        .post(`/api/escrow/${testEscrowId}/release`)
        .set('Authorization', `Bearer ${supplierToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/escrow/:id', () => {
    it('should get escrow details', async () => {
      const response = await request(app)
        .get(`/api/escrow/${testEscrowId}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testEscrowId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('amount');
    });

    it('should not allow unauthorized access', async () => {
      const response = await request(app)
        .get(`/api/escrow/${testEscrowId}`)
        .set('Authorization', `Bearer ${supplierToken}`);

      expect(response.status).toBe(403);
    });
  });
});

describe('Wallet API Integration Tests', () => {
  let userToken: string;
  let testWalletId: string;

  beforeAll(async () => {
    // Create test user
    const user = await createTestUser('wallet_test');
    userToken = generateToken(user);
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete().from('wallets').where('id', testWalletId);
    await db.delete().from('users').where('id', 'wallet_test');
  });

  describe('POST /api/wallet/create', () => {
    it('should create a new wallet', async () => {
      const response = await request(app)
        .post('/api/wallet/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currency: 'USD'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.balance).toBe(0);
      testWalletId = response.body.id;
    });
  });

  describe('POST /api/wallet/deposit', () => {
    it('should deposit funds to wallet', async () => {
      const response = await request(app)
        .post(`/api/wallet/${testWalletId}/deposit`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 1000,
          currency: 'USD'
        });

      expect(response.status).toBe(200);
      expect(response.body.balance).toBe(1000);
    });
  });

  describe('POST /api/wallet/withdraw', () => {
    it('should withdraw funds from wallet', async () => {
      const response = await request(app)
        .post(`/api/wallet/${testWalletId}/withdraw`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 500,
          currency: 'USD'
        });

      expect(response.status).toBe(200);
      expect(response.body.balance).toBe(500);
    });

    it('should not allow withdrawal of insufficient funds', async () => {
      const response = await request(app)
        .post(`/api/wallet/${testWalletId}/withdraw`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          amount: 1000,
          currency: 'USD'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/wallet/:id/transactions', () => {
    it('should get wallet transactions', async () => {
      const response = await request(app)
        .get(`/api/wallet/${testWalletId}/transactions`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('amount');
    });
  });
}); 