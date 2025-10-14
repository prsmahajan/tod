import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import "./globals.css"
import { InitialLoading } from "@/components/initial-loading"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "The Open Draft",
  description: "Helping you understand the technology that runs your systems.",
}

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
})
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: '400',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="font-sans">
        <Suspense fallback={<div>Loading...</div>}>
          <InitialLoading />
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
