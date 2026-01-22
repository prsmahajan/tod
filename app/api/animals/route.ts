import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from "@/lib/db";

// GET all animals (public, with optional filters)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const species = searchParams.get("species");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "newest";

    const where: any = {};

    if (species) {
      where.species = species.toUpperCase();
    }

    if (status) {
      where.status = status.toUpperCase().replace("-", "_");
    }

    if (featured === "true") {
      where.featured = true;
    }

    let animals;
    
    if (sort === "newest") {
      animals = await prisma.animal.findMany({
        where,
        orderBy: { firstSpottedDate: "desc" },
      });
    } else if (sort === "most-urgent") {
      // Most urgent = HUNGRY status first, then by date
      // Fetch all and sort in memory since Prisma doesn't support custom enum ordering
      const allAnimals = await prisma.animal.findMany({
        where,
        orderBy: { firstSpottedDate: "desc" },
      });
      
      // Sort by status priority: HUNGRY > FED_TODAY > RESCUED > ADOPTED
      const statusPriority: Record<string, number> = {
        HUNGRY: 0,
        FED_TODAY: 1,
        RESCUED: 2,
        ADOPTED: 3,
      };
      
      animals = allAnimals.sort((a: any, b: any) => {
        const priorityA = statusPriority[a.status] ?? 99;
        const priorityB = statusPriority[b.status] ?? 99;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return new Date(b.firstSpottedDate).getTime() - new Date(a.firstSpottedDate).getTime();
      });
    } else {
      animals = await prisma.animal.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(animals);
  } catch (error: any) {
    console.error("Error fetching animals:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch animals" }, { status: 500 });
  }
}

// POST create new animal (admin only)
export async function POST(req: NextRequest) {
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

    // Validate required fields
    if (!name || !slug || !species || !shortStory || !description || !status || !location || !firstSpottedDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate short story length
    if (shortStory.length > 200) {
      return NextResponse.json({ error: "Short story must be 200 characters or less" }, { status: 400 });
    }

    // Validate species
    const validSpecies = ["DOG", "CAT", "COW", "PIGEON", "BULL"];
    if (!validSpecies.includes(species.toUpperCase())) {
      return NextResponse.json({ error: "Invalid species" }, { status: 400 });
    }

    // Validate status
    const validStatuses = ["HUNGRY", "FED_TODAY", "RESCUED", "ADOPTED"];
    if (!validStatuses.includes(status.toUpperCase().replace("-", "_"))) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.animal.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json({ error: "An animal with this slug already exists" }, { status: 400 });
    }

    const animal = await prisma.animal.create({
      data: {
        name,
        slug,
        species: species.toUpperCase() as any,
        photoUrl: photoUrl || null,
        shortStory,
        description,
        status: status.toUpperCase().replace("-", "_") as any,
        location,
        firstSpottedDate: new Date(firstSpottedDate),
        featured: featured || false,
      },
    });

    return NextResponse.json(animal);
  } catch (error: any) {
    console.error("Error creating animal:", error);
    return NextResponse.json({ error: error.message || "Failed to create animal" }, { status: 500 });
  }
}

