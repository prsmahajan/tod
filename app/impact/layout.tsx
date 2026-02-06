import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Impact - See How Your Support Helps Animals",
  description: "Track the real impact of The Open Draft community. See how many animals have been fed, how much has been raised, and the stories of lives changed through your support.",
  openGraph: {
    title: "Our Impact | The Open Draft",
    description: "Real-time impact tracking. See how community contributions feed and care for stray animals across India.",
    url: "https://theopendraft.com/impact",
  },
};

export default function ImpactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
