import { NextRequest, NextResponse } from 'next/server';
import { Account, Client } from 'node-appwrite';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = request.cookies.get('session');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { avatar } = await request.json();

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar URL is required' }, { status: 400 });
    }

    // Initialize Appwrite client
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

    // Set the session from cookie
    client.setSession(session.value);

    const account = new Account(client);

    // Get current user to get their email
    const currentUser = await account.get();

    // Update user preferences in Appwrite
    await account.updatePrefs({
      avatar,
    });

    // SYNC TO POSTGRESQL - Save avatar to database so CMS can see it
    if (currentUser.email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: currentUser.email.toLowerCase() },
        });

        if (dbUser) {
          await prisma.user.update({
            where: { email: currentUser.email.toLowerCase() },
            data: { avatar },
          });
          console.log('✅ Avatar synced to PostgreSQL for:', currentUser.email);
        } else {
          console.warn('⚠️ User not found in PostgreSQL database:', currentUser.email);
          console.log('Avatar saved to Appwrite prefs only');
        }
      } catch (dbError) {
        console.error('❌ Failed to sync avatar to PostgreSQL:', dbError);
        // Don't fail the request if DB sync fails - Appwrite update succeeded
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully',
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
