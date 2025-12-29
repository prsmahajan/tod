import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week"; // week, month, all
    const limit = parseInt(searchParams.get("limit") || "1");

    let startDate: Date | undefined;
    const now = new Date();

    if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const where: any = {};
    if (startDate) {
      where.createdAt = {
        gte: startDate,
      };
    }

    // Get share counts per animal
    const shares = await prisma.animalShare.groupBy({
      by: ["animalId"],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    if (shares.length === 0) {
      return NextResponse.json({ animals: [] });
    }

    // Get full animal data
    const animalIds = shares.map((s) => s.animalId);
    const animals = await prisma.animal.findMany({
      where: {
        id: {
          in: animalIds,
        },
      },
    });

    // Combine with share counts
    const animalsWithShares = animals.map((animal) => {
      const shareData = shares.find((s) => s.animalId === animal.id);
      return {
        ...animal,
        shareCount: shareData?._count.id || 0,
      };
    });

    // Sort by share count
    animalsWithShares.sort((a, b) => b.shareCount - a.shareCount);

    return NextResponse.json({ animals: animalsWithShares });
  } catch (error: any) {
    console.error("Error fetching most shared animals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch most shared animals" },
      { status: 500 }
    );
  }
}







