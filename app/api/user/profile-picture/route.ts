import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Client, Storage, ID } from 'node-appwrite';

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
    const filename = `${timestamp}-${sanitizedFilename}`;

    let url: string;

    // Try Vercel Blob first (if configured)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Using Vercel Blob storage');
      try {
        const blob = await put(`profile-pictures/${filename}`, buffer, {
          access: 'public',
          contentType: file.type,
        });
        url = blob.url;
        console.log('Vercel Blob upload successful:', url);
        
        return NextResponse.json({
          url,
          message: 'Profile picture uploaded successfully',
          storage: 'vercel-blob',
        });
      } catch (blobError: any) {
        console.error('Vercel Blob upload failed, falling back to Appwrite:', blobError.message);
        // Fall through to Appwrite fallback
      }
    }

    // Fallback to Appwrite Storage (if in production/server environment)
    if (process.env.APPWRITE_API_KEY) {
      console.log('Using Appwrite Storage');
      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
          .setKey(process.env.APPWRITE_API_KEY);

        const storage = new Storage(client);
        
        // Upload to Appwrite Storage
        const appwriteFile = await storage.createFile(
          'user-uploads', // bucket ID
          ID.unique(),
          new File([buffer], filename, { type: file.type })
        );

        // Get file URL
        const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/user-uploads/files/${appwriteFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
        
        console.log('Appwrite Storage upload successful:', fileUrl);
        
        return NextResponse.json({
          url: fileUrl,
          message: 'Profile picture uploaded successfully',
          storage: 'appwrite',
        });
      } catch (appwriteError: any) {
        console.error('Appwrite Storage upload failed:', appwriteError);
        // Fall through to local storage
      }
    }

    // Final fallback: Local file system (dev only)
    console.log('Using local file storage');
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profile-pictures');
      
      // Create directory if it doesn't exist
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const outputPath = join(uploadsDir, filename);
      await writeFile(outputPath, buffer);
      url = `/uploads/profile-pictures/${filename}`;
      
      return NextResponse.json({
        url,
        message: 'Profile picture uploaded successfully',
        storage: 'local',
      });
    } catch (fsError: any) {
      console.error('Local file system error:', fsError);
      return NextResponse.json(
        { 
          error: 'All storage methods failed', 
          details: fsError.message,
          hint: 'Set up either Vercel Blob or ensure Appwrite Storage is configured'
        },
        { status: 500 }
      );
    }
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
