import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for logistics shipments
  const shipments = [
    {
      id: 'SH001',
      rfqId: 'RFQ001',
      supplierName: 'TechCorp Industries',
      buyerName: 'Global Electronics Ltd',
      origin: 'Mumbai, Maharashtra',
      destination: 'Bangalore, Karnataka',
      status: 'in_transit',
      currentLocation: 'Pune, Maharashtra',
      estimatedDelivery: '2024-01-20',
      trackingNumber: 'TN123456789',
      carrier: 'BlueDart Express',
      packageDetails: {
        weight: 150,
        dimensions: '60x40x30 cm',
        quantity: 25,
        description: 'Electronic Components - Circuit Boards'
      },
      milestones: [
        {
          timestamp: '2024-01-15T10:00:00Z',
          location: 'Mumbai, Maharashtra',
          status: 'Picked up',
          description: 'Package picked up from supplier warehouse'
        },
        {
          timestamp: '2024-01-15T16:30:00Z',
          location: 'Mumbai, Maharashtra',
          status: 'In Transit',
          description: 'Package departed from Mumbai hub'
        },
        {
          timestamp: '2024-01-16T09:15:00Z',
          location: 'Pune, Maharashtra',
          status: 'In Transit',
          description: 'Package arrived at Pune sorting center'
        }
      ],
      alerts: [
        {
          type: 'info',
          message: 'Package is on schedule for delivery',
          timestamp: '2024-01-16T09:15:00Z'
        }
      ]
    },
    {
      id: 'SH002',
      rfqId: 'RFQ002',
      supplierName: 'Precision Parts Co',
      buyerName: 'Automotive Solutions',
      origin: 'Chennai, Tamil Nadu',
      destination: 'Delhi, NCR',
      status: 'delayed',
      currentLocation: 'Nagpur, Maharashtra',
      estimatedDelivery: '2024-01-18',
      trackingNumber: 'TN987654321',
      carrier: 'DTDC Express',
      packageDetails: {
        weight: 85,
        dimensions: '45x35x25 cm',
        quantity: 12,
        description: 'Automotive Parts - Engine Components'
      },
      milestones: [
        {
          timestamp: '2024-01-14T08:00:00Z',
          location: 'Chennai, Tamil Nadu',
          status: 'Picked up',
          description: 'Package picked up from supplier warehouse'
        },
        {
          timestamp: '2024-01-14T14:00:00Z',
          location: 'Chennai, Tamil Nadu',
          status: 'In Transit',
          description: 'Package departed from Chennai hub'
        },
        {
          timestamp: '2024-01-15T11:00:00Z',
          location: 'Nagpur, Maharashtra',
          status: 'Delayed',
          description: 'Package delayed due to weather conditions'
        }
      ],
      alerts: [
        {
          type: 'warning',
          message: 'Package delayed due to adverse weather conditions',
          timestamp: '2024-01-15T11:00:00Z'
        }
      ]
    },
    {
      id: 'SH003',
      rfqId: 'RFQ003',
      supplierName: 'Quality First Manufacturing',
      buyerName: 'Textile Industries',
      origin: 'Ahmedabad, Gujarat',
      destination: 'Kolkata, West Bengal',
      status: 'delivered',
      currentLocation: 'Kolkata, West Bengal',
      estimatedDelivery: '2024-01-17',
      actualDelivery: '2024-01-16',
      trackingNumber: 'TN456789123',
      carrier: 'FedEx Express',
      packageDetails: {
        weight: 200,
        dimensions: '80x60x40 cm',
        quantity: 8,
        description: 'Textile Machinery Parts'
      },
      milestones: [
        {
          timestamp: '2024-01-13T09:00:00Z',
          location: 'Ahmedabad, Gujarat',
          status: 'Picked up',
          description: 'Package picked up from supplier warehouse'
        },
        {
          timestamp: '2024-01-13T15:00:00Z',
          location: 'Ahmedabad, Gujarat',
          status: 'In Transit',
          description: 'Package departed from Ahmedabad hub'
        },
        {
          timestamp: '2024-01-14T12:00:00Z',
          location: 'Kolkata, West Bengal',
          status: 'Out for Delivery',
          description: 'Package out for final delivery'
        },
        {
          timestamp: '2024-01-16T14:30:00Z',
          location: 'Kolkata, West Bengal',
          status: 'Delivered',
          description: 'Package successfully delivered to recipient'
        }
      ],
      alerts: [
        {
          type: 'info',
          message: 'Package delivered successfully',
          timestamp: '2024-01-16T14:30:00Z'
        }
      ]
    }
  ];

  return NextResponse.json(shipments);
}
