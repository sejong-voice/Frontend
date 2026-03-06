"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { SiteHeader } from "@/components/layout/site-header"

/**
 * Thin wrapper that reads auth context and passes user info
 * to SiteHeader via props. SiteHeader itself has no auth dependency.
 */
export function ConnectedHeader() {
  const { user, logout } = useAuth()
  return (
    <SiteHeader
      userName={user?.studentNo}
      userRole={user?.role}
      onLogout={logout}
    />
  )
}
