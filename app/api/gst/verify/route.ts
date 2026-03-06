import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu', '27': 'Maharashtra',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep',
  '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands', '36': 'Telangana',
  '37': 'Andhra Pradesh', '38': 'Ladakh',
};

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { gstNumber } = await request.json();
    const gst = gstNumber?.toUpperCase()?.trim();

    if (!gst || gst.length !== 15) {
      return NextResponse.json({ error: 'GST number must be 15 characters' }, { status: 400 });
    }

    if (!GST_REGEX.test(gst)) {
      return NextResponse.json({ error: 'Invalid GST format. Expected: 2-digit state + PAN + entity code + Z + check digit' }, { status: 400 });
    }

    const stateCode = gst.substring(0, 2);
    const state = STATE_CODES[stateCode] || 'Unknown State';
    const pan = gst.substring(2, 12);

    // Try to verify via a free GST API
    // Using taxpayerapi.in (free public GST data)
    try {
      const res = await fetch(`https://api.taxpayerapi.in/v1/gst/search?gstin=${gst}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.lgnm || data?.legalName) {
          const gstData = data.data || data;
          return NextResponse.json({
            success: true,
            verified: true,
            gstData: {
              legalName: gstData.lgnm || gstData.legalName || '',
              tradeName: gstData.tradeNam || gstData.tradeName || '',
              address: [
                gstData.pradr?.addr?.bnm,
                gstData.pradr?.addr?.st,
                gstData.pradr?.addr?.loc,
                gstData.pradr?.addr?.dst,
                gstData.pradr?.addr?.stcd,
              ].filter(Boolean).join(', '),
              state,
              status: gstData.sts || 'Active',
              pan,
            },
          });
        }
      }
    } catch { /* API unavailable, use format-only */ }

    // Fallback: format is valid, extract state from GST number
    return NextResponse.json({
      success: true,
      verified: false,
      gstData: {
        legalName: '',
        tradeName: '',
        address: '',
        state,
        status: 'Format Valid',
        pan,
      },
      note: `State: ${state}. Full verification unavailable — please check GST portal manually.`,
    });

  } catch (error) {
    console.error('GST verify error:', error);
    return NextResponse.json({ error: 'GST verification failed' }, { status: 500 });
  }
}
