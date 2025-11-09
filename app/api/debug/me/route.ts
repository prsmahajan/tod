import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not logged in" });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { email: true, name: true, role: true },
  });

  return NextResponse.json({ session, user });
}
