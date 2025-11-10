import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const count = await prisma.subscriber.count({
      where: { isActive: true },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to get subscriber count:", error);
    return NextResponse.json({ count: 0 });
  }
}
