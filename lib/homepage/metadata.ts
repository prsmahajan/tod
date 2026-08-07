import type { Metadata } from "next";
import { ROOT_METADATA_COPY } from "./content";

export function buildRootMetadata(): Metadata {
  return {
    metadataBase: new URL("https://theopendraft.com"),
    title: {
      default: ROOT_METADATA_COPY.title,
      template: "%s | The Open Draft (TOD)",
    },
    description: ROOT_METADATA_COPY.description,
    keywords: [...ROOT_METADATA_COPY.keywords],
    authors: [{ name: "The Open Draft Team" }],
    creator: "The Open Draft",
    publisher: "The Open Draft",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: "https://theopendraft.com",
      siteName: "The Open Draft",
      title: ROOT_METADATA_COPY.openGraphTitle,
      description: ROOT_METADATA_COPY.openGraphDescription,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: ROOT_METADATA_COPY.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ROOT_METADATA_COPY.openGraphTitle,
      description: ROOT_METADATA_COPY.openGraphDescription,
      images: ["/og-image.png"],
      creator: "@theopendraft",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "./",
    },
    category: "nonprofit",
  };
}
