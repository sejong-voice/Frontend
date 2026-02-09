"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

const AUTH_STORAGE_KEY = "sejong-sinmungo-auth"

interface AuthState {
  isLoggedIn: boolean
  studentId: string | null
  name: string | null
}

interface AuthContextValue extends AuthState {
  login: (studentId: string, name: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function getStoredAuth(): AuthState {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, studentId: null, name: null }
  }
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as AuthState
      if (parsed.isLoggedIn && parsed.studentId) {
        return parsed
      }
    }
  } catch {
    // ignore parse errors
  }
  return { isLoggedIn: false, studentId: null, name: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(getStoredAuth)

  useEffect(() => {
    try {
      if (auth.isLoggedIn) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
      } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch {
      // sessionStorage unavailable
    }
  }, [auth])

  const login = useCallback((studentId: string, name: string) => {
    setAuth({ isLoggedIn: true, studentId, name })
  }, [])

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, studentId: null, name: null })
  }, [])

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
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
