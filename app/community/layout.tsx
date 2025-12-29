import { generateSEO } from "@/components/SEOHead"
import { Metadata } from "next"

export const metadata: Metadata = generateSEO({
  title: "Join Our Community - The Open Draft",
  description: "Join our WhatsApp community to stay updated on launch and help feed animals in Pune. Volunteer to make a difference in your area.",
  url: "/community",
})

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}







