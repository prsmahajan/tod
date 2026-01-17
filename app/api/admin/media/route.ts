import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { put, del } from "@vercel/blob";
import { createAuditLog } from "@/lib/audit";

// GET - list all media
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const type = searchParams.get("type");
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    const where: any = {};
    if (type) where.type = type;
    if (folderId) where.folderId = folderId;
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
      ];
    }

    const [media, total] = await Promise.all([
      prisma.mediaLibrary.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          uploader: {
            select: { id: true, name: true, email: true },
          },
          folder: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.mediaLibrary.count({ where }),
    ]);

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST - upload new media
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;
    const alt = formData.get("alt") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine media type
    const mimeType = file.type;
    let type: "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" = "DOCUMENT";
    if (mimeType.startsWith("image/")) type = "IMAGE";
    else if (mimeType.startsWith("video/")) type = "VIDEO";
    else if (mimeType.startsWith("audio/")) type = "AUDIO";

    // Upload to Vercel Blob
    const filename = `media/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const blob = await put(filename, file, {
      access: "public",
    });

    // Get image dimensions if applicable
    let width: number | undefined;
    let height: number | undefined;

    // Create database entry
    const media = await prisma.mediaLibrary.create({
      data: {
        filename,
        originalName: file.name,
        url: blob.url,
        type,
        mimeType,
        size: file.size,
        width,
        height,
        alt,
        caption,
        folderId,
        uploadedById: user.id,
      },
    });

    // Create audit log
    await createAuditLog({
      action: "CREATE",
      entityType: "Media",
      entityId: media.id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        filename: file.name,
        type,
        size: file.size,
      },
      req,
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}

// DELETE - delete media
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Only admins and editors can delete media" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    const media = await prisma.mediaLibrary.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(media.url);
    } catch (blobError) {
      console.error("Failed to delete from blob storage:", blobError);
    }

    // Delete from database
    await prisma.mediaLibrary.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog({
      action: "DELETE",
      entityType: "Media",
      entityId: id,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: {
        filename: media.originalName,
        url: media.url,
      },
      req,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
