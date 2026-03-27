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
    message: 'Supplier Image Upload System Status',
    data: {
      status: 'TEMPORARILY_DISABLED',
      reason: 'Beta launch - will be enabled after deployment',
      supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      maxFileSize: '10MB',
      supportedImageTypes: ['logo', 'product', 'gallery', 'certificate'],
      features: [
        'Automatic image optimization',
        'Type-specific sizing (logo: 300x300, product: 800x600, gallery: 1200x800)',
        'Thumbnail generation for products and gallery',
        'File type validation',
        'Size validation',
        'Secure upload handling',
        'Compression optimization'
      ],
      imageTypes: {
        logo: 'Company logo - 300x300px, high quality',
        product: 'Product images - 800x600px with thumbnails',
        gallery: 'Gallery images - 1200x800px with thumbnails',
        certificate: 'Certificates - up to 1000x700px, document quality'
      }
    }
  });
}
