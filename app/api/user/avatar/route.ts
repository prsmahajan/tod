import { NextRequest, NextResponse } from "next/server";
import { checkRole } from "@/lib/appwrite/auth";
import { Client, Storage, ID, InputFile } from "node-appwrite";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 });
    }

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");

    const storage = new Storage(client);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Appwrite Storage
    const bucketId = process.env.APPWRITE_BUCKET_ID || "animal-photos";
    const fileId = `avatar_${user.id}_${Date.now()}`;

    // Use InputFile.fromBuffer for Node.js environment
    const inputFile = InputFile.fromBuffer(buffer, file.name);

    const uploadedFile = await storage.createFile(
      bucketId,
      fileId,
      inputFile
    );

    // Get file URL
    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

    // Update user avatar in database
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: fileUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: fileUrl,
      message: "Avatar updated successfully",
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
