import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/admin/volunteers/invite - Send invitation to become a volunteer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, name, role, message } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["ADMIN", "EDITOR", "AUTHOR"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // If user exists but is a subscriber, we can upgrade them
      if (existingUser.role === "SUBSCRIBER") {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { role },
        });

        // Log the action
        await prisma.auditLog.create({
          data: {
            action: "VOLUNTEER_PROMOTED",
            entityType: "User",
            entityId: existingUser.id,
            userId: session.user.email || "admin",
            details: {
              newRole: role,
              promotedBy: session.user.email,
            },
          },
        });

        // Send notification email
        try {
          await resend.emails.send({
            from: "tod <noreply@todanimal.com>",
            to: email,
            subject: "You've been invited to volunteer at tod!",
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Welcome to the tod volunteer team!</h1>
                <p>Hi ${name || existingUser.name},</p>
                <p>You've been upgraded to a <strong>${role.toLowerCase()}</strong> on tod!</p>
                ${message ? `<p><em>"${message}"</em></p>` : ""}
                <p>As a ${role.toLowerCase()}, you can now:</p>
                <ul>
                  ${role === "AUTHOR" ? "<li>Create and manage your own articles</li>" : ""}
                  ${role === "EDITOR" ? "<li>Edit and publish all articles</li><li>Manage categories and tags</li>" : ""}
                  ${role === "ADMIN" ? "<li>Full access to all features</li><li>Manage other users</li>" : ""}
                </ul>
                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://todanimal.com"}/admin"
                     style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 8px;">
                    Go to Admin Dashboard
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">Thank you for helping us feed stray animals!</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Email send error:", emailError);
          // Don't fail the request if email fails
        }

        return NextResponse.json({
          success: true,
          message: "User has been upgraded to volunteer",
          user: {
            id: existingUser.id,
            email: existingUser.email,
            role,
          },
        });
      } else {
        return NextResponse.json(
          { error: "User already has volunteer privileges" },
          { status: 400 }
        );
      }
    }

    // User doesn't exist - create an invitation record and send email
    // For now, we'll create a pending invitation that the user can accept when signing up

    // Store invitation in database (using a simple approach with AuditLog)
    await prisma.auditLog.create({
      data: {
        action: "VOLUNTEER_INVITATION_SENT",
        entityType: "Invitation",
        entityId: email.toLowerCase(),
        userId: session.user.email || "admin",
        details: {
          invitedEmail: email.toLowerCase(),
          invitedName: name,
          invitedRole: role,
          message,
          invitedBy: session.user.email,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        },
      },
    });

    // Send invitation email
    try {
      await resend.emails.send({
        from: "tod <noreply@todanimal.com>",
        to: email,
        subject: "You're invited to volunteer at tod!",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">You're invited to join tod!</h1>
            <p>Hi ${name || "there"},</p>
            <p>You've been invited to become a <strong>${role.toLowerCase()}</strong> at tod - a platform dedicated to feeding stray animals.</p>
            ${message ? `<p style="padding: 16px; background: #f5f5f5; border-radius: 8px;"><em>"${message}"</em></p>` : ""}
            <p>As a ${role.toLowerCase()}, you'll be able to:</p>
            <ul>
              ${role === "AUTHOR" ? "<li>Create and manage your own articles</li><li>Share stories about feeding animals</li>" : ""}
              ${role === "EDITOR" ? "<li>Edit and publish all articles</li><li>Help curate content for our community</li>" : ""}
              ${role === "ADMIN" ? "<li>Full access to all platform features</li><li>Help manage the volunteer team</li>" : ""}
            </ul>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://todanimal.com"}/signup?invite=volunteer&role=${role}&email=${encodeURIComponent(email)}"
                 style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 8px;">
                Accept Invitation
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #999; font-size: 12px;">
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return NextResponse.json(
        { error: "Failed to send invitation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Invitation error:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
