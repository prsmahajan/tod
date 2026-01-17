import { prisma } from "@/lib/db";
import { AuditAction, UserRole } from "@prisma/client";

interface CreateAuditLogParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  details?: Record<string, any>;
  req?: Request;
}

export async function createAuditLog({
  action,
  entityType,
  entityId,
  userId,
  userEmail,
  userRole,
  details,
  req,
}: CreateAuditLogParams) {
  try {
    // Extract IP and user agent from request if available
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (req) {
      // Try to get real IP from various headers
      ipAddress =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        req.headers.get("cf-connecting-ip") ||
        undefined;

      userAgent = req.headers.get("user-agent") || undefined;
    }

    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        userEmail,
        userRole,
        details: details || {},
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging should never break the main operation
    console.error("Failed to create audit log:", error);
  }
}

// Helper function to create version for a post
export async function createPostVersion({
  postId,
  post,
  userId,
  changeNote,
}: {
  postId: string;
  post: {
    title: string;
    content: string;
    contentMarkdown?: string | null;
    excerpt?: string | null;
    coverImage?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    keywords?: string[];
  };
  userId: string;
  changeNote?: string;
}) {
  try {
    // Get the current highest version number for this post
    const latestVersion = await prisma.postVersion.findFirst({
      where: { postId },
      orderBy: { versionNumber: "desc" },
    });

    const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;

    await prisma.postVersion.create({
      data: {
        postId,
        versionNumber: nextVersionNumber,
        title: post.title,
        content: post.content,
        contentMarkdown: post.contentMarkdown,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        keywords: post.keywords || [],
        changeNote,
        createdById: userId,
      },
    });

    return nextVersionNumber;
  } catch (error) {
    console.error("Failed to create post version:", error);
    return null;
  }
}
