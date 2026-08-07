"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { usePathname } from "next/navigation"
import { createPageViewTracker } from "@/lib/analytics/page-views"

export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const pathname = usePathname()
  const [analyticsReady, setAnalyticsReady] = useState(false)
  const [trackPageView] = useState(createPageViewTracker)

  useEffect(() => {
    if (analyticsReady) trackPageView(pathname)
  }, [analyticsReady, pathname, trackPageView])

  if (!gaId) {
    return null
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        onReady={() => setAnalyticsReady(true)}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = function(){window.dataLayer.push(arguments);};
            window.gtag('js', new Date());
            window.gtag('config', '${gaId}', {
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
              send_page_view: false,
              page_location: window.location.origin + window.location.pathname,
              page_referrer: ''
            });
          `,
        }}
      />
    </>
  )
}
