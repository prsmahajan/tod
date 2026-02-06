import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with The Open Draft team. Questions about subscriptions, volunteering, partnerships, or animal welfare — we're here to help.",
  openGraph: {
    title: "Contact Us | The Open Draft",
    description: "Reach out to The Open Draft team for questions, partnerships, or volunteering opportunities.",
    url: "https://theopendraft.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
