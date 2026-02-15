import express from 'express';
import { LogisticsService } from '../services/logistics';
import { authenticate } from '../middleware/authenticate';
import { shiprocketService, ShipmentRequest, ShippingRateRequest } from '../services/logistics';

const router = express.Router();

// POST /api/logistics/shiprocket/track
router.post('/shiprocket/track', authenticate, async (req, res) => {
  try {
    const { shipmentId } = req.body;
    const tracking = await LogisticsService.trackShiprocketShipment(shipmentId);
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to track shipment' });
  }
});

// POST /api/logistics/real-time-updates (webhook)
router.post('/real-time-updates', async (req, res) => {
  try {
    await LogisticsService.handleRealTimeUpdate(req.body);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process real-time update' });
  }
});

/**
 * POST /api/logistics/rates
 * Calculate shipping rates for different courier partners
 */
router.post('/rates', async (req, res) => {
  try {
    const { pickupPincode, deliveryPincode, weight, declaredValue, codAmount }: ShippingRateRequest = req.body;

    if (!pickupPincode || !deliveryPincode || !weight || !declaredValue) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pickupPincode, deliveryPincode, weight, declaredValue'
      });
    }

    const rates = await shiprocketService.getShippingRates({
      pickupPincode,
      deliveryPincode,
      weight,
      declaredValue,
      codAmount
    });

    res.json({
      success: true,
      data: rates,
      message: 'Shipping rates calculated successfully'
    });
  } catch (error: any) {
    console.error('Failed to calculate shipping rates:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate shipping rates'
    });
  }
});

/**
 * POST /api/logistics/shipments
 * Create a new shipment
 */
router.post('/shipments', async (req, res) => {
  try {
    const shipmentData: ShipmentRequest = req.body;

    // Validate required fields
    const requiredFields = [
      'orderId', 'orderDate', 'pickupLocation', 'billingCustomerName',
      'billingAddress', 'billingCity', 'billingPincode', 'billingState',
      'billingCountry', 'billingEmail', 'billingPhone', 'orderItems',
      'paymentMethod', 'subTotal', 'length', 'breadth', 'height', 'weight'
    ];

    for (const field of requiredFields) {
      if (!shipmentData[field as keyof ShipmentRequest]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    const result = await shiprocketService.createShipment(shipmentData);

    res.json({
      success: true,
      data: result,
      message: 'Shipment created successfully'
    });
  } catch (error: any) {
    console.error('Failed to create shipment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create shipment'
    });
  }
});

/**
 * GET /api/logistics/track/:awbCode
 * Track shipment by AWB code
 */
router.get('/track/:awbCode', async (req, res) => {
  try {
    const { awbCode } = req.params;

    if (!awbCode) {
      return res.status(400).json({
        success: false,
        message: 'AWB code is required'
      });
    }

    const trackingInfo = await shiprocketService.trackShipment(awbCode);

    res.json({
      success: true,
      data: trackingInfo,
      message: 'Tracking information retrieved successfully'
    });
  } catch (error: any) {
    console.error('Failed to track shipment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track shipment'
    });
  }
});

/**
 * GET /api/logistics/pickup-locations
 * Get all pickup locations
 */
router.get('/pickup-locations', async (req, res) => {
  try {
    const locations = await shiprocketService.getPickupLocations();

    res.json({
      success: true,
      data: locations,
      message: 'Pickup locations retrieved successfully'
    });
  } catch (error: any) {
    console.error('Failed to get pickup locations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pickup locations'
    });
  }
});

/**
 * POST /api/logistics/cancel
 * Cancel shipments by AWB codes
 */
router.post('/cancel', async (req, res) => {
  try {
    const { awbCodes } = req.body;

    if (!awbCodes || !Array.isArray(awbCodes) || awbCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'AWB codes array is required'
      });
    }

    await shiprocketService.cancelShipment(awbCodes);

    res.json({
      success: true,
      message: 'Shipments cancelled successfully'
    });
  } catch (error: any) {
    console.error('Failed to cancel shipments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel shipments'
    });
  }
});

/**
 * GET /api/logistics/analytics
 * Get logistics analytics and insights
 */
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const analytics = await shiprocketService.getLogisticsAnalytics(
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: analytics,
      message: 'Analytics retrieved successfully'
    });
  } catch (error: any) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get analytics'
    });
  }
});

/**
 * POST /api/logistics/webhook
 * Handle real-time updates from Shiprocket
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature if needed
    // const signature = req.headers['x-shiprocket-signature'];
    
    // Process the webhook data
    const result = await shiprocketService.emit('tracking-update', webhookData);

    // Store the update in database (implement based on your DB structure)
    // await updateShipmentStatus(webhookData);

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error: any) {
    console.error('Failed to process webhook:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process webhook'
    });
  }
});

/**
 * GET /api/logistics/shipments
 * Get all shipments with optional filtering
 */
router.get('/shipments', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    // In production, this would query your database
    // For now, return mock data that matches the expected format
    const mockShipments = [
      {
        id: 'SH1001',
        awbCode: 'AWB12345678',
        orderId: 'ORD2001',
        customerName: 'Acme Corp',
        destination: 'Mumbai',
        status: 'IN_TRANSIT',
        courierPartner: 'Blue Dart',
        estimatedDelivery: '2024-01-15',
        value: 25000,
        weight: 2.5,
        dimensions: '20x15x10',
        trackingUrl: 'https://track.bluedart.com/AWB12345678',
        currentLocation: 'Mumbai Hub',
        lastUpdate: new Date().toISOString(),
        checkpoints: [
          {
            location: 'Delhi Hub',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'Picked Up',
            remarks: 'Package collected from sender'
          },
          {
            location: 'Mumbai Hub',
            time: new Date().toISOString(),
            status: 'In Transit',
            remarks: 'Package arrived at destination hub'
          }
        ]
      }
      // Add more mock shipments as needed
    ];

    res.json({
      success: true,
      data: {
        shipments: mockShipments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: mockShipments.length,
          totalPages: Math.ceil(mockShipments.length / parseInt(limit as string))
        }
      },
      message: 'Shipments retrieved successfully'
    });
  } catch (error: any) {
    console.error('Failed to get shipments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get shipments'
    });
  }
});

/**
 * GET /api/logistics/dashboard
 * Get logistics dashboard data
 */
router.get('/dashboard', async (req, res) => {
  try {
    // In production, this would aggregate data from your database
    const dashboardData = {
      stats: {
        totalShipments: 1247,
        deliveredShipments: 1156,
        inTransitShipments: 67,
        pendingShipments: 24,
        totalValue: 28500000, // ₹2.85 crores
        averageDeliveryTime: 3.2,
        onTimeDeliveryRate: 92.3,
        costPerShipment: 42
      },
      recentShipments: [
        {
          id: 'SH1001',
          awbCode: 'AWB12345678',
          customerName: 'Acme Corp',
          status: 'DELIVERED',
          value: 25000
        }
        // Add more recent shipments
      ],
      courierPerformance: [
        { courier: 'Blue Dart', totalOrders: 156, avgCost: 45, successRate: 94.2 },
        { courier: 'Delhivery', totalOrders: 234, avgCost: 40, successRate: 96.1 },
        { courier: 'Ekart', totalOrders: 189, avgCost: 35, successRate: 89.3 }
      ],
      costOptimization: [
        'Consider using Delhivery for metro deliveries (₹40 avg shipping)',
        'Blue Dart has excellent success rate for express deliveries',
        'Consolidate shipments to tier-2 cities for 15% cost savings'
      ]
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error: any) {
    console.error('Failed to get dashboard data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard data'
    });
  }
});

export default router; 