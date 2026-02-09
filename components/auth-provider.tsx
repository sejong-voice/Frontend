"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

export interface AuthUser {
  id: string
  name: string
  role: "student" | "admin"
}

interface AuthContextValue {
  loading: boolean
  user: AuthUser | null
  isAdmin: boolean
  refreshMe: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  const refreshMe = useCallback(async () => {
    console.log("[v0] refreshMe: start")
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" })
      console.log("[v0] refreshMe: /api/auth/me status", res.status)
      if (res.ok) {
        const data = (await res.json()) as AuthUser
        console.log("[v0] refreshMe: user data", data)
        setUser(data)
      } else {
        const errBody = await res.text()
        console.log("[v0] refreshMe: not ok, body:", errBody)
        setUser(null)
      }
    } catch (err) {
      console.log("[v0] refreshMe: error", err)
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

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider value={{ loading, user, isAdmin, refreshMe, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
