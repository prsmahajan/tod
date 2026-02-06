import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Explicitly use the Node.js runtime here so that any
// Node built-ins used by @vercel/blob (like `fs`) are supported.
export const runtime = 'nodejs';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `profile-pictures/${Date.now()}-${file.name}`;

    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production / Vercel: upload to Vercel Blob
      const blob = await put(filename, buffer, {
        access: 'public',
      });
      url = blob.url;
    } else {
      // Local dev: save to /public/uploads so no Blob dev server is needed
      const outputPath = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(outputPath, buffer);
      url = `/uploads/${filename}`;
    }

    return NextResponse.json({
      url,
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
