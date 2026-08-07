import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Stray Animal Feeding",
  description: "Make a one-time contribution or choose recurring support. Confirmed contributions and approved feeding updates are published while expense reconciliation is being prepared.",
  openGraph: {
    title: "Support | The Open Draft",
    description: "Contribute without creating an account and see approved stray animal feeding updates.",
    url: "https://theopendraft.com/support",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
