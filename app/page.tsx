import { Hero } from "@/components/hero"
import { Latest } from "@/components/latest"
import { SiteFooter } from "@/components/site-footer"

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
