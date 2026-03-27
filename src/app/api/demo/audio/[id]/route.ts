import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to serve from public folder first
    const publicPath = join(process.cwd(), 'public', 'api', 'demo', 'audio', id);

    if (existsSync(publicPath)) {
      const audioBuffer = await readFile(publicPath);
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Return a silent audio placeholder if file not found
    return NextResponse.json(
      { error: 'Audio file not found', id },
      { status: 404 }
    );
  } catch (error) {
    console.error('Audio route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
