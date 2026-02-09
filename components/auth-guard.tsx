"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth()

  // SSR/hydration-safe: always render neutral skeleton first
  if (loading) {
    return <div className="min-h-screen bg-background" />
  }

  if (!user) {
    return <LoginScreen />
  }

  return <>{children}</>
}
