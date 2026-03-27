import axios from 'axios';
import { EventEmitter } from 'events';

interface ShiprocketCredentials {
  email: string;
  password: string;
  token?: string;
  tokenExpiry?: number;
}

interface ShipmentRequest {
  orderId: string;
  orderDate: string;
  pickupLocation: string;
  billingCustomerName: string;
  billingLastName: string;
  billingAddress: string;
  billingCity: string;
  billingPincode: string;
  billingState: string;
  billingCountry: string;
  billingEmail: string;
  billingPhone: string;
  orderItems: Array<{
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
    discount?: number;
    tax?: number;
    hsn?: string;
  }>;
  paymentMethod: 'COD' | 'Prepaid';
  shippingIsCodAvailable: number;
  subTotal: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface TrackingInfo {
  trackingId: string;
  shipmentId: string;
  status: string;
  statusCode: number;
  lastUpdate: string;
  expectedDelivery?: string;
  checkpoints: Array<{
    location: string;
    time: string;
    status: string;
    remarks?: string;
  }>;
  currentLocation?: string;
  deliveryPartner?: string;
}

interface ShippingRate {
  courierId: number;
  courierName: string;
  totalCharge: number;
  rate: number;
  codCharge: number;
  minWeight: number;
  estimatedDeliveryDays: string;
  baseRate: number;
  codMultiplier: number;
  freight: number;
  otherCharges: number;
}

interface ShippingRateRequest {
  pickupPincode: string;
  deliveryPincode: string;
  weight: number;
  codAmount?: number;
  declaredValue: number;
}

export class ShiprocketService extends EventEmitter {
  private credentials: ShiprocketCredentials;
  private baseUrl = 'https://apiv2.shiprocket.in/v1/external';
  private wsUrl = 'wss://api.shiprocket.in/ws';
  private websocket?: WebSocket;

  constructor(credentials: ShiprocketCredentials) {
    super();
    this.credentials = credentials;
  }

