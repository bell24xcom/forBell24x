import { TrackingService, TrackingInfo } from '../../services/logistics/TrackingService';
import { DHLService } from '../../services/logistics/carriers/DHLService';
import { FedExService } from '../../services/logistics/carriers/FedExService';
import { UPSService } from '../../services/logistics/carriers/UPSService';

jest.mock('../../services/logistics/carriers/DHLService');
jest.mock('../../services/logistics/carriers/FedExService');
jest.mock('../../services/logistics/carriers/UPSService');

describe('TrackingService', () => {
  let trackingService: TrackingService;
  let mockDHLService: jest.Mocked<DHLService>;
  let mockFedExService: jest.Mocked<FedExService>;
  let mockUPSService: jest.Mocked<UPSService>;

  const mockTrackingInfo: TrackingInfo = {
    trackingNumber: '123456789',
    carrier: 'DHL',
    status: 'IN_TRANSIT',
    lastUpdate: new Date(),
    estimatedDelivery: new Date(),
    location: {
      city: 'New York',
      country: 'USA'
    },
    events: [
      {
        timestamp: new Date(),
        status: 'IN_TRANSIT',
        location: 'New York',
        description: 'Package in transit'
      }
    ]
  };

  beforeEach(() => {
    mockDHLService = new DHLService() as jest.Mocked<DHLService>;
    mockFedExService = new FedExService() as jest.Mocked<FedExService>;
    mockUPSService = new UPSService() as jest.Mocked<UPSService>;

    (DHLService as jest.Mock).mockImplementation(() => mockDHLService);
    (FedExService as jest.Mock).mockImplementation(() => mockFedExService);
    (UPSService as jest.Mock).mockImplementation(() => mockUPSService);

    trackingService = new TrackingService();
  });

  describe('trackShipment', () => {
    it('should track DHL shipment', async () => {
      mockDHLService.trackShipment.mockResolvedValue(mockTrackingInfo);

      const result = await trackingService.trackShipment('123456789', 'DHL');

      expect(result).toBeDefined();
      expect(result.carrier).toBe('DHL');
      expect(result.status).toBe('In Transit');
      expect(mockDHLService.trackShipment).toHaveBeenCalledWith('123456789');
    });

    it('should track FedEx shipment', async () => {
      mockFedExService.trackShipment.mockResolvedValue({
        ...mockTrackingInfo,
        carrier: 'FedEx'
      });

      const result = await trackingService.trackShipment('987654321', 'FedEx');

      expect(result).toBeDefined();
      expect(result.carrier).toBe('FedEx');
      expect(mockFedExService.trackShipment).toHaveBeenCalledWith('987654321');
    });

    it('should track UPS shipment', async () => {
      mockUPSService.trackShipment.mockResolvedValue({
        ...mockTrackingInfo,
        carrier: 'UPS'
      });

      const result = await trackingService.trackShipment('456789123', 'UPS');

      expect(result).toBeDefined();
      expect(result.carrier).toBe('UPS');
      expect(mockUPSService.trackShipment).toHaveBeenCalledWith('456789123');
    });

    it('should throw error for unsupported carrier', async () => {
      await expect(
        trackingService.trackShipment('123456789', 'InvalidCarrier')
      ).rejects.toThrow('Unsupported carrier');
    });

    it('should handle tracking errors', async () => {
      mockDHLService.trackShipment.mockRejectedValue(new Error('API Error'));

      await expect(
        trackingService.trackShipment('123456789', 'DHL')
      ).rejects.toThrow('Failed to track shipment');
    });
  });

  describe('trackMultipleShipments', () => {
    it('should track multiple shipments', async () => {
      const trackingNumbers = [
        { number: '123456789', carrier: 'DHL' },
        { number: '987654321', carrier: 'FedEx' },
        { number: '456789123', carrier: 'UPS' }
      ];

      mockDHLService.trackShipment.mockResolvedValue({
        ...mockTrackingInfo,
        trackingNumber: '123456789'
      });

      mockFedExService.trackShipment.mockResolvedValue({
        ...mockTrackingInfo,
        trackingNumber: '987654321',
        carrier: 'FedEx'
      });

      mockUPSService.trackShipment.mockResolvedValue({
        ...mockTrackingInfo,
        trackingNumber: '456789123',
        carrier: 'UPS'
      });

      const results = await trackingService.trackMultipleShipments(trackingNumbers);

      expect(results).toHaveLength(3);
      expect(results[0].trackingNumber).toBe('123456789');
      expect(results[1].trackingNumber).toBe('987654321');
      expect(results[2].trackingNumber).toBe('456789123');
    });

    it('should handle errors in multiple tracking', async () => {
      const trackingNumbers = [
        { number: '123456789', carrier: 'DHL' },
        { number: '987654321', carrier: 'InvalidCarrier' }
      ];

      mockDHLService.trackShipment.mockResolvedValue(mockTrackingInfo);

      await expect(
        trackingService.trackMultipleShipments(trackingNumbers)
      ).rejects.toThrow('Failed to track multiple shipments');
    });
  });

  describe('status normalization', () => {
    it('should normalize status codes', async () => {
      mockDHLService.trackShipment.mockResolvedValue({
        ...mockTrackingInfo,
        status: 'IN_TRANSIT'
      });

      const result = await trackingService.trackShipment('123456789', 'DHL');
      expect(result.status).toBe('In Transit');
    });

    it('should handle unknown status codes', async () => {
      mockDHLService.trackShipment.mockResolvedValue({
        ...mockTrackingInfo,
        status: 'UNKNOWN_STATUS'
      });

      const result = await trackingService.trackShipment('123456789', 'DHL');
      expect(result.status).toBe('UNKNOWN_STATUS');
    });
  });
}); 