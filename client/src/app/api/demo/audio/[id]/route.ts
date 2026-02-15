import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Try to serve from public folder first
    const publicPath = join(process.cwd(), 'public', 'api', 'demo', 'audio', id);
    
    if (existsSync(publicPath)) {
      const file = await readFile(publicPath);
      
      return new NextResponse(file, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': file.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    
    // If file doesn't exist, return a placeholder response (for demo)
    // In production, you would have actual audio files
    return NextResponse.json(
      { 
        error: 'Audio file not found',
        message: 'Demo audio file not available. Please add audio files to public/api/demo/audio/',
        requestedFile: id
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error serving audio file:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file' },
      { status: 500 }
    );
  }
}

