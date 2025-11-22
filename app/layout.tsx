import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Varta, Dancing_Script, Caveat } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ExitIntentPopup } from "@/components/ExitIntentPopup"
// import { InitialLoading } from "@/components/initial-loading"
// import { Suspense } from "react"


export const metadata: Metadata = {
  title: "The Open Draft",
  description: "Helping you understand the technology that runs your systems.",
}

const varta = Varta({
  subsets: ["latin"],
  variable: "--font-varta",
  weight: ['300', '400', '500', '600', '700'],
})
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  weight: ['400', '500', '600', '700'],
})
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${varta.variable} ${dancingScript.variable} ${caveat.variable} ${GeistMono.variable} antialiased`}
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
                const theme = localStorage.getItem('theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-varta" style={{ isolation: "isolate" }}>
        {/* <Suspense fallback={<div>Loading...</div>}> */}
          {/* <InitialLoading /> */}
          <ThemeProvider>
            <Providers>
              <Navbar />
              {children}
              <ExitIntentPopup />
              <Analytics />
            </Providers>
          </ThemeProvider>
        {/* </Suspense> */}
      </body>
    </html>
  )
}
