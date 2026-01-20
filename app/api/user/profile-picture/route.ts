import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`profile-pictures/${Date.now()}-${file.name}`, file, {
      access: 'public',
    });

    return NextResponse.json({
      url: blob.url,
      message: 'Profile picture uploaded successfully',
    });
  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}
