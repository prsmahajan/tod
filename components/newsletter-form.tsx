"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to join waitlist" })
        setLoading(false)
        return
      }

      setMessage({ type: "success", text: `🎉 Success! You're position #${data.position} on the waitlist!` })
      setEmail("")
      setLoading(false)
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
      setLoading(false)
    }
  }

  return (
    <div className={cn("w-full max-w-xl", className)}>
      <form
        onSubmit={onSubmit}
        className="border-b border-[#E5E5E5] dark:border-[#404040] pb-2"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border-0 border-b border-[#E5E5E5] dark:border-[#404040] rounded-none bg-transparent text-black dark:text-white placeholder:text-[#212121] dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-[#212121] dark:focus-visible:border-white px-0"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            className="bg-[#DC2626] text-white hover:opacity-80 transition-opacity rounded-lg px-5 py-2 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Waitlist"}
          </Button>
        </div>
      </form>

      {message && (
        <p
          className={cn(
            "mt-3 text-center text-sm",
            message.type === "success" ? "text-[#212121] dark:text-gray-300" : "text-[#DC2626]"
          )}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
