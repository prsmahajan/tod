import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";

// UPDATE photo (admin only)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json();
    const { caption, order, isActive } = body;

    const photo = await prisma.animalPhoto.update({
      where: { id: params.id },
      data: {
        caption: caption !== undefined ? caption : undefined,
        order: order !== undefined ? parseInt(order) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        uploader: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(photo);
  } catch (error: any) {
    console.error("Photo update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update photo" },
      { status: 500 }
    );
  }
}

// DELETE photo (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Get the photo first to delete the file
    const photo = await prisma.animalPhoto.findUnique({
      where: { id: params.id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete the file from Vercel Blob (production) or local filesystem (development)
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN && photo.imageUrl.startsWith("http")) {
        // Production: Delete from Vercel Blob
        await del(photo.imageUrl);
      } else {
        // Development: Delete from local filesystem
        const { unlink } = await import("fs/promises");
        const { join } = await import("path");
        const filePath = join(process.cwd(), "public", photo.imageUrl);
        await unlink(filePath);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      // Continue even if file deletion fails
    }

    // Delete the database record
    await prisma.animalPhoto.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Photo deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete photo" },
      { status: 500 }
    );
  }
}
