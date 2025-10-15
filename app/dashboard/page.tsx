import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Hero from "@/components/hero"
import SiteHeader from "@/components/site-header";
import Latest from "@/components/latest"
import SiteFooter from "@/components/site-footer"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions); // server-side check
  // redirect("/login") here if you didn't use middleware
  return (
    <main>
      <SiteHeader />
      <Hero />
      <Latest />
      <SiteFooter />
    </main>
  );
}

