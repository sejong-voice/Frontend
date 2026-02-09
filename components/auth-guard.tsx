"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth()

  // Show login screen while loading OR when not authenticated
  // This prevents a blank screen if the /api/auth/me call is slow
  if (!user) {
    return <LoginScreen />
  }

  // Authenticated: loading is done and user exists
  return <>{children}</>
}
