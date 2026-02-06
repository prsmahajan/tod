import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mail';
import { createHash, randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Delete any existing unused tokens for this email
    await prisma.emailVerificationToken.deleteMany({
      where: {
        email,
        usedAt: null,
      },
    });

    // Create new token (expires in 24 hours)
    await prisma.emailVerificationToken.create({
      data: {
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Create verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theopendraft.com';
    const verificationUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    await sendVerificationEmail(email, verificationUrl);

    return NextResponse.json({
      message: 'Verification email sent successfully',
    });
  } catch (error: any) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
