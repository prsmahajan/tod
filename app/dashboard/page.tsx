import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions); // server-side check
  // redirect("/login") here if you didn't use middleware
  return (
    <main className="p-6">
      <h1 className="text-2xl">Welcome {session?.user?.email}</h1>
      {/* Client-only UI below */}
    </main>
  );
}

