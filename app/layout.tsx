import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Inter, Manrope, DM_Sans } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import Providers from "@/components/Providers"
import Header from "@/components/Header"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ExitIntentPopup } from "@/components/ExitIntentPopup"
import Chatbot from "@/components/Chatbot"
import ThemeSwitcher from "@/components/ThemeSwitcher"

export const metadata: Metadata = {
  title: "The Open Draft - Learn Tech, Feed Animals",
  description: "Technology education meets animal welfare. Every subscription feeds stray animals across India.",
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
    <ClerkProvider>
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
          {/* <Suspense fallback={<div>Loading...</div>}> */}
            {/* <InitialLoading /> */}
            <a href="#main-content" className="skip-to-main">
              Skip to main content
            </a>
            <ThemeProvider>
              <Providers>
                <Header />
                <main id="main-content">
                  {children}
                </main>
                <ExitIntentPopup />
                <Chatbot />
                <ThemeSwitcher isFixed={true} />
                <Analytics />
              </Providers>
            </ThemeProvider>
          {/* </Suspense> */}
        </body>
      </html>
    </ClerkProvider>
  )
}
