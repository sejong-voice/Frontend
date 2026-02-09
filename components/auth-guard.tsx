"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth()

  // Still checking auth — show a neutral spinner, NOT login screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Auth check done, not logged in
  if (!user) {
    return <LoginScreen />
  }

  return <>{children}</>
}
