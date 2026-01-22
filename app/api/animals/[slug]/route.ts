import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

// GET single animal by slug (public)
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const animal = await prisma.animal.findUnique({
      where: { slug: params.slug },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    // Get related animals (same species, excluding current)
    const relatedAnimals = await prisma.animal.findMany({
      where: {
        species: animal.species,
        id: { not: animal.id },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ animal, relatedAnimals });
  } catch (error: any) {
    console.error("Error fetching animal:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch animal" }, { status: 500 });
  }
}

// PUT update animal (admin only)
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR", "AUTHOR"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, species, photoUrl, shortStory, description, status, location, firstSpottedDate, featured } = body;

    // Validate short story length if provided
    if (shortStory && shortStory.length > 200) {
      return NextResponse.json({ error: "Short story must be 200 characters or less" }, { status: 400 });
    }

    // Check if slug is being changed and if new slug exists
    const existing = await prisma.animal.findUnique({
      where: { slug: params.slug },
    });

    if (!existing) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    if (slug && slug !== params.slug) {
      const slugExists = await prisma.animal.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json({ error: "An animal with this slug already exists" }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (species) updateData.species = species.toUpperCase();
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl || null;
    if (shortStory) updateData.shortStory = shortStory;
    if (description) updateData.description = description;
    if (status) updateData.status = status.toUpperCase().replace("-", "_");
    if (location) updateData.location = location;
    if (firstSpottedDate) updateData.firstSpottedDate = new Date(firstSpottedDate);
    if (featured !== undefined) updateData.featured = featured;

    const animal = await prisma.animal.update({
      where: { slug: params.slug },
      data: updateData,
    });

    return NextResponse.json(animal);
  } catch (error: any) {
    console.error("Error updating animal:", error);
    return NextResponse.json({ error: error.message || "Failed to update animal" }, { status: 500 });
  }
}

// DELETE animal (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const animal = await prisma.animal.findUnique({
      where: { slug: params.slug },
    });

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    await prisma.animal.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ message: "Animal deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting animal:", error);
    return NextResponse.json({ error: error.message || "Failed to delete animal" }, { status: 500 });
  }
}







