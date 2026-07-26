import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { generateUploadSignature } from '@/src/lib/cloudinary';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cloudinary/upload-signature
 *
 * Mints a short-lived, folder-scoped signed-upload credential so the client
 * (currently: mobile Video RFQ) can upload a large file directly to
 * Cloudinary — the file bytes never pass through our Vercel functions,
 * avoiding both the 4.5MB request-body cap and any in-memory buffering here.
 *
 * Auth-gated: an unauthenticated version of this endpoint would let anyone
 * mint valid signed-upload credentials into our Cloudinary bucket for free.
 */
export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    try {
      verifyToken(token);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (!uploadPreset || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary is not configured on the server' },
        { status: 503 },
      );
    }

    // Video RFQ is the only caller today — one folder, one resource type.
    // Sibling to UPLOAD_CONFIGS.RFQ_ATTACHMENTS ('bell24h/rfq'), not the
    // supplier-facing PRODUCT_VIDEOS bucket — these are buyer-recorded
    // requirement videos, not product listings.
    const folder = 'bell24h/rfq/videos';
    const { signature, timestamp, api_key, cloud_name } = generateUploadSignature({
      folder,
      preset: uploadPreset,
    });

    if (!cloud_name) {
      return NextResponse.json(
        { success: false, error: 'CLOUDINARY_CLOUD_NAME is not configured on the server' },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey: api_key,
      cloudName: cloud_name,
      uploadPreset,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloud_name}/video/upload`,
    });
  } catch (error) {
    console.error('[cloudinary/upload-signature] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
