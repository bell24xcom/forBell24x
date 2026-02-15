import { LogisticsService } from '../../services/logistics/LogisticsService';
import { Location, PackageInfo, ShippingPriorities, Route, InternationalShipment } from '../../services/logistics/ShippingOptimizer';
import { TrackingInfo } from '../../services/logistics/TrackingService';

describe('LogisticsService', () => {
  let logisticsService: LogisticsService;

  beforeEach(() => {
    logisticsService = new LogisticsService();
  });

  describe('getShippingRecommendation', () => {
    const origin: Location = {
      address: '123 Main St',
      city: 'New York',
      country: 'USA',
      postalCode: '10001'
    };

    const destination: Location = {
      address: '456 Market St',
      city: 'San Francisco',
      country: 'USA',
      postalCode: '94105'
    };

    const packageDetails: PackageInfo = {
      weight: 10,
      dimensions: {
        length: 10,
        width: 10,
        height: 10
      },
      fragile: false
    };

    const priorities: ShippingPriorities = {
      cost: 0.5,
      speed: 0.3,
      reliability: 0.2
    };

    it('should return a valid shipping recommendation', async () => {
      const recommendation = await logisticsService.getShippingRecommendation(
        origin,
        destination,
        packageDetails,
        priorities
      );

      expect(recommendation).toBeDefined();
      expect(recommendation.carrier).toBeDefined();
      expect(recommendation.cost).toBeGreaterThan(0);
      expect(recommendation.estimatedDeliveryTime).toBeDefined();
      expect(recommendation.reliability).toBeGreaterThan(0);
      expect(recommendation.reliability).toBeLessThanOrEqual(1);
    });

    it('should handle invalid package details', async () => {
      const invalidPackage: PackageInfo = {
        weight: -1,
        dimensions: {
          length: 0,
          width: 0,
          height: 0
        },
        fragile: false
      };

      await expect(
        logisticsService.getShippingRecommendation(
          origin,
          destination,
          invalidPackage,
          priorities
        )
      ).rejects.toThrow();
    });
  });

  describe('predictDeliveryTime', () => {
    const carrier = 'DHL';
    const route: Route = {
      origin: {
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001'
      },
      destination: {
        address: '456 Market St',
        city: 'San Francisco',
        country: 'USA',
        postalCode: '94105'
      }
    };
    const historical_data = [];

    it('should return a valid delivery prediction', async () => {
      const prediction = await logisticsService.predictDeliveryTime(
        carrier,
        route,
        historical_data
      );

      expect(prediction).toBeDefined();
      expect(prediction.estimatedDeliveryTime).toBeDefined();
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle invalid carrier', async () => {
      const invalidCarrier = 'InvalidCarrier';

      await expect(
        logisticsService.predictDeliveryTime(
          invalidCarrier,
          route,
          historical_data
        )
      ).rejects.toThrow();
    });
  });

  describe('handleInternationalShipment', () => {
    const shipment: InternationalShipment = {
      origin: {
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001'
      },
      destination: {
        address: '456 Market St',
        city: 'London',
        country: 'UK',
        postalCode: 'SW1A 1AA'
      },
      packageDetails: {
        weight: 10,
        dimensions: {
          length: 10,
          width: 10,
          height: 10
        },
        fragile: false
      },
      customsValue: 1000
    };

    it('should return valid customs documentation', async () => {
      const documentation = await logisticsService.handleInternationalShipment(shipment);

      expect(documentation).toBeDefined();
      expect(documentation.documents).toBeInstanceOf(Array);
      expect(documentation.duties).toBeGreaterThanOrEqual(0);
      expect(documentation.restrictions).toBeInstanceOf(Array);
    });

    it('should handle restricted items', async () => {
      const restrictedShipment: InternationalShipment = {
        ...shipment,
        packageDetails: {
          ...shipment.packageDetails,
          weight: 1000 // Exceeding weight limit
        }
      };

      const documentation = await logisticsService.handleInternationalShipment(restrictedShipment);
      expect(documentation.restrictions.length).toBeGreaterThan(0);
    });
  });

  describe('tracking', () => {
    const mockTrackingInfo: TrackingInfo = {
      trackingNumber: '123456789',
      carrier: 'DHL',
      status: 'In Transit',
      lastUpdate: new Date(),
      estimatedDelivery: new Date(),
      location: {
        city: 'New York',
        country: 'USA'
      },
      events: [
        {
          timestamp: new Date(),
          status: 'In Transit',
          location: 'New York',
          description: 'Package in transit'
        }
      ]
    };

    it('should track single shipment', async () => {
      const trackingInfo = await logisticsService.trackShipment('123456789', 'DHL');

      expect(trackingInfo).toBeDefined();
      expect(trackingInfo.trackingNumber).toBe('123456789');
      expect(trackingInfo.carrier).toBe('DHL');
      expect(trackingInfo.status).toBeDefined();
      expect(trackingInfo.events).toBeInstanceOf(Array);
    });

    it('should track multiple shipments', async () => {
      const trackingNumbers = [
        { number: '123456789', carrier: 'DHL' },
        { number: '987654321', carrier: 'FedEx' }
      ];

      const results = await logisticsService.trackMultipleShipments(trackingNumbers);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBe(2);
      expect(results[0].trackingNumber).toBe('123456789');
      expect(results[1].trackingNumber).toBe('987654321');
    });

    it('should handle tracking errors', async () => {
      await expect(
        logisticsService.trackShipment('123456789', 'InvalidCarrier')
      ).rejects.toThrow('Failed to track shipment');
    });

    it('should handle multiple tracking errors', async () => {
      const trackingNumbers = [
        { number: '123456789', carrier: 'DHL' },
        { number: '987654321', carrier: 'InvalidCarrier' }
      ];

      await expect(
        logisticsService.trackMultipleShipments(trackingNumbers)
      ).rejects.toThrow('Failed to track multiple shipments');
    });
  });
}); 