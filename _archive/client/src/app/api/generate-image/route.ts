import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Temporarily disabled due to OpenAI billing limit
    // Return a placeholder image instead
    const placeholderImages = [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884974?w=1024&h=1024&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1024&h=1024&fit=crop'
    ];

    // Select a random placeholder image
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    const imageUrl = placeholderImages[randomIndex];

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
      note: 'Using placeholder image due to OpenAI billing limit'
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
