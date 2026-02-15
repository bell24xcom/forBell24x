import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for delivery alerts
  const deliveryAlerts = [
    {
      id: 'ALT001',
      shipmentId: 'SH002',
      type: 'weather',
      severity: 'medium',
      message: 'Heavy rainfall causing delays in Maharashtra region',
      timestamp: '2024-01-15T11:00:00Z',
      resolved: false
    },
    {
      id: 'ALT002',
      shipmentId: 'SH001',
      type: 'traffic',
      severity: 'low',
      message: 'Traffic congestion on Mumbai-Pune highway',
      timestamp: '2024-01-16T08:00:00Z',
      resolved: true
    },
    {
      id: 'ALT003',
      shipmentId: 'SH003',
      type: 'customs',
      severity: 'high',
      message: 'Customs clearance required for international components',
      timestamp: '2024-01-14T10:00:00Z',
      resolved: true
    }
  ];

  return NextResponse.json(deliveryAlerts);
}
