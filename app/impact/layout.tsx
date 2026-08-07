import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feeding Updates and Community Support | The Open Draft",
  description: "Verified feeding updates and the current public reporting status for stray animal support.",
  openGraph: {
    title: "Feeding Updates and Community Support | The Open Draft",
    description: "Verified feeding updates and the current public reporting status for stray animal support.",
    url: "https://theopendraft.com/impact",
  },
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
