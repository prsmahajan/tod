import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { writeFile } from "fs/promises";
import { join } from "path";

// GET all active photos (public) or all photos (admin)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    const isAdmin = user && ["ADMIN", "EDITOR"].includes(user.role);

    const where: any = {};
    // Only show inactive photos to admins if explicitly requested
    if (!isAdmin || !includeInactive) {
      where.isActive = true;
    }

    const photos = await prisma.animalPhoto.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// CREATE new photo (admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;
    const order = formData.get("order") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `animal-${uniqueSuffix}-${file.name.replace(/\s/g, "-")}`;
    const path = join(process.cwd(), "public", "uploads", filename);

    await writeFile(path, buffer);

    const imageUrl = `/uploads/${filename}`;

    // Get the highest order number and increment by 1
    const highestOrder = await prisma.animalPhoto.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Create database record
    const photo = await prisma.animalPhoto.create({
      data: {
        imageUrl,
        caption: caption || null,
        order: order ? parseInt(order) : nextOrder,
        uploadedBy: user.id,
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(photo);
  } catch (error: any) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload photo" },
      { status: 500 }
    );
  }
}
