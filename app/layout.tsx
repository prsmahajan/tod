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
import { ROOT_METADATA_COPY } from "@/lib/homepage/content"
import { buildRootMetadata } from "@/lib/homepage/metadata"

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F7F1' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export const metadata: Metadata = buildRootMetadata()

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
              "description": ROOT_METADATA_COPY.description,
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
              "description": ROOT_METADATA_COPY.openGraphDescription,
              "publisher": {
                "@type": "Organization",
                "name": "The Open Draft",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://theopendraft.com/images/logo-dark.png"
                }
              },
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
