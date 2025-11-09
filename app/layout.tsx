import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Inter, Merriweather, Caveat } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Providers from "@/components/Providers"
import Navbar from "@/components/Navbar"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { ThemeProvider } from "@/components/ThemeProvider"
// import { InitialLoading } from "@/components/initial-loading"
// import { Suspense } from "react"


export const metadata: Metadata = {
  title: "The Open Draft",
  description: "Helping you understand the technology that runs your systems.",
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})
const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ['300', '400', '700'],
})
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} ${caveat.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        <GoogleAnalytics />
      </head>
      <body className="font-sans" style={{ isolation: "isolate" }}>
        {/* <Suspense fallback={<div>Loading...</div>}> */}
          {/* <InitialLoading /> */}
          <ThemeProvider>
            <Providers>
              <Navbar />
              {children}
              <Analytics />
            </Providers>
          </ThemeProvider>
        {/* </Suspense> */}
      </body>
    </html>
  )
}
