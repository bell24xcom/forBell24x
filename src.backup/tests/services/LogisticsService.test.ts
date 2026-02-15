import { LogisticsService } from '../../services/logistics/LogisticsService';
import { Location, PackageInfo, ShippingPriorities } from '../../services/logistics/ShippingOptimizer';

describe('LogisticsService', () => {
  let logisticsService: LogisticsService;

  beforeEach(() => {
    logisticsService = new LogisticsService();
  });

  describe('getShippingRecommendation', () => {
    const mockOrigin: Location = {
      address: '123 Test St',
      city: 'New York',
      country: 'USA',
      postalCode: '10001'
    };

    const mockDestination: Location = {
      address: '456 Test Ave',
      city: 'Los Angeles',
      country: 'USA',
      postalCode: '90001'
    };

    const mockPackage: PackageInfo = {
      weight: 10,
      dimensions: {
        length: 20,
        width: 15,
        height: 10
      }
    };

    const mockPriorities: ShippingPriorities = {
      cost: 0.5,
      speed: 0.3,
      reliability: 0.2
    };

    it('should return shipping recommendations', async () => {
      const result = await logisticsService.getShippingRecommendation(
        mockOrigin,
        mockDestination,
        mockPackage,
        mockPriorities
      );

      expect(result).toBeDefined();
      expect(result.carrier).toBeDefined();
      expect(result.cost).toBeGreaterThan(0);
      expect(result.estimatedDelivery).toBeDefined();
      expect(result.reliability).toBeGreaterThanOrEqual(0);
      expect(result.reliability).toBeLessThanOrEqual(1);
    });

    it('should handle international shipping', async () => {
      const internationalDestination: Location = {
        ...mockDestination,
        country: 'Canada'
      };

      const result = await logisticsService.getShippingRecommendation(
        mockOrigin,
        internationalDestination,
        mockPackage,
        mockPriorities
      );

      expect(result).toBeDefined();
      expect(result.international).toBe(true);
      expect(result.customsRequired).toBe(true);
    });

    it('should prioritize cost when cost priority is high', async () => {
      const costPriority: ShippingPriorities = {
        cost: 0.8,
        speed: 0.1,
        reliability: 0.1
      };

      const result = await logisticsService.getShippingRecommendation(
        mockOrigin,
        mockDestination,
        mockPackage,
        costPriority
      );

      expect(result).toBeDefined();
      // Verify that the recommended option has a lower cost
      expect(result.cost).toBeLessThan(100); // Assuming 100 is a reasonable threshold
    });

    it('should prioritize speed when speed priority is high', async () => {
      const speedPriority: ShippingPriorities = {
        cost: 0.1,
        speed: 0.8,
        reliability: 0.1
      };

      const result = await logisticsService.getShippingRecommendation(
        mockOrigin,
        mockDestination,
        mockPackage,
        speedPriority
      );

      expect(result).toBeDefined();
      // Verify that the recommended option has a shorter delivery time
      const deliveryTime = new Date(result.estimatedDelivery).getTime() - new Date().getTime();
      expect(deliveryTime).toBeLessThan(3 * 24 * 60 * 60 * 1000); // Less than 3 days
    });
  });

  describe('trackShipment', () => {
    it('should return tracking information', async () => {
      const trackingNumber = 'TRK123456789';
      const result = await logisticsService.trackShipment(trackingNumber);

      expect(result).toBeDefined();
      expect(result.trackingNumber).toBe(trackingNumber);
      expect(result.status).toBeDefined();
      expect(result.events).toBeInstanceOf(Array);
      expect(result.events.length).toBeGreaterThan(0);
    });

    it('should handle invalid tracking numbers', async () => {
      const invalidTrackingNumber = 'INVALID123';
      await expect(logisticsService.trackShipment(invalidTrackingNumber)).rejects.toThrow();
    });

    it('should include location information in tracking events', async () => {
      const trackingNumber = 'TRK123456789';
      const result = await logisticsService.trackShipment(trackingNumber);

      expect(result.events[0].location).toBeDefined();
      expect(result.events[0].location.city).toBeDefined();
      expect(result.events[0].location.country).toBeDefined();
    });
  });

  describe('calculateShippingCost', () => {
    it('should calculate shipping cost correctly', async () => {
      const result = await logisticsService.calculateShippingCost(
        mockOrigin,
        mockDestination,
        mockPackage
      );

      expect(result).toBeDefined();
      expect(result.cost).toBeGreaterThan(0);
      expect(result.currency).toBe('USD');
      expect(result.breakdown).toBeDefined();
    });

    it('should handle different package weights', async () => {
      const heavyPackage: PackageInfo = {
        ...mockPackage,
        weight: 50 // 50 kg
      };

      const result = await logisticsService.calculateShippingCost(
        mockOrigin,
        mockDestination,
        heavyPackage
      );

      expect(result.cost).toBeGreaterThan(0);
      // Verify that heavier packages cost more
      expect(result.cost).toBeGreaterThan(50); // Assuming 50 is a reasonable threshold
    });

    it('should handle different package dimensions', async () => {
      const largePackage: PackageInfo = {
        ...mockPackage,
        dimensions: {
          length: 100,
          width: 100,
          height: 100
        }
      };

      const result = await logisticsService.calculateShippingCost(
        mockOrigin,
        mockDestination,
        largePackage
      );

      expect(result.cost).toBeGreaterThan(0);
      // Verify that larger packages cost more
      expect(result.cost).toBeGreaterThan(100); // Assuming 100 is a reasonable threshold
    });
  });
}); 