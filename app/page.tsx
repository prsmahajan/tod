import Hero from "@/components/hero"
import { Latest } from "@/components/latest"
import { SiteFooter } from "@/components/site-footer"
import { generateSEO } from "@/components/SEOHead"

export const metadata = generateSEO({
  title: "The Open Draft - Tech Explained Simply, Animals Fed Compassionately",
  description: "Learn technology in simple terms while helping feed stray animals across India. Every ₹10 subscription = meals for hungry dogs, cats, and cows. Join our mission.",
  url: "/",
});

export default function Page() {
  return (
    <>
      <main className="container mx-auto px-4">
        <Hero />
        <Latest />
      </main>
      <SiteFooter />
    </>
  )
}
