import Hero from "@/components/hero"
import Latest from "@/components/latest"
import SiteFooter from "@/components/site-footer"

// Revalidate every 60 seconds for Vercel (ISR)
export const revalidate = 60;

export default async function DashboardPage() {
  return (
    <main>
      <Hero />
      <Latest />
      <SiteFooter />
    </main>
  );
}

