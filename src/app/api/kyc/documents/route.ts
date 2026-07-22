import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { isCloudinaryConfigured, uploadToCloudinary, deleteFromCloudinary } from '@/src/lib/cloudinary-server';
import { requireAdmin, isErrorResponse } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const DOCUMENT_TYPES = ['ID_PROOF', 'GST_CERTIFICATE', 'BUSINESS_REGISTRATION'] as const;
type DocumentType = (typeof DOCUMENT_TYPES)[number];

const MAX_SIZE = 15 * 1024 * 1024; // 15MB, matches UPLOAD_CONFIGS.CERTIFICATES

function getUserId(request: NextRequest): string | null {
  const token =
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return verifyToken(token).userId;
  } catch {
    return null;
  }
}

// GET /api/kyc/documents — own documents. Admins may pass ?userId=... to
// review someone else's; self-service callers may not.
export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });
  }

  const targetUserId = request.nextUrl.searchParams.get('userId');
  if (targetUserId && targetUserId !== userId) {
    const auth = requireAdmin(request);
    if (isErrorResponse(auth)) return auth;
  }

  const documents = await prisma.kycDocument.findMany({
    where: { userId: targetUserId || userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, documents });
}

// POST /api/kyc/documents — upload/resubmit a document for the caller's
// own KYC. multipart/form-data: file, documentType.
export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const documentType = formData.get('documentType') as string | null;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }
  if (!documentType || !DOCUMENT_TYPES.includes(documentType as DocumentType)) {
    return NextResponse.json(
      { success: false, error: `documentType must be one of: ${DOCUMENT_TYPES.join(', ')}` },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, error: 'File too large. Maximum size is 15MB.' }, { status: 400 });
  }
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ success: false, error: 'File storage not configured' }, { status: 503 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadToCloudinary(buffer, 'CERTIFICATES', file.name, userId);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error || 'Upload failed' }, { status: 502 });
  }

  // Resubmission replaces the previous document of the same type — a
  // supplier fixing a rejected upload shouldn't accumulate stale rows, and
  // an already-VERIFIED document being replaced correctly resets to PENDING
  // for re-review rather than silently keeping the old verified status.
  const existing = await prisma.kycDocument.findFirst({
    where: { userId, documentType: documentType as DocumentType },
  });
  if (existing) {
    await deleteFromCloudinary(existing.cloudinaryId, 'image').catch(() => {});
    await prisma.kycDocument.delete({ where: { id: existing.id } });
  }

  const document = await prisma.kycDocument.create({
    data: {
      userId,
      documentType: documentType as DocumentType,
      fileUrl: result.url,
      cloudinaryId: result.public_id,
      status: 'PENDING',
    },
  });

  return NextResponse.json({ success: true, document });
}
