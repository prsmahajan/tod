import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

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

    // Filter out local photos in production (when Blob storage is available)
    let filteredPhotos = photos;
    if (process.env.BLOB_READ_WRITE_TOKEN && !isAdmin) {
      // In production, only show Blob URLs (http/https), hide local paths
      filteredPhotos = photos.filter(photo => photo.imageUrl.startsWith('http'));
    }

    return NextResponse.json(filteredPhotos);
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

    // Check file size (3MB max)
    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 3MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob (production) or local filesystem (development)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `animal-${uniqueSuffix}-${file.name.replace(/\s/g, "-")}`;

    let imageUrl: string;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false,
      });
      imageUrl = blob.url;
    } else {
      // Development: Save to local filesystem
      const { writeFile } = await import("fs/promises");
      const { join } = await import("path");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const path = join(process.cwd(), "public", "uploads", filename);
      await writeFile(path, buffer);
      imageUrl = `/uploads/${filename}`;
    }

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
