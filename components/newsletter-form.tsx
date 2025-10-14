"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = React.useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("[v0] Newsletter subscribe:", email)
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("w-full max-w-xl rounded-xl border border-input bg-card p-2 shadow-sm", className)}
    >
      <div className="flex items-center gap-2">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border-0 bg-transparent focus-visible:ring-0"
          required
        />
        <Button type="submit" className="rounded-xl px-5">
          Subscribe
        </Button>
      </div>
    </form>
  )
}
