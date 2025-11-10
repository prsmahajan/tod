import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Get active subscriber count
    const activeSubscribers = await prisma.subscriber.count({
      where: { isActive: true },
    });

    // Calculate impact metrics
    const monthlyRevenue = activeSubscribers * 10; // ₹10 per subscriber
    const mealsPerMonth = Math.floor(monthlyRevenue / 5); // Assume ₹5 per meal
    const animalsHelpedDaily = Math.floor(mealsPerMonth / 30); // Spread across 30 days

    return NextResponse.json({
      subscribers: activeSubscribers,
      monthlyRevenue,
      mealsPerMonth,
      animalsHelpedDaily,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
