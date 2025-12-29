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

      setMessage({ type: "success", text: `Success! You're position #${data.position} on the waitlist!` })
      setEmail("")
      setLoading(false)
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
      setLoading(false)
    }
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 px-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Waitlist"}
          </Button>
        </div>
      </form>

      {message && (
        <div
          className={cn(
            "mt-4 text-center text-sm font-medium",
            message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
