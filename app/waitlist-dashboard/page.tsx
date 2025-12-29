"use client"

import { useState, useEffect, Suspense } from "react"
import { Copy, Check, Share2, Users, TrendingUp, Heart, Sparkles, ArrowRight } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const TARGET_COUNT = 1000

function WaitlistDashboardContent() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get("code")
  
  const [data, setData] = useState<{
    position: number
    referralCode: string
    referralCount: number
    totalCount: number
    remaining: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!referralCode) {
      setError("No referral code provided. Please use the link from your welcome email.")
      setLoading(false)
      return
    }

    fetchWaitlistData()
  }, [referralCode])

  async function fetchWaitlistData() {
    try {
      const res = await fetch(`/api/waitlist?code=${referralCode}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to load dashboard")
        setLoading(false)
        return
      }

      setData(data)
      setLoading(false)
    } catch (error) {
      setError("Failed to load dashboard. Please try again.")
      setLoading(false)
    }
  }

  function getReferralUrl() {
    if (!data) return ""
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/waitlist?ref=${data.referralCode}`
  }

  async function copyToClipboard() {
    const url = getReferralUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  async function shareLink() {
    const url = getReferralUrl()
    const text = `Join me on The Open Draft waitlist! We're building something special that feeds animals while teaching tech. Be among the first 1,000 Feeders! 🐾`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join The Open Draft Waitlist",
          text,
          url,
        })
      } catch (error) {
        // User cancelled or error occurred
        console.error("Share failed:", error)
      }
    } else {
      // Fallback to copy
      copyToClipboard()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <>
        <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-red-200 dark:border-red-800">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Error</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Failed to load dashboard"}</p>
                <Link href="/waitlist">
                  <Button>Go to Waitlist</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    )
  }

  const progressPercent = Math.min(100, (data.totalCount / TARGET_COUNT) * 100)
  const referralUrl = getReferralUrl()

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12 md:py-20">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <Sparkles className="text-white" size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif text-gray-900 dark:text-white">
              Your Waitlist Dashboard
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Track your position and help us reach 1,000 Feeders!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Position Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Your Position
                </p>
                <p className="text-7xl md:text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  #{data.position}
                </p>
                <p className="text-2xl text-gray-700 dark:text-gray-300 font-semibold">
                  You're Feeder #{data.position.toLocaleString()}!
                </p>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-gray-200 dark:border-gray-700">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Progress to {TARGET_COUNT.toLocaleString()} Feeders
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {data.remaining.toLocaleString()} more to go!
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {data.totalCount.toLocaleString()} of {TARGET_COUNT.toLocaleString()} Feeders
                </p>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <Users className="text-green-600 dark:text-green-400" size={32} />
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {data.referralCount}
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  People You Referred
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep sharing to help us reach 1,000 faster!
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={32} />
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    #{data.position}
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Your Position
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Among the first {data.position.toLocaleString()} Feeders
                </p>
              </div>
            </div>

            {/* Referral Link Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 mb-6 border-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Share Your Referral Link
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Share this link with friends who care about tech and animals. Every referral helps us reach 1,000 faster!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                  value={referralUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant={copied ? "default" : "outline"}
                  className="whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2" size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2" size={18} />
                      Copy
                    </>
                  )}
                </Button>
                {navigator.share && (
                  <Button onClick={shareLink} variant="outline" className="whitespace-nowrap">
                    <Share2 className="mr-2" size={18} />
                    Share
                  </Button>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Tip:</strong> Share on social media, email, or WhatsApp. Every person you refer brings us closer to launching!
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 rounded-2xl p-8 md:p-12 text-white text-center">
              <Heart className="text-white w-16 h-16 mx-auto mb-6 fill-current" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                Help Us Reach 1,000 Faster!
              </h2>
              <p className="text-xl mb-6 font-serif leading-relaxed opacity-95">
                The more people join, the sooner we can start feeding animals. Share your link with 3 friends today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/mission">
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                    Learn About Our Mission <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
                <Link href="/waitlist">
                  <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                    View Waitlist Page
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default function WaitlistDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <WaitlistDashboardContent />
    </Suspense>
  )
}

