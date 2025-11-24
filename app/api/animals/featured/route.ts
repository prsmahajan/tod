import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const animals = await prisma.animal.findMany({
      where: {
        featured: true,
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        species: true,
        photoUrl: true,
        shortStory: true,
        location: true,
        status: true,
      },
    });

    return NextResponse.json({ animals }, { status: 200 });
  } catch (error) {
    console.error("Error fetching featured animals:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured animals", animals: [] },
      { status: 500 }
    );
  }
}
