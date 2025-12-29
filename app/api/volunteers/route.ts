import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const volunteerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  area: z.string().min(1, "Area is required"),
  availability: z.string().min(10, "Please provide your availability details"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    // Rate limiting - 3 submissions per 10 minutes per IP
    const ipHeader = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for") ?? "unknown";
    const ip = ipHeader.split(",")[0].trim();

    const { success } = await checkRateLimit(`volunteer:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many submission attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validatedData = volunteerSchema.parse(body);

    // Normalize email - set to null if empty string
    const email = validatedData.email && validatedData.email.trim() !== "" ? validatedData.email.trim().toLowerCase() : null;

    // Create volunteer
    const volunteer = await prisma.volunteer.create({
      data: {
        name: validatedData.name.trim(),
        area: validatedData.area.trim(),
        availability: validatedData.availability.trim(),
        phone: validatedData.phone?.trim() || null,
        email: email,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for volunteering! We'll be in touch soon.",
      volunteer: {
        id: volunteer.id,
        name: volunteer.name,
        area: volunteer.area,
      },
    });
  } catch (error: any) {
    console.error("Error creating volunteer:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to submit volunteer form" },
      { status: 500 }
    );
  }
}

// GET all volunteers (admin only - for future use)
export async function GET(req: Request) {
  try {
    // For now, return empty array - can add admin auth later
    // This endpoint can be used by admin dashboard to view volunteers
    const volunteers = await prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        area: true,
        availability: true,
        phone: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(volunteers);
  } catch (error: any) {
    console.error("Error fetching volunteers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
}







