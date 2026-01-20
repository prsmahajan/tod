import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // Update if unsubscribed
      if (!existing.isActive) {
        const updated = await prisma.subscriber.update({
          where: { email },
          data: {
            isActive: true,
            name: name || existing.name,
            subscribedAt: new Date(),
            unsubscribedAt: null,
          },
        });
        return NextResponse.json({
          message: 'Resubscribed successfully',
          subscriber: updated,
        });
      }

      return NextResponse.json({
        message: 'Already subscribed',
        subscriber: existing,
      });
    }

    // Create new subscriber
    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        name: name || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'Subscribed successfully',
      subscriber,
    });
  } catch (error: any) {
    console.error('Subscriber error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
