import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feeding Updates and Community Support | The Open Draft",
  description: "Verified feeding updates and confirmed community support for stray animals.",
  openGraph: {
    title: "Feeding Updates and Community Support | The Open Draft",
    description: "Verified feeding updates and confirmed community support for stray animals.",
    url: "https://theopendraft.com/impact",
  },
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