  /**
   * Authenticate with Shiprocket API
   */
  async authenticate(): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        email: this.credentials.email,
        password: this.credentials.password
      });

      this.credentials.token = response.data.token;
      this.credentials.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      console.log('✅ Shiprocket authentication successful');
    } catch (error: any) {
      console.error('❌ Shiprocket authentication failed:', error.response?.data || error.message);
      throw new Error('Shiprocket authentication failed');
    }
  }

  /**
   * Ensure valid token before API calls
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.credentials.token || !this.credentials.tokenExpiry || 
        Date.now() > this.credentials.tokenExpiry) {
      await this.authenticate();
    }
  }

  /**
   * Get authenticated headers
   */
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.credentials.token}`
    };
  }

  /**
   * Calculate shipping rates for different courier partners
   */
  async getShippingRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    await this.ensureValidToken();
    
    try {
      const response = await axios.get(`${this.baseUrl}/courier/serviceability/`, {
        headers: this.getHeaders(),
        params: {
          pickup_postcode: request.pickupPincode,
          delivery_postcode: request.deliveryPincode,
          weight: request.weight,
          cod: request.codAmount ? 1 : 0,
          declared_value: request.declaredValue
        }
      });

      return response.data.data.available_courier_companies.map((courier: any) => ({
        courierId: courier.courier_company_id,
        courierName: courier.courier_name,
        totalCharge: courier.rate,
        rate: courier.rate,
        codCharge: courier.cod_charges || 0,
        minWeight: courier.min_weight,
        estimatedDeliveryDays: courier.estimated_delivery_days,
        baseRate: courier.base_rate,
        codMultiplier: courier.cod_multiplier,
        freight: courier.freight_charge,
        otherCharges: courier.other_charges || 0
      }));
    } catch (error: any) {
      console.error('❌ Failed to get shipping rates:', error.response?.data || error.message);
      throw new Error('Failed to calculate shipping rates');
    }
  }

  /**
   * Create a new shipment
   */
  async createShipment(shipmentData: ShipmentRequest): Promise<{shipmentId: string, awbCode: string}> {
    await this.ensureValidToken();

    try {
      const response = await axios.post(`${this.baseUrl}/orders/create/adhoc`, shipmentData, {
        headers: this.getHeaders()
      });

      const { shipment_id, awb_code } = response.data;
      
      // Start tracking this shipment
      this.startRealTimeTracking(shipment_id);
      
      return {
        shipmentId: shipment_id,
        awbCode: awb_code
      };
    } catch (error: any) {
      console.error('❌ Failed to create shipment:', error.response?.data || error.message);
      throw new Error('Failed to create shipment');
    }
  }

  /**
   * Track shipment status
   */
  async trackShipment(awbCode: string): Promise<TrackingInfo> {
    await this.ensureValidToken();

    try {
      const response = await axios.get(`${this.baseUrl}/courier/track/awb/${awbCode}`, {
        headers: this.getHeaders()
      });

      const trackingData = response.data.tracking_data;
      
      return {
        trackingId: awbCode,
        shipmentId: trackingData.shipment_id,
        status: trackingData.current_status,
        statusCode: trackingData.shipment_status,
        lastUpdate: trackingData.last_update_time,
        expectedDelivery: trackingData.edd,
        currentLocation: trackingData.current_timestamp,
        deliveryPartner: trackingData.courier_name,
        checkpoints: trackingData.shipment_track.map((track: any) => ({
          location: `${track.location}, ${track.state}`,
          time: track.date,
          status: track.status,
          remarks: track.sr_status_label
        }))
      };
    } catch (error: any) {
      console.error('❌ Failed to track shipment:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Get all pickup locations
   */
  async getPickupLocations(): Promise<Array<{id: string, name: string, address: string}>> {
    await this.ensureValidToken();

    try {
      const response = await axios.get(`${this.baseUrl}/settings/company/pickup`, {
        headers: this.getHeaders()
      });

      return response.data.data.shipping_address.map((location: any) => ({
        id: location.id,
        name: location.pickup_location,
        address: `${location.address}, ${location.city}, ${location.state} - ${location.pin_code}`
      }));
    } catch (error: any) {
      console.error('❌ Failed to get pickup locations:', error.response?.data || error.message);
      throw new Error('Failed to get pickup locations');
    }
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(awbCodes: string[]): Promise<void> {
    await this.ensureValidToken();

    try {
      await axios.post(`${this.baseUrl}/orders/cancel`, {
        awbs: awbCodes
      }, {
        headers: this.getHeaders()
      });
      
      console.log('✅ Shipments cancelled successfully');
    } catch (error: any) {
      console.error('❌ Failed to cancel shipments:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipments');
    }
  }

  /**
   * Start real-time tracking via WebSocket
   */
  private startRealTimeTracking(shipmentId: string): void {
    try {
      this.websocket = new WebSocket(this.wsUrl);
      
      this.websocket.onopen = () => {
        console.log('📡 WebSocket connected for real-time tracking');
        this.websocket?.send(JSON.stringify({
          action: 'subscribe',
          shipmentId: shipmentId,
          token: this.credentials.token
        }));
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('tracking-update', {
            shipmentId: data.shipmentId,
            status: data.status,
            location: data.location,
            timestamp: data.timestamp,
            message: data.message
          });
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.websocket.onclose = () => {
        console.log('📡 WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.startRealTimeTracking(shipmentId);
        }, 5000);
      };
    } catch (error) {
      console.error('❌ Failed to establish WebSocket connection:', error);
    }
  }

  /**
   * Get logistics analytics
   */
  async getLogisticsAnalytics(startDate: string, endDate: string): Promise<any> {
    await this.ensureValidToken();

    try {
      const response = await axios.get(`${this.baseUrl}/orders`, {
        headers: this.getHeaders(),
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });

      const orders = response.data.data;
      
      return {
        totalShipments: orders.length,
        deliveredShipments: orders.filter((o: any) => o.status === 'DELIVERED').length,
        inTransitShipments: orders.filter((o: any) => o.status === 'IN TRANSIT').length,
        pendingShipments: orders.filter((o: any) => o.status === 'NEW').length,
        totalValue: orders.reduce((sum: number, o: any) => sum + o.total, 0),
        averageDeliveryTime: this.calculateAverageDeliveryTime(orders),
        costOptimization: await this.calculateCostOptimization(orders)
      };
    } catch (error: any) {
      console.error('❌ Failed to get logistics analytics:', error.response?.data || error.message);
      throw new Error('Failed to get logistics analytics');
    }
  }

  /**
   * Calculate average delivery time
   */
  private calculateAverageDeliveryTime(orders: any[]): number {
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED' && o.delivered_date);
    if (deliveredOrders.length === 0) return 0;

    const totalDays = deliveredOrders.reduce((sum, order) => {
      const orderDate = new Date(order.order_date);
      const deliveryDate = new Date(order.delivered_date);
      const diffTime = deliveryDate.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    return Math.round(totalDays / deliveredOrders.length);
  }

  /**
   * Calculate cost optimization recommendations
   */
  private async calculateCostOptimization(orders: any[]): Promise<any> {
    const courierPerformance = new Map();
    
    orders.forEach(order => {
      const courier = order.courier_name;
      if (!courierPerformance.has(courier)) {
        courierPerformance.set(courier, {
          totalOrders: 0,
          totalCost: 0,
          averageDeliveryTime: 0,
          deliverySuccess: 0
        });
      }
      
      const performance = courierPerformance.get(courier);
      performance.totalOrders++;
      performance.totalCost += order.freight_charge || 0;
      if (order.status === 'DELIVERED') {
        performance.deliverySuccess++;
      }
    });

    const recommendations = [];
    let bestCostCourier = null;
    let bestPerformanceCourier = null;
    let lowestCost = Infinity;
    let bestSuccessRate = 0;

    courierPerformance.forEach((performance, courier) => {
      const avgCost = performance.totalCost / performance.totalOrders;
      const successRate = performance.deliverySuccess / performance.totalOrders;
      
      if (avgCost < lowestCost) {
        lowestCost = avgCost;
        bestCostCourier = courier;
      }
      
      if (successRate > bestSuccessRate) {
        bestSuccessRate = successRate;
        bestPerformanceCourier = courier;
      }
    });

    if (bestCostCourier) {
      recommendations.push(`Consider using ${bestCostCourier} for cost optimization (₹${lowestCost.toFixed(2)} avg shipping)`);
    }
    
    if (bestPerformanceCourier) {
      recommendations.push(`${bestPerformanceCourier} has the best delivery success rate (${(bestSuccessRate * 100).toFixed(1)}%)`);
    }

    return {
      recommendations,
      courierPerformance: Array.from(courierPerformance.entries()).map(([courier, performance]) => ({
        courier,
        ...performance,
        avgCost: performance.totalCost / performance.totalOrders,
        successRate: performance.deliverySuccess / performance.totalOrders
      }))
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.websocket) {
      this.websocket.close();
    }
  }
}

// Initialize Shiprocket service
export const shiprocketService = new ShiprocketService({
  email: process.env.SHIPROCKET_EMAIL || '',
  password: process.env.SHIPROCKET_PASSWORD || ''
});

// Export types for use in other modules
export type { 
  ShipmentRequest, 
  TrackingInfo, 
  ShippingRate, 
  ShippingRateRequest 
}; 