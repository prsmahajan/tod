import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mail';
import { createHash, randomBytes } from 'crypto';
import { getAuthenticatedUser } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const user = await getAuthenticatedUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all unverified users
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null,
      },
      select: {
        email: true,
        name: true,
      },
    });

    if (unverifiedUsers.length === 0) {
      return NextResponse.json({
        message: 'No unverified users found',
        sent: 0,
        failed: 0,
        total: 0,
      });
    }

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theopendraft.com';

    for (const user of unverifiedUsers) {
      try {
        // Generate secure token
        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');

        // Delete existing unused tokens
        await prisma.emailVerificationToken.deleteMany({
          where: {
            email: user.email,
            usedAt: null,
          },
        });

        // Create new token (expires in 7 days)
        await prisma.emailVerificationToken.create({
          data: {
            email: user.email,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        // Create verification URL
        const verificationUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(user.email)}`;

        // Send email via Resend
        await sendVerificationEmail(user.email, verificationUrl);
        sent++;
        
        console.log(`✅ Sent verification to ${user.email}`);

        // Add delay to avoid rate limiting (500ms between emails)
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        failed++;
        errors.push(`${user.email}: ${error.message}`);
        console.error(`❌ Failed to send to ${user.email}:`, error.message);
        
        // If rate limited, add longer delay
        if (error.message.includes('rate') || error.message.includes('limit')) {
          console.log('⏳ Rate limited, waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    return NextResponse.json({
      message: `Sent ${sent} verification emails`,
      sent,
      failed,
      total: unverifiedUsers.length,
      errors: errors.slice(0, 10), // Only return first 10 errors
    });

  } catch (error: any) {
    console.error('Bulk verification send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification emails' },
      { status: 500 }
    );
  }
}
