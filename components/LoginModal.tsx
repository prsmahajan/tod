"use client"

import Link from "next/link"
import { ReactNode } from "react"

interface LoginModalProps {
  children: ReactNode
}

export function LoginModal({ children }: LoginModalProps) {
  return (
    <Link href="/login">
      {children}
    </Link>
  )
}
