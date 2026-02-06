import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token is for this email
    if (verificationToken.email !== email) {
      return NextResponse.json(
        { error: 'Token does not match email' },
        { status: 400 }
      );
    }

    // Check if already used
    if (verificationToken.usedAt) {
      return NextResponse.json(
        { error: 'This verification link has already been used' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > verificationToken.expiresAt) {
      return NextResponse.json(
        { error: 'Verification link has expired' },
        { status: 400 }
      );
    }

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    // Update user's emailVerified field
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return NextResponse.json({
      message: 'Email verified successfully',
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify email' },
      { status: 500 }
    );
  }
}
