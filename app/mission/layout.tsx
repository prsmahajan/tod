import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Story - Ten Months of Stray Animal Feeding",
  description: "The confirmed story behind ten months of personally funded stray animal feeding, plus what TOD publishes today and what is still being prepared.",
}

export default function MissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
