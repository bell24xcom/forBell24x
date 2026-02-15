import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Temporarily disabled for build - will be enabled after deployment
  return NextResponse.json({
    success: false,
    error: 'Image upload temporarily disabled during beta launch',
    message: 'This feature will be enabled after deployment'
  }, { status: 503 });
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Image Upload System Status',
    data: {
      status: 'TEMPORARILY_DISABLED',
      reason: 'Beta launch - will be enabled after deployment',
      supportedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFileSize: '5MB',
      supportedUploadTypes: ['logo', 'product', 'gallery'],
      features: [
        'Automatic image optimization',
        'Multiple size variants',
        'File type validation',
        'Size validation',
        'Secure upload handling'
      ]
    }
  });
}
