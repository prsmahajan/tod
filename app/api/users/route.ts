import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Client, Users, Query } from "node-appwrite";

// GET all users
export async function GET(req: NextRequest) {
  try {
    const userEmail = req.headers.get("x-user-email");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only admins can view users" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        avatar: true,
        bio: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with Appwrite avatars
    try {
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
        .setKey(process.env.APPWRITE_API_KEY || '');

      const appwriteUsers = new Users(client);

      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          try {
            // Try to find Appwrite user by email
            const appwriteUserList = await appwriteUsers.list([
              Query.equal('email', user.email)
            ]);

            if (appwriteUserList.users.length > 0) {
              const appwriteUser = appwriteUserList.users[0];
              const prefs = appwriteUser.prefs as any;
              
              // Get avatar from Appwrite preferences
              if (prefs?.avatar) {
                return { ...user, avatar: prefs.avatar };
              }
            }
          } catch (error) {
            console.error(`Failed to fetch Appwrite data for ${user.email}:`, error);
          }

          return user;
        })
      );

      return NextResponse.json(enrichedUsers);
    } catch (appwriteError) {
      console.error('Appwrite enrichment failed:', appwriteError);
      // Return users without avatars if Appwrite fails
      return NextResponse.json(users);
    }

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
