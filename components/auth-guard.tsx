"use client"

import React from "react"

import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  return <>{children}</>
}
