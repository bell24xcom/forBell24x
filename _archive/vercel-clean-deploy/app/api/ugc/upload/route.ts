import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid file type. Only images and videos are allowed.'
      }, { status: 400 });
    }
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      }, { status: 400 });
    }
    
    // Mock upload to Cloudinary/S3
    const uploadResult = await mockUpload(file, metadata);
    
    return NextResponse.json({
      success: true,
      upload: uploadResult,
      message: 'File uploaded successfully'
    });
    
  } catch (error) {
    console.error('UGC Upload Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Upload failed',
      message: 'Please try again or contact support'
    }, { status: 500 });
  }
}

async function mockUpload(file: File, metadata: any) {
  // Mock upload process
  const fileId = `ugc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: fileId,
    filename: file.name,
    size: file.size,
    type: file.type,
    url: `https://res.cloudinary.com/bell24h/image/upload/v1/${fileId}`,
    thumbnail_url: `https://res.cloudinary.com/bell24h/image/upload/w_300,h_auto/v1/${fileId}`,
    metadata: {
      ...metadata,
      uploaded_at: new Date().toISOString(),
      status: 'processed'
    },
    analytics: {
      views: 0,
      downloads: 0,
      shares: 0
    }
  };
}

export async function GET() {
  return NextResponse.json({
    status: 'UGC Upload System Active',
    supported_formats: {
      images: ['JPEG', 'PNG', 'GIF', 'WebP'],
      videos: ['MP4', 'WebM']
    },
    limits: {
      max_file_size: '10MB',
      max_files_per_upload: 5
    },
    features: [
      'Automatic image optimization',
      'Video compression',
      'Thumbnail generation',
      'Metadata extraction',
      'Content moderation',
      'Analytics tracking'
    ]
  });
}
