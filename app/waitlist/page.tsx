"use client"

import { useState, useEffect, Suspense } from "react"
import { Heart, CheckCircle2, Star, Users, ArrowRight, Sparkles } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateSEO } from "@/components/SEOHead"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function WaitlistPageContent() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref")
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    city: "",
    referredBy: refCode || "",
  })

  useEffect(() => {
    if (refCode) {
      setFormData(prev => ({ ...prev, referredBy: refCode }))
    }
  }, [refCode])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [position, setPosition] = useState<number | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          city: formData.city || undefined,
          referredBy: formData.referredBy || undefined,
          source: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to join waitlist" })
        setLoading(false)
        return
      }

      setMessage({ 
        type: "success", 
        text: `🎉 Success! You're position #${data.position} on the waitlist!` 
      })
      setPosition(data.position)
      setReferralCode(data.referralCode)
      setFormData({ email: "", name: "", city: "", referredBy: "" })
      setLoading(false)
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
      setLoading(false)
    }
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-12 md:py-20">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <Sparkles className="text-white" size={40} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif text-gray-900 dark:text-white">
              Be Among the First 1,000 Feeders
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Join our exclusive waitlist and become a founding member of a mission that feeds animals while teaching tech.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-blue-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Star className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">First Access</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Be the first to subscribe when we launch. No waiting in line!
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-purple-100 dark:border-purple-900">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Founding Member Badge</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get a special badge on your profile recognizing you as an early supporter.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-green-100 dark:border-green-900">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <Heart className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Help Us Launch Faster</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Every person you refer brings us closer to 1,000 = feeding starts sooner!
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-10 border-2 border-gray-200 dark:border-gray-700">
              {message && message.type === "success" && position && referralCode ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    🎉 You're In!
                  </h2>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6 border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      #{position}
                    </p>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                      You're Feeder #{position.toLocaleString()}!
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Check your email for your welcome message and dashboard link.
                  </p>
                  <Link href={`/waitlist-dashboard?code=${referralCode}`}>
                    <Button size="lg" className="w-full md:w-auto">
                      View Your Dashboard <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
                    Join the Waitlist
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={loading}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Name (Optional)
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={loading}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        City (Optional)
                      </label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Your city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={loading}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="referredBy" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Who told you about us? (Optional)
                      </label>
                      <Input
                        id="referredBy"
                        type="text"
                        placeholder="Friend's name or email"
                        value={formData.referredBy}
                        onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                        disabled={loading}
                        className="w-full"
                      />
                    </div>

                    {message && (
                      <div
                        className={`p-4 rounded-lg ${
                          message.type === "success"
                            ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
                        }`}
                      >
                        {message.text}
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={loading}
                    >
                      {loading ? (
                        "Joining Waitlist..."
                      ) : (
                        <>
                          <Users className="mr-2" size={20} />
                          Join Waitlist
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                🔒 Your information is safe with us. We'll only use it to notify you when we launch.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 rounded-2xl p-8 md:p-12 text-white">
              <Heart className="text-white w-16 h-16 mx-auto mb-6 fill-current" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
                Help Us Reach 1,000 Faster
              </h2>
              <p className="text-xl mb-6 font-serif leading-relaxed opacity-95">
                The more people join, the sooner we can start feeding animals. Share this page with friends who care about tech and animals!
              </p>
              <Link href="/mission">
                <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Learn About Our Mission <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <WaitlistPageContent />
    </Suspense>
  )
}

