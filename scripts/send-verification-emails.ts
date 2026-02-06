/**
 * Send verification emails to all unverified users
 * 
 * Usage:
 *   npx tsx scripts/send-verification-emails.ts
 */

import { prisma } from '../lib/db';
import { sendVerificationEmail } from '../lib/mail';
import { createHash, randomBytes } from 'crypto';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function sendVerificationEmails() {
  try {
    console.log('🔍 Finding unverified users...\n');

    // Find all users without emailVerified
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    console.log(`Found ${unverifiedUsers.length} unverified users\n`);

    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are verified!');
      return;
    }

    console.log('📧 Sending verification emails...\n');

    let sent = 0;
    let failed = 0;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://theopendraft.com';

    for (const user of unverifiedUsers) {
      try {
        // Generate secure token
        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');

        // Delete any existing unused tokens for this email
        await prisma.emailVerificationToken.deleteMany({
          where: {
            email: user.email,
            usedAt: null,
          },
        });

        // Create new token (expires in 7 days for bulk send)
        await prisma.emailVerificationToken.create({
          data: {
            email: user.email,
            tokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });

        // Create verification URL
        const verificationUrl = `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(user.email)}`;

        // Send email via Resend
        await sendVerificationEmail(user.email, verificationUrl);

        console.log(`✅ ${user.email} (${user.name})`);
        sent++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error: any) {
        console.log(`❌ ${user.email} - ${error.message}`);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Sent: ${sent}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${unverifiedUsers.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

sendVerificationEmails();
