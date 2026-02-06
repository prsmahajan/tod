import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Inter, Manrope, DM_Sans } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"
import { PublicLayoutWrapper } from "@/components/PublicLayoutWrapper"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from "@/lib/appwrite/auth"
import { ThemedToaster } from "@/components/ui/themed-toast"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F1' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://theopendraft.com'),
  title: {
    default: "The Open Draft (TOD) - Learn Tech, Feed Stray Animals in India",
    template: "%s | The Open Draft (TOD)"
  },
  description: "The Open Draft (todr.in) — a community initiative combining technology education with animal welfare. Every subscription directly feeds and cares for stray animals across India. Visit todr.in to make a real impact today.",
  keywords: [
    "todr",
    "todr.in",
    "the open draft",
    "theopendraft",
    "stray animals India",
    "feed stray dogs",
    "feed stray cats",
    "animal welfare India",
    "donate for animals",
    "help stray animals",
    "animal charity India",
    "technology education",
    "learn to code",
    "community initiative",
    "animal rescue",
    "pet adoption India",
    "volunteer for animals",
    "animal NGO India",
    "stray dog feeding",
    "animal shelter India"
  ],
  authors: [{ name: "The Open Draft Team" }],
  creator: "The Open Draft",
  publisher: "The Open Draft",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://theopendraft.com',
    siteName: 'The Open Draft',
    title: 'The Open Draft (TOD) - Learn Tech, Feed Stray Animals',
    description: 'The Open Draft (todr.in) — Technology education meets animal welfare. Every subscription feeds stray animals across India. Join our community.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Open Draft - Learn Tech, Feed Animals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Open Draft (TOD) - Learn Tech, Feed Stray Animals',
    description: 'The Open Draft (todr.in) — Technology education meets animal welfare. Every subscription feeds stray animals across India.',
    images: ['/og-image.png'],
    creator: '@theopendraft',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://theopendraft.com',
    languages: {
      'en': 'https://todr.in',
    },
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  // Add your Google Search Console verification code here
  // verification: {
  //   google: 'your-actual-verification-code',
  // },
  category: 'nonprofit',
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ['400', '500', '700'],
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ['400', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ['400', '500', '700'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${dmSans.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        <GoogleAnalytics />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="The Open Draft RSS Feed"
          href="/feed.xml"
        />
        {/* JSON-LD Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "The Open Draft",
              "alternateName": ["TOD", "todr.in", "The Open Draft"],
              "url": "https://theopendraft.com",
              "logo": "https://theopendraft.com/images/logo-dark.png",
              "description": "A community initiative combining technology education with animal welfare. Every subscription directly feeds and cares for stray animals across India. Also available at todr.in.",
              "sameAs": [
                "https://todr.in"
              ],
              "foundingDate": "2025",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "url": "https://theopendraft.com/contact"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "The Open Draft",
              "alternateName": ["TOD", "todr.in"],
              "url": "https://theopendraft.com",
              "description": "The Open Draft (todr.in) - Learn Tech, Feed Stray Animals in India",
              "publisher": {
                "@type": "Organization",
                "name": "The Open Draft",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://theopendraft.com/images/logo-dark.png"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://theopendraft.com/articles?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'off-white';
                const validThemes = ['off-white', 'lavender', 'black'];
                if (validThemes.includes(theme)) {
                  document.documentElement.classList.add(theme);
                } else {
                  document.documentElement.classList.add('off-white');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-body" style={{ isolation: "isolate" }}>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <AuthProvider>
          <ThemeProvider>
            <Providers>
              <PublicLayoutWrapper />
              <main id="main-content">
                {children}
              </main>
              <ThemedToaster />
              <Analytics />
            </Providers>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
