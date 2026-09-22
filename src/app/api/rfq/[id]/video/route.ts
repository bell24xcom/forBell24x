/**
 * Video RFQ attachment (Marketplace Certification Sprint, Part D).
 *
 * Deliberately separate from /api/video-rfq: this route never calls Groq,
 * never transcribes, never extracts. It only records a Cloudinary URL
 * already uploaded directly by the client (see
 * /api/cloudinary/upload-signature) against an RFQ the caller owns. The
 * existing AI-powered /api/video-rfq (voice-driven RFQ creation via video)
 * is untouched by this file.
 *
 * POST   { videoUrl, videoPublicId } — attach or replace the RFQ's video.
 * DELETE                             — remove the RFQ's video.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

function isOwnCloudinaryVideoUrl(url: string): boolean {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'res.cloudinary.com' &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

async function loadOwnedRFQ(id: string, userId: string) {
  const rfq = await prisma.rFQ.findUnique({ where: { id }, select: { id: true, createdBy: true } });
  if (!rfq) return { error: NextResponse.json({ success: false, error: 'RFQ not found' }, { status: 404 }) };
  if (rfq.createdBy !== userId) {
    return { error: NextResponse.json({ success: false, error: 'Only the RFQ owner can manage its video' }, { status: 403 }) };
  }
  return { rfq };
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { videoUrl, videoPublicId } = await request.json();
    if (typeof videoUrl !== 'string' || !videoUrl) {
      return NextResponse.json({ success: false, error: 'videoUrl is required' }, { status: 400 });
    }
    if (!isOwnCloudinaryVideoUrl(videoUrl)) {
      return NextResponse.json({ success: false, error: 'videoUrl must point to our Cloudinary bucket' }, { status: 400 });
    }

    const { rfq, error } = await loadOwnedRFQ(params.id, user.userId);
    if (error) return error;

    const updated = await prisma.rFQ.update({
      where: { id: rfq!.id },
      data: { videoUrl, videoPublicId: typeof videoPublicId === 'string' ? videoPublicId : null },
      select: { id: true, videoUrl: true, videoPublicId: true },
    });

    return NextResponse.json({ success: true, rfq: updated });
  } catch (error) {
    console.error('[RFQ Video Attachment] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to attach video' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { rfq, error } = await loadOwnedRFQ(params.id, user.userId);
    if (error) return error;

    const updated = await prisma.rFQ.update({
      where: { id: rfq!.id },
      data: { videoUrl: null, videoPublicId: null },
      select: { id: true, videoUrl: true, videoPublicId: true },
    });

    return NextResponse.json({ success: true, rfq: updated });
  } catch (error) {
    console.error('[RFQ Video Attachment] DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove video' }, { status: 500 });
  }
}
