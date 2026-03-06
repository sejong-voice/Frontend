"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react"

// User role and status types
export type UserRole = "STUDENT" | "ADMIN" | "SUPER"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "WITHDRAWN"

export interface AuthUser {
  id: number
  studentNo: string
  name: string
  department: string
  role: UserRole
  status: UserStatus
  managedCouncilIds?: number[] // Only for ADMIN role
}

interface AuthContextValue {
  loading: boolean
  user: AuthUser | null
  // Convenience helpers
  isActive: boolean
  isAdmin: boolean
  isSuper: boolean
  canManageCouncil: (councilId: number) => boolean
  // Actions
  refreshMe: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      if (res.ok) {
        const data = (await res.json()) as AuthUser
        setUser(data)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // ignore
    }
    setUser(null)
  }, [])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  // Computed permission helpers
  const isActive = user?.status === "ACTIVE"
  const isAdmin = user?.role === "ADMIN"
  const isSuper = user?.role === "SUPER"

  const canManageCouncil = useCallback(
    (councilId: number): boolean => {
      if (!user) return false
      if (user.role === "SUPER") return true
      if (user.role === "ADMIN" && user.managedCouncilIds?.includes(councilId)) {
        return true
      }
      return false
    },
    [user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      isActive,
      isAdmin,
      isSuper,
      canManageCouncil,
      refreshMe,
      logout,
    }),
    [loading, user, isActive, isAdmin, isSuper, canManageCouncil, refreshMe, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
