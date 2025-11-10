import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // File size validation (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // File type validation (images only)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, GIF, WebP) are allowed" },
        { status: 400 }
      );
    }

    // Sanitize filename - remove special characters and limit length
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "-")
      .replace(/\.+/g, ".")
      .substring(0, 100);

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `upload-${uniqueSuffix}-${sanitizedName}`;

    let imageUrl: string;

    // Check if Vercel Blob is configured (production) or use local storage (development)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Production: Upload to Vercel Blob storage
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: false,
      });
      imageUrl = blob.url;
    } else {
      // Development: Save to local filesystem
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const path = join(process.cwd(), "public", "uploads", filename);
      await writeFile(path, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
