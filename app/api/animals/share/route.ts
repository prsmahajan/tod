import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { animalId, platform } = body;

    if (!animalId || !platform) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = [
      "TWITTER",
      "FACEBOOK",
      "WHATSAPP",
      "INSTAGRAM",
      "LINKEDIN",
      "COPY_LINK",
      "NATIVE",
    ];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    // Verify animal exists
    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal) {
      return NextResponse.json(
        { error: "Animal not found" },
        { status: 404 }
      );
    }

    // Track the share
    await prisma.animalShare.create({
      data: {
        animalId,
        platform: platform as any,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error tracking share:", error);
    return NextResponse.json(
      { error: error.message || "Failed to track share" },
      { status: 500 }
    );
  }
}







