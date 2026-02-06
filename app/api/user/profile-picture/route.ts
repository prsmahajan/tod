import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `profile-pictures/${timestamp}-${sanitizedFilename}`;

    let url: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: upload to Vercel Blob
      try {
        const blob = await put(filename, buffer, {
          access: 'public',
          contentType: file.type,
        });
        url = blob.url;
      } catch (blobError: any) {
        console.error('Vercel Blob upload error:', blobError);
        return NextResponse.json(
          { 
            error: 'Failed to upload to storage', 
            details: blobError.message,
            hint: 'Check BLOB_READ_WRITE_TOKEN is set in Vercel environment variables'
          },
          { status: 500 }
        );
      }
    } else {
      // Local dev: save to /public/uploads/profile-pictures/
      try {
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-pictures');
        
        // Create directory if it doesn't exist
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        const localFilename = `${timestamp}-${sanitizedFilename}`;
        const outputPath = join(uploadsDir, localFilename);
        await writeFile(outputPath, buffer);
        url = `/uploads/profile-pictures/${localFilename}`;
      } catch (fsError: any) {
        console.error('Local file system error:', fsError);
        return NextResponse.json(
          { 
            error: 'Failed to save file locally', 
            details: fsError.message 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      url,
      message: 'Profile picture uploaded successfully',
    });
  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
