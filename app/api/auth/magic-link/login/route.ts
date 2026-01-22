import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Account, Client } from "appwrite";

export const runtime = "nodejs";

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

const account = new Account(client);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { verifyCode } = body;

    if (!verifyCode || typeof verifyCode !== "string") {
      return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
    }

    // Find token with this verification code
    const tokenRecord = await prisma.magicLinkToken.findUnique({
      where: { verifyCode },
    });

    // Verify the code exists, was used, and hasn't expired
    if (!tokenRecord) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 });
    }

    if (!tokenRecord.usedAt) {
      return NextResponse.json({ error: "Token not verified" }, { status: 401 });
    }

    if (!tokenRecord.verifyExpiresAt || tokenRecord.verifyExpiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 401 });
    }

    // Check that token was used recently (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (tokenRecord.usedAt < fiveMinutesAgo) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 401 });
    }

    const email = tokenRecord.email;

    // Check if user exists in Appwrite by trying to get their account
    // Note: This requires the user to have an Appwrite account
    // If they don't, we'll need to create one or handle it differently
    try {
      // For magic link, we need to create a session
      // Since Appwrite doesn't support passwordless login directly,
      // we'll need to check if the user has an Appwrite account
      // If not, we might need to create one with a temporary password
      // or use a different approach
      
      // For now, let's return success and let the client handle the session
      // The user should already have an Appwrite account if they signed up
      return NextResponse.json({
        ok: true,
        email: email,
        message: "Magic link verified. Please sign in with your password.",
      });
    } catch (error: any) {
      console.error("Magic link login error:", error);
      return NextResponse.json(
        { error: "Failed to complete magic link login" },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("MAGIC_LINK_LOGIN_ERROR →", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
