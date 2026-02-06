import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support - Subscribe & Feed Stray Animals",
  description: "Choose a subscription plan and directly fund feeding stray animals across India. Starting from just ₹29/week. Every rupee tracked transparently.",
  openGraph: {
    title: "Support | The Open Draft",
    description: "Subscribe and directly feed stray animals across India. Plans starting from ₹29/week.",
    url: "https://theopendraft.com/support",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
