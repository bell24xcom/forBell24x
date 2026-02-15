import { RFQService } from '../../services/rfq/RFQService';
import { RFQ, RFQStatus } from '../../types/rfq';

describe('RFQService', () => {
  let rfqService: RFQService;

  beforeEach(() => {
    rfqService = new RFQService();
  });

  describe('createRFQ', () => {
    it('should create a new RFQ successfully', async () => {
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        budget: 1000,
      };

      const result = await rfqService.createRFQ(rfqData);

      expect(result).toBeDefined();
      expect(result.title).toBe(rfqData.title);
      expect(result.status).toBe(RFQStatus.DRAFT);
      expect(result.id).toBeDefined();
    });

    it('should throw error for invalid RFQ data', async () => {
      const invalidData = {
        title: '', // Empty title
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        budget: -1000, // Negative budget
      };

      await expect(rfqService.createRFQ(invalidData)).rejects.toThrow();
    });
  });

  describe('getRFQ', () => {
    it('should retrieve an RFQ by ID', async () => {
      // First create an RFQ
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        budget: 1000,
      };
      const createdRFQ = await rfqService.createRFQ(rfqData);

      // Then retrieve it
      const retrievedRFQ = await rfqService.getRFQ(createdRFQ.id);

      expect(retrievedRFQ).toBeDefined();
      expect(retrievedRFQ.id).toBe(createdRFQ.id);
      expect(retrievedRFQ.title).toBe(rfqData.title);
    });

    it('should throw error for non-existent RFQ', async () => {
      await expect(rfqService.getRFQ('non-existent-id')).rejects.toThrow();
    });
  });

  describe('updateRFQ', () => {
    it('should update an RFQ successfully', async () => {
      // First create an RFQ
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        budget: 1000,
      };
      const createdRFQ = await rfqService.createRFQ(rfqData);

      // Update the RFQ
      const updateData = {
        title: 'Updated RFQ',
        description: 'Updated Description',
      };
      const updatedRFQ = await rfqService.updateRFQ(createdRFQ.id, updateData);

      expect(updatedRFQ.title).toBe(updateData.title);
      expect(updatedRFQ.description).toBe(updateData.description);
      expect(updatedRFQ.budget).toBe(rfqData.budget); // Unchanged
    });

    it('should throw error when updating non-existent RFQ', async () => {
      const updateData = {
        title: 'Updated RFQ',
      };

      await expect(rfqService.updateRFQ('non-existent-id', updateData)).rejects.toThrow();
    });
  });

  describe('listRFQs', () => {
    it('should list RFQs with pagination', async () => {
      // Create multiple RFQs
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        budget: 1000,
      };
      await rfqService.createRFQ(rfqData);
      await rfqService.createRFQ(rfqData);
      await rfqService.createRFQ(rfqData);

      const result = await rfqService.listRFQs({ page: 1, limit: 2 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBeGreaterThanOrEqual(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('should filter RFQs by status', async () => {
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        budget: 1000,
      };
      await rfqService.createRFQ(rfqData);

      const result = await rfqService.listRFQs({ 
        page: 1, 
        limit: 10,
        status: RFQStatus.DRAFT 
      });

      expect(result.items.every(rfq => rfq.status === RFQStatus.DRAFT)).toBe(true);
    });
  });

  describe('deleteRFQ', () => {
    it('should delete an RFQ successfully', async () => {
      // First create an RFQ
      const rfqData = {
        title: 'Test RFQ',
        description: 'Test Description',
        deadline: new Date('2024-12-31'),
        budget: 1000,
      };
      const createdRFQ = await rfqService.createRFQ(rfqData);

      // Delete the RFQ
      await rfqService.deleteRFQ(createdRFQ.id);

      // Verify it's deleted
      await expect(rfqService.getRFQ(createdRFQ.id)).rejects.toThrow();
    });

    it('should throw error when deleting non-existent RFQ', async () => {
      await expect(rfqService.deleteRFQ('non-existent-id')).rejects.toThrow();
    });
  });
}); 