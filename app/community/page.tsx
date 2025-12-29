"use client"

import { useState } from "react"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MessageCircle, Users, Heart, MapPin, ExternalLink, CheckCircle2 } from "lucide-react"

export default function CommunityPage() {
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    availability: "",
    phone: "",
    email: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const whatsappJoinLink = "https://chat.whatsapp.com/YOUR_INVITE_LINK"
  const whatsappQRCode = "/placeholder.svg"

  async function handleVolunteerSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to submit volunteer form" })
        setLoading(false)
        return
      }

      setMessage({ type: "success", text: "Thank you for volunteering! We'll be in touch soon." })
      setFormData({
        name: "",
        area: "",
        availability: "",
        phone: "",
        email: "",
      })
      setLoading(false)
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
      setLoading(false)
    }
  }

  const puneAreas = [
    "Kothrud",
    "Hinjewadi",
    "Baner",
    "Aundh",
    "Viman Nagar",
    "Koregaon Park",
    "Hadapsar",
    "Wakad",
    "Pimpri-Chinchwad",
    "Shivajinagar",
    "Deccan",
    "Karve Nagar",
    "Warje",
    "Katraj",
    "Other",
  ]

  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-semibold text-black leading-tight mb-4">
                Join Our Community
              </h1>
              <p className="text-base text-[#212121] max-w-2xl mx-auto">
                Connect with like-minded people, stay updated on our launch, and help feed animals in Pune.
              </p>
            </div>
          </div>
        </section>

        {/* WhatsApp Community Section */}
        <section className="py-16 px-4 bg-[#FAFAFA]">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white border border-[#E5E5E5] p-8">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="text-[#DC2626]" size={28} />
                <h2 className="text-2xl font-semibold text-black">WhatsApp Community</h2>
              </div>
              <p className="text-base text-[#212121] mb-8">
                Join our WhatsApp group to stay updated on launch, share stories, and connect with the community.
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-6 border border-[#E5E5E5] mb-4">
                    <img
                      src={whatsappQRCode}
                      alt="WhatsApp Community QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <p className="text-sm text-[#212121] text-center">
                    Scan with WhatsApp to join
                  </p>
                </div>

                {/* Join Link & Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-black">
                      Join to Stay Updated on Launch
                    </h3>
                    <p className="text-[#212121] mb-4">
                      Be the first to know when subscriptions go live. Get updates on animals we're feeding, 
                      see photos and videos, and connect with others who care.
                    </p>
                    <Button
                      asChild
                      className="w-full bg-[#DC2626] text-white hover:opacity-80"
                      size="lg"
                    >
                      <a href={whatsappJoinLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="mr-2" size={20} />
                        Join WhatsApp Community
                        <ExternalLink className="ml-2" size={16} />
                      </a>
                    </Button>
                  </div>

                  {/* Community Guidelines */}
                  <div className="bg-[#FAFAFA] border border-[#E5E5E5] p-6">
                    <h4 className="font-semibold mb-3 text-black flex items-center gap-2">
                      <CheckCircle2 className="text-[#DC2626]" size={20} />
                      Community Guidelines
                    </h4>
                    <ul className="space-y-2 text-sm text-[#212121]">
                      <li className="flex items-start gap-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>Be respectful and kind to all members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>Share stories and photos of animals you encounter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>No spam or promotional content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>Help coordinate feeding efforts in your area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#DC2626] mt-1">•</span>
                        <span>Report any issues to group admins</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Volunteer Sign-up Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white border border-[#E5E5E5] p-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="text-[#DC2626]" size={28} />
                <h2 className="text-2xl font-semibold text-black">Volunteer in Pune</h2>
              </div>
              <p className="text-base text-[#212121] mb-8">
                Help me feed animals in your area. Sign up as a volunteer and make a difference in your neighborhood.
              </p>
              <form onSubmit={handleVolunteerSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area in Pune *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => setFormData({ ...formData, area: value })}
                      required
                      disabled={loading}
                    >
                      <SelectTrigger id="area" className="w-full">
                        <SelectValue placeholder="Select your area" />
                      </SelectTrigger>
                      <SelectContent>
                        {puneAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Textarea
                    id="availability"
                    placeholder="e.g., Weekends 9 AM - 12 PM, or Flexible on weekdays..."
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    required
                    disabled={loading}
                    rows={4}
                  />
                  <p className="text-sm text-[#212121]">
                    Tell us when you're available to help feed animals in your area
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                {message && (
                  <div
                    className={`p-4 border ${
                      message.type === "success"
                        ? "bg-[#FAFAFA] text-[#212121] border-[#E5E5E5]"
                        : "bg-[#FAFAFA] text-[#DC2626] border-[#DC2626]"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#DC2626] text-white hover:opacity-80"
                  size="lg"
                >
                  {loading ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Heart className="mr-2" size={20} />
                      Sign Up as Volunteer
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 p-6 bg-[#FAFAFA] border border-[#E5E5E5]">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#DC2626] mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold mb-2 text-black">What Volunteers Do</h4>
                    <ul className="space-y-1 text-sm text-[#212121]">
                      <li>• Help identify hungry animals in your area</li>
                      <li>• Coordinate feeding schedules with other volunteers</li>
                      <li>• Share photos and updates from feeding sessions</li>
                      <li>• Report urgent cases that need immediate attention</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
