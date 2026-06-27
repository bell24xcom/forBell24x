/**
 * Business Pulse API — location intelligence feed.
 *
 * Public + mobile-ready. Powers the homepage "Near You" section, the
 * /location/[area] pages, and the future VyaparSethu mobile app
 * (location-aware notifications when entering an industrial zone).
 *
 *   GET /api/location/pulse?area=kalamboli&days=7
 *   GET /api/location/pulse?lat=19.03&lng=73.10   (geofence → nearest cluster)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAreaPulse } from '@/src/lib/bom/business-pulse';
import { geofenceArea, listAreas, nearbyAreas } from '@/src/lib/bom/location';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = Math.min(30, Math.max(1, Number(searchParams.get('days')) || 7));

  let areaKey = searchParams.get('area');

  // Geofence path: resolve lat/lng → nearest industrial cluster (radius hidden)
  if (!areaKey) {
    const lat = Number(searchParams.get('lat'));
    const lng = Number(searchParams.get('lng'));
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const area = geofenceArea({ lat, lng });
      areaKey = area?.key ?? null;
    }
  }

  // No area resolvable → return the directory of areas so clients can choose.
  if (!areaKey) {
    return NextResponse.json({
      success: true,
      resolved: false,
      areas: listAreas().map((a) => ({ key: a.key, name: a.name, fullName: a.fullName, state: a.state })),
    });
  }

  const pulse = await getAreaPulse(areaKey, days);
  return NextResponse.json({
    success: true,
    resolved: true,
    pulse,
    nearby: nearbyAreas(areaKey).map((a) => ({ key: a.key, name: a.name, fullName: a.fullName })),
  });
}
