import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Inter, Merriweather, Caveat, Roboto, Open_Sans, Lato, Playfair_Display, Poppins, Montserrat } from "next/font/google"
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
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ['300', '400', '500', '700'],
})
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
})
const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ['300', '400', '700'],
})
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ['300', '400', '500', '600', '700'],
})
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} ${caveat.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${playfair.variable} ${poppins.variable} ${montserrat.variable} ${GeistMono.variable} antialiased`}
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
              <ExitIntentPopup />
              <Analytics />
            </Providers>
          </ThemeProvider>
        {/* </Suspense> */}
      </body>
    </html>
  )
}
