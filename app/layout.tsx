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
    default: "The Open Draft - Learn Tech, Feed Stray Animals in India",
    template: "%s | The Open Draft"
  },
  description: "Join The Open Draft - a community initiative combining technology education with animal welfare. Every subscription directly feeds and cares for stray animals across India. Make a real impact today.",
  keywords: [
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
    title: 'The Open Draft - Learn Tech, Feed Stray Animals',
    description: 'Technology education meets animal welfare. Every subscription feeds stray animals across India. Join our community and make a difference.',
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
    title: 'The Open Draft - Learn Tech, Feed Stray Animals',
    description: 'Technology education meets animal welfare. Every subscription feeds stray animals across India.',
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
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
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
