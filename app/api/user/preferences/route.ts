import { NextRequest, NextResponse } from 'next/server';
import { Account, Client } from 'node-appwrite';

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

    // Update user preferences
    await account.updatePrefs({
      avatar,
    });

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
