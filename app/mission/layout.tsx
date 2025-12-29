import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Mission - Why I Started This | The Open Draft",
  description: "A personal story from Pune about feeding stray animals. Every ₹10 subscription helps feed hungry dogs, cats, and cows. Join the waitlist to be part of this mission.",
}

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

